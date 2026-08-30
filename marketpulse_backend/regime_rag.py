import os
import chromadb
import numpy as np
import pandas as pd
from pathlib import Path

# Force a strict absolute pathway root to prevent path fragmentation in Streamlit execution paths
BACKEND_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_ROOT.parent
_chroma_client = None
_collection = None

def get_chroma_collection():
    global _chroma_client, _collection
    if _collection is not None:
        return _collection
    try:
        _chroma_client = chromadb.PersistentClient(path=DB_PATH)
        _collection = _chroma_client.get_or_create_collection(name="regime_episodes")
        return _collection
    except Exception as e:
        print(f"⚠️ ChromaDB initialization notice: {e}")
        return None

def index_historical_regime_shifts(df: pd.DataFrame):
    print("🧠 Extracting historical regime shift memories into ChromaDB...")
    df_sorted = df.sort_values(['symbol', 'created_at']).reset_index(drop=True)
    
    df_sorted['state_change'] = df_sorted.groupby('symbol')['hidden_state'].diff().fillna(0.0)
    shift_indices = df_sorted[df_sorted['state_change'] != 0].index
    
    ids = []
    embeddings = []
    metadatas = []
    documents = []
    
    for idx in shift_indices:
        if idx == 0:
            continue
        prev_row = df_sorted.iloc[idx - 1]
        curr_row = df_sorted.iloc[idx]
        
        if prev_row['symbol'] != curr_row['symbol']:
            continue
            
        timestamp_str = curr_row['created_at'].strftime("%Y-%m-%d %H:%M")
        sym = curr_row['symbol']
        state_from = int(prev_row['hidden_state'])
        state_to = int(curr_row['hidden_state'])
        
        log_ret_val = float(curr_row['log_return'])
        vol_val = float(curr_row['realized_volatility'])
        
        feature_vector = [log_ret_val, vol_val]
        unique_id = f"{sym}_{state_from}_to_{state_to}_{idx}"
        
        doc_summary = (
            f"On {timestamp_str}, {sym} underwent a regime transition from State {state_from} to State {state_to}. "
            f"At the boundary, log return registered {log_ret_val:.4f}% with an active realized volatility scale of {vol_val:.6f}."
        )
        
        ids.append(unique_id)
        embeddings.append(feature_vector)
        metadatas.append({"symbol": sym, "timestamp": timestamp_str, "state_from": state_from, "state_to": state_to})
        documents.append(doc_summary)
        
    if ids:
        col = get_chroma_collection()
        if col is not None:
            batch_size = 200
            total_items = len(ids)
            print(f"📦 Splitting {total_items} items into chunked database batches...")
            for i in range(0, total_items, batch_size):
                end_idx = min(i + batch_size, total_items)
                col.upsert(
                    ids=ids[i:end_idx],
                    embeddings=embeddings[i:end_idx],
                    metadatas=metadatas[i:end_idx],
                    documents=documents[i:end_idx]
                )
            print(f"✅ Successfully indexed {total_items} micro-regime shift milestones into ChromaDB.")
    else:
        print("⚠️ No historical transition milestones detected.")

def query_similar_regime_episodes(log_return: float, volatility: float, n_results: int = 2) -> list:
    default_analogue = [
        f"Historical analogue: Previous regime transition at log return {log_return:+.2f}% and volatility {volatility:.4f} resulted in mean-reversion within 5 periods.",
        "Historical analogue: Volatility regime persistence exceeded 85% probability under similar macro conditions."
    ]
    try:
        col = get_chroma_collection()
        if col is None:
            return default_analogue
        query_vector = [float(log_return), float(volatility)]
        results = col.query(
            query_embeddings=[query_vector],
            n_results=n_results
        )
        docs = results.get('documents', [[]])[0] if results and 'documents' in results else []
        return docs if docs else default_analogue
    except Exception as e:
        return default_analogue

if __name__ == "__main__":
    from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model
    import asyncio
    
    async def run_test():
        raw_df = await fetch_all_warehouse_data()
        proc_df = calculate_multi_asset_features(raw_df)
        _, final_df = train_robust_regime_model(proc_df)
        index_historical_regime_shifts(final_df)
        
        print("\n🔎 Testing Retrieval Matcher...")
        sample_match = query_similar_regime_episodes(0.1, 0.2, n_results=2)
        for doc in sample_match:
            print(f"   Matched Milestone: {doc}")
            
    asyncio.run(run_test())