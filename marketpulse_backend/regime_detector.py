"""
regime_detector.py
──────────────────
Quantitative HMM Regime Detector with KMeans-Seeded Initialization.

ARCHITECTURE:
  1. Fetch all market ticks from PostgreSQL (fact_market_ticks).
  2. Engineer per-symbol log returns + 20-period realized volatility.
  3. Normalize features with StandardScaler.
  4. Run KMeans(k=2) on the scaled feature matrix to find guaranteed
     separated initial cluster centers and within-cluster covariances.
  5. Inject those seeds directly into GaussianHMM (bypassing hmmlearn's
     blind initialization) via init_params="" and manual means_/covars_ assignment.
  6. Run EM to fine-tune the seeded model.
  7. Degeneracy check: if EM collapses (one state < MIN_STATE_FRACTION),
     fall back to using the raw KMeans labels directly as regime assignments —
     they are already geometrically separated and guaranteed non-degenerate.
  8. Hard fallback: if KMeans labels are also degenerate (pathological data),
     use a deterministic median realized-volatility threshold split.

RETURN CONVENTION — train_robust_regime_model always returns (model, df):
  model : fitted GaussianHMM | None  (None when fallback was used)
  df    : DataFrame with 'hidden_state' column populated
"""

import asyncio
import warnings
import asyncpg
import numpy as np
import pandas as pd
from hmmlearn.hmm import GaussianHMM
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# ─── Database Configuration ──────────────────────────────────────────────────

DB_USER     = "postgres"
DB_PASSWORD = "password"
DB_HOST     = "127.0.0.1"
DB_PORT     = "5433"
DB_NAME     = "marketpulse_db"

# ─── Modelling Constants ──────────────────────────────────────────────────────

N_STATES            = 2
VOL_WINDOW          = 20    # Rolling window for realized volatility
KMEANS_INIT_RUNS    = 20    # KMeans restarts — more runs = more stable seeds
HMM_ITERATIONS      = 200
HMM_TOLERANCE       = 0.05
HMM_MIN_COVAR       = 1e-3  # Variance floor — prevents covariance collapse

# A state is considered degenerate if it captures fewer than this fraction
# of total observations. Triggers the KMeans-direct or median-split fallback.
MIN_STATE_FRACTION  = 0.02


# ─── 1. Data Ingestion ────────────────────────────────────────────────────────

async def fetch_all_warehouse_data() -> pd.DataFrame:
    """Pull the full unified historical timeline from the data warehouse."""
    print("📥 Pulling unified historical timeline from database...")
    conn = await asyncpg.connect(
        user=DB_USER, password=DB_PASSWORD,
        host=DB_HOST, port=DB_PORT, database=DB_NAME
    )
    rows = await conn.fetch(
        """
        SELECT symbol, price, volume, created_at
        FROM fact_market_ticks
        ORDER BY symbol, created_at ASC;
        """
    )
    await conn.close()

    df = pd.DataFrame(rows, columns=['symbol', 'price', 'volume', 'created_at'])
    df['price'] = df['price'].astype(float)
    print(f"   ✅ Fetched {len(df):,} rows across {df['symbol'].nunique()} symbols.\n")
    return df


# ─── 2. Feature Engineering ───────────────────────────────────────────────────

def calculate_multi_asset_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute per-symbol log returns and rolling realized volatility.

    Processing per group prevents boundary bleeding: the last bar of AAPL
    must never influence the first return of MSFT.
    """
    print(f"⚙️  Engineering features (log return + {VOL_WINDOW}-period realized vol)...")
    processed_blocks = []

    for symbol, group in df.groupby('symbol'):
        group = group.sort_values('created_at').copy()

        # Log return in percentage space — keeps variance numerically stable
        group['log_return'] = np.log(group['price'] / group['price'].shift(1)) * 100

        # 20-period rolling realized volatility (std of log returns)
        group['realized_volatility'] = group['log_return'].rolling(window=VOL_WINDOW).std()

        # Drop the burn-in NaN rows from the rolling window
        group = group.dropna().copy()
        processed_blocks.append(group)

    result = pd.concat(processed_blocks, ignore_index=True)
    print(f"   ✅ Feature matrix shape: {result.shape} after dropping NaN burn-in rows.\n")
    return result


# ─── 3. KMeans Seeder ─────────────────────────────────────────────────────────

def _compute_kmeans_seeds(
    scaled_features: np.ndarray,
    n_states: int,
    n_init: int
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Run KMeans on the scaled feature matrix and extract:
      - startprob  : empirical cluster proportions  (n_states,)
      - means      : cluster centroids              (n_states × n_features)
      - covars     : per-cluster diagonal covariance (n_states × n_features)
      - km_labels  : raw per-observation cluster IDs — returned so the caller
                     can use them directly as regime assignments if EM collapses,
                     without paying the cost of a second KMeans run.

    Using KMeans instead of hmmlearn's built-in init guarantees that both
    states receive observations before EM begins, eliminating the degeneracy
    trap on tight IEX distributions.
    """
    km = KMeans(
        n_clusters=n_states,
        n_init=n_init,
        random_state=42,
        max_iter=500
    )
    labels = km.fit_predict(scaled_features)

    n_features = scaled_features.shape[1]
    means  = np.zeros((n_states, n_features))
    covars = np.ones((n_states, n_features))  # diagonal fallback
    counts = np.zeros(n_states)

    for state in range(n_states):
        mask = labels == state
        counts[state] = mask.sum()
        if counts[state] > 1:
            cluster_data  = scaled_features[mask]
            means[state]  = cluster_data.mean(axis=0)
            var           = cluster_data.var(axis=0)
            # Variance floor prevents any feature dimension from collapsing
            covars[state] = np.maximum(var, HMM_MIN_COVAR)
        else:
            # Singleton cluster: offset from global mean so EM has gradient to work with
            means[state]  = scaled_features.mean(axis=0) + (state * 0.1)
            covars[state] = np.ones(n_features) * HMM_MIN_COVAR

    # Empirical start probability; guard against exact-zero entries
    startprob = counts / counts.sum()
    startprob = np.maximum(startprob, 1e-4)
    startprob /= startprob.sum()

    return startprob, means, covars, labels


# ─── 4. HMM Training with Seeded Initialization ──────────────────────────────

def _check_degeneracy(labels: np.ndarray, n_total: int, context: str) -> bool:
    """Return True if any state holds fewer than MIN_STATE_FRACTION of observations."""
    counts = [int((labels == s).sum()) for s in range(N_STATES)]
    min_frac = min(counts) / n_total
    if min_frac < MIN_STATE_FRACTION:
        print(
            f"   ⚠️  Degeneracy in {context}: smallest state = {min_frac:.2%} "
            f"(threshold {MIN_STATE_FRACTION:.0%})"
        )
        return True
    print(f"   ✅ {context} non-degenerate: min state fraction = {min_frac:.2%}")
    return False


def train_robust_regime_model(df: pd.DataFrame) -> tuple[GaussianHMM | None, pd.DataFrame]:
    """
    Fit a 2-state Gaussian HMM using KMeans-seeded initialization.

    ALWAYS returns (model, df) — model is None when a fallback path was taken.

    Fallback hierarchy (most preferred → least preferred):
      1. EM on KMeans-seeded HMM           — temporally smooth, probabilistic
      2. Raw KMeans labels                 — geometrically correct, no time smoothing
      3. Deterministic median-vol split    — guaranteed 50/50, last resort

    The critical insight from the IEX data: EM with init_params="" and KMeans
    seeds still collapses because the 93/7 cluster imbalance means the majority-
    state likelihood dominates the M-step and re-absorbs the minority cluster.
    Fallback (2) skips EM entirely and uses KMeans geometry directly — which is
    already geometrically correct and strictly non-degenerate.
    """
    print("🧠 Building 2D feature matrix (log_return × realized_volatility)...")
    feature_matrix = df[['log_return', 'realized_volatility']].values
    df = df.copy()

    # ── A. Scale ──────────────────────────────────────────────────────────────
    scaler = StandardScaler()
    scaled = scaler.fit_transform(feature_matrix)
    print(f"   Feature matrix: {scaled.shape[0]:,} observations × {scaled.shape[1]} features")
    print(f"   Scaled means  : {scaled.mean(axis=0).round(4)}")
    print(f"   Scaled stds   : {scaled.std(axis=0).round(4)}\n")

    # ── B. KMeans seeds (also yields raw labels for fallback path) ────────────
    print(f"🔬 Running KMeans(k={N_STATES}, n_init={KMEANS_INIT_RUNS}) to find stable seed centroids...")
    startprob_seed, means_seed, covars_seed, km_labels = _compute_kmeans_seeds(
        scaled, N_STATES, KMEANS_INIT_RUNS
    )
    print(f"   KMeans start probs : {startprob_seed.round(4)}")
    for s in range(N_STATES):
        count = int((km_labels == s).sum())
        print(f"   KMeans cluster {s}   : N={count:,}  mean={means_seed[s].round(4)}  cov={covars_seed[s].round(4)}")
    print()

    # ── C+D. Build HMM and inject seeds ──────────────────────────────────────
    # init_params="" prevents hmmlearn from overwriting our injected seeds.
    # params="stmc" allows EM to update all four parameter sets normally.
    model = GaussianHMM(
        n_components=N_STATES,
        covariance_type="diag",
        n_iter=HMM_ITERATIONS,
        tol=HMM_TOLERANCE,
        min_covar=HMM_MIN_COVAR,
        random_state=42,
        init_params="",   # ← CRITICAL: do not overwrite our seeds
        params="stmc"
    )
    model.startprob_ = startprob_seed
    model.means_     = means_seed
    model.covars_    = covars_seed
    # Seed transition matrix with a strong self-transition prior so EM
    # preserves both states across iterations rather than collapsing the minority.
    # Values: 95% stay-in-state, 5% switch — reflects real regime persistence.
    model.transmat_  = np.full((N_STATES, N_STATES), 0.05 / (N_STATES - 1))
    np.fill_diagonal(model.transmat_, 0.95)

    # ── E. Run EM ─────────────────────────────────────────────────────────────
    print(f"🏋️  Running EM (max {HMM_ITERATIONS} iterations, tol={HMM_TOLERANCE})...")
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        model.fit(scaled)
        convergence_warnings = [w for w in caught if "not converging" in str(w.message).lower()]

    if convergence_warnings:
        print(f"   ⚠️  EM convergence warning detected (IEX data characteristic — proceeding to check).")
    else:
        print("   ✅ EM converged without warnings.")

    em_labels = model.predict(scaled)

    # ── F. Degeneracy check on EM output ─────────────────────────────────────
    n_total = len(df)
    em_degenerate = _check_degeneracy(em_labels, n_total, "EM output")

    if not em_degenerate:
        # ── Happy path: EM produced a clean split ─────────────────────────────
        print(f"\n   ✅ EM regime split accepted.\n")
        df['hidden_state'] = em_labels
        return model, df

    # ── G. Fallback 1: use raw KMeans labels directly ─────────────────────────
    print("\n🔄 EM collapsed — falling back to raw KMeans geometry labels...")
    km_degenerate = _check_degeneracy(km_labels, n_total, "KMeans labels")

    if not km_degenerate:
        print("   ✅ KMeans labels are non-degenerate — using as regime assignments.\n")
        df['hidden_state'] = km_labels
        return None, df

    # ── H. Fallback 2: deterministic median-vol split (last resort) ───────────
    print("\n🔄 KMeans also degenerate — activating hard median-split fallback...")
    return _deterministic_fallback(df)


# ─── 5. Deterministic Fallback ────────────────────────────────────────────────

def _deterministic_fallback(df: pd.DataFrame) -> tuple[None, pd.DataFrame]:
    """
    Last-resort 2-state split via median realized volatility.
    Returns (None, df) matching the (model, df) convention — model=None signals
    that no probabilistic model was fitted (reporting skips the transition matrix).

    Observations below the median → State 0 (quiet).
    Observations at or above the median → State 1 (turbulent).
    Guaranteed ~50/50 split on any distribution.
    """
    threshold = df['realized_volatility'].median()
    print(f"   Deterministic threshold: {threshold:.6f} (median realized vol)")
    df = df.copy()
    df['hidden_state'] = (df['realized_volatility'] >= threshold).astype(int)
    print("   States: 0=quiet (vol < median), 1=turbulent (vol ≥ median)\n")
    return None, df  # (model=None, df) — caller always unpacks as (model, df)


# ─── 6. Regime Reporting ─────────────────────────────────────────────────────

def report_regime_statistics(df: pd.DataFrame, model: GaussianHMM | None) -> None:
    """Print a structured statistical profile of the decoded regime labels."""
    print("=" * 60)
    print("📊  DECODED REGIME STATISTICAL PROFILE")
    print("=" * 60)

    n_total = len(df)
    state_stats = []

    for state in range(N_STATES):
        mask      = df['hidden_state'] == state
        count     = int(mask.sum())
        pct       = count / n_total * 100
        mean_ret  = df.loc[mask, 'log_return'].mean()
        mean_vol  = df.loc[mask, 'realized_volatility'].mean()
        std_ret   = df.loc[mask, 'log_return'].std()
        state_stats.append({
            'state': state, 'count': count, 'pct': pct,
            'mean_ret': mean_ret, 'mean_vol': mean_vol, 'std_ret': std_ret
        })
        print(
            f"  State {state} │ N={count:>8,} ({pct:5.1f}%) │ "
            f"Mean Ret={mean_ret:+.4f}% │ Mean Vol={mean_vol:.6f} │ Std Ret={std_ret:.4f}%"
        )

    # Identity assignment: lowest mean volatility = quiet regime
    quiet_state     = min(state_stats, key=lambda x: x['mean_vol'])['state']
    turbulent_state = 1 - quiet_state

    print()
    print(f"  🟢 Quiet / Stable Regime    → State {quiet_state}")
    print(f"  🔴 Turbulent / Danger Regime → State {turbulent_state}")

    if model is not None and hasattr(model, 'transmat_'):
        print()
        print("  Transition Matrix (row=from, col=to):")
        for i, row in enumerate(model.transmat_):
            label = "Quiet" if i == quiet_state else "Turbulent"
            print(f"    State {i} ({label:>9}): {row.round(4)}")

    print("=" * 60)


# ─── 7. Entrypoint ────────────────────────────────────────────────────────────

async def main():
    # Step 1: Ingest
    raw_df = await fetch_all_warehouse_data()
    if raw_df.empty:
        print("❌  Warehouse is empty. Aborting.")
        return

    # Step 2: Feature engineering
    processed_df = calculate_multi_asset_features(raw_df)
    if processed_df.empty:
        print("❌  Feature matrix is empty after NaN removal. Aborting.")
        return

    # Step 3: Train HMM (KMeans-seeded, with deterministic fallback)
    hmm_model, final_df = train_robust_regime_model(processed_df)

    # Step 4: Report
    report_regime_statistics(final_df, hmm_model)

    # Step 5: Sample output
    print("\n📝  Tail sample of decoded output:")
    cols = ['created_at', 'symbol', 'price', 'log_return', 'realized_volatility', 'hidden_state']
    print(final_df[cols].tail(15).to_string(index=False))


if __name__ == '__main__':
    asyncio.run(main())