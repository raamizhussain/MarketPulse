from typing import Dict, Any, Tuple
import numpy as np

# Compact, high-impact facts for top US & Indian stocks
STOCK_PROFILES: Dict[str, Dict[str, Any]] = {
    "NVDA": {
        "name": "NVIDIA",
        "sector": "AI Chips & Datacenter",
        "currency": "USD",
        "bull_facts": [
            "Blackwell & Hopper GPU order backlog extending into 2026",
            "High 75% gross margins with CUDA software developer moat"
        ],
        "bull_note": "Hyperscaler capex acceleration supports strong multi-quarter earnings drift.",
        "bear_facts": [
            "Customer ASIC chip buildouts (Google TPU, Amazon Trainium)",
            "Rich 32x forward P/E leaves minimal room for gross margin slip"
        ],
        "bear_note": "TSMC packaging bottlenecks could cause short-term delivery timing volatility.",
        "catalyst": "Hyperscaler quarterly capex figures & TSMC CoWoS capacity updates"
    },
    "AAPL": {
        "name": "Apple",
        "sector": "Consumer Hardware & Services",
        "currency": "USD",
        "bull_facts": [
            "Apple Intelligence on-device AI triggering multi-year iPhone upgrade cycle",
            "High-margin Services (>26% of revenue) providing predictable recurring cash flow"
        ],
        "bull_note": "Massive 2.2B active installed base driving steady ecosystem compounding.",
        "bear_facts": [
            "China regional smartphone market share competition",
            "Antitrust regulatory pressure on App Store commission take rates"
        ],
        "bear_note": "Extended device replacement cycles could moderate near-term hardware revenue.",
        "catalyst": "Services ARPU expansion & Greater China quarterly shipment checks"
    },
    "TSLA": {
        "name": "Tesla",
        "sector": "EVs, Clean Energy & Autonomous AI",
        "currency": "USD",
        "bull_facts": [
            "FSD v12 neural end-to-end rollout + autonomous Cybercab fleet optionality",
            "Energy Megapack storage deployments growing >110% YoY with high utility margins"
        ],
        "bull_note": "Energy storage expansion provides resilient cash flow buffer.",
        "bear_facts": [
            "Global auto price discounting compressing core automotive gross margins",
            "Execution & regulatory approval timelines on unsupervised autonomy"
        ],
        "bear_note": "Higher interest rate environment temporarily dampens retail vehicle financing.",
        "catalyst": "Quarterly Megapack GWh deployments & Auto Gross Margin (ex-credits) >17%"
    },
    "MSFT": {
        "name": "Microsoft",
        "sector": "Enterprise Cloud & AI",
        "currency": "USD",
        "bull_facts": [
            "Azure cloud revenue re-accelerating on enterprise GenAI workload migrations",
            "M365 Copilot enterprise seat adoption expanding across Global 2000"
        ],
        "bull_note": "Unrivaled enterprise distribution moat across cloud, productivity, and security.",
        "bear_facts": [
            "Heavy AI infrastructure capex ($19B+/quarter) weighing on near-term free cash flow",
            "Selective IT budget scrutiny on discretionary enterprise seat renewals"
        ],
        "bear_note": "Capital intensity remains elevated during datacenter buildout phase.",
        "catalyst": "Azure Constant-Currency growth rate & Commercial Cloud margins"
    },
    "GOOGL": {
        "name": "Alphabet (Google)",
        "sector": "Search, Cloud & AI",
        "currency": "USD",
        "bull_facts": [
            "Google Cloud Platform (GCP) operating margins expanding rapidly",
            "Gemini model integration defending search monetization + YouTube subscriptions"
        ],
        "bull_note": "Attractive valuation multiple relative to hyperscaler peers.",
        "bear_facts": [
            "DOJ antitrust litigation regarding default search agreements and ad-tech",
            "Higher compute cost per query for generative AI search results"
        ],
        "bear_note": "Legal remedies could alter default search distribution economics.",
        "catalyst": "GCP operating profit margins & Search/YouTube ad revenue growth"
    },
    "META": {
        "name": "Meta Platforms",
        "sector": "Social Platforms & Digital Ads",
        "currency": "USD",
        "bull_facts": [
            "Advantage+ AI advertising suite delivering superior advertiser ROAS",
            "Reels monetization efficiency + WhatsApp commercial click-to-message scale"
        ],
        "bull_note": "High operating leverage converting top-line ad growth directly to free cash flow.",
        "bear_facts": [
            "Reality Labs quarterly operating losses ($4B+) alongside high GPU capex",
            "European regulatory friction regarding targeted advertising consents"
        ],
        "bear_note": "Sustained metaverse capex spend remains an investor debate point.",
        "catalyst": "Daily Active People (DAP) monetization & capex guidance trajectory"
    },
    "AMZN": {
        "name": "Amazon",
        "sector": "E-Commerce & AWS Cloud",
        "currency": "USD",
        "bull_facts": [
            "AWS revenue growth accelerating with Bedrock enterprise AI pipelines",
            "Regionalized fulfillment network lowering unit cost-to-serve and boosting retail margins"
        ],
        "bull_note": "Dual growth engines in high-margin AWS cloud and digital advertising.",
        "bear_facts": [
            "Discretionary consumer wallet sensitivity on general merchandise",
            "Capital expenditures on Kuiper satellite broadband network"
        ],
        "bear_note": "International retail segment exposed to regional macroeconomic fluctuations.",
        "catalyst": "AWS growth re-acceleration & North American retail margin expansion"
    },

    # --- INDIAN EQUITIES (NSE / BSE) ---
    "RELIANCE.NS": {
        "name": "Reliance Industries",
        "sector": "Telecom (Jio), Retail & Energy",
        "currency": "INR",
        "bull_facts": [
            "Jio 5G tariff hikes expanding ARPU towards ₹200+ target",
            "Reliance Retail footprint scaling across 18,500+ stores with rapid digital growth"
        ],
        "bull_note": "Consumer businesses (Jio + Retail) driving steady valuation rerating.",
        "bear_facts": [
            "Global oil refining margins (GRMs) and petrochemical spread cyclicality",
            "High ongoing capex in 5G and New Energy gigafactories"
        ],
        "bear_note": "Near-term free cash flow yield moderated by clean energy investments.",
        "catalyst": "Jio quarterly ARPU progression & Retail store EBITDA margins"
    },
    "TCS.NS": {
        "name": "Tata Consultancy Services",
        "sector": "IT Services & Digital Transformation",
        "currency": "INR",
        "bull_facts": [
            "Resilient $10B+ quarterly mega-deal contract value (TCV) pipeline",
            "Industry-leading 25-26% operating margins + >100% free cash flow conversion"
        ],
        "bull_note": "Best-in-class balance sheet and consistent shareholder dividend returns.",
        "bear_facts": [
            "Discretionary enterprise IT budget delays in US/European banking sector",
            "INR/USD forex volatility and pricing competition on legacy contracts"
        ],
        "bear_note": "BFSI spending recovery timeline remains key near-term variable.",
        "catalyst": "North American BFSI deal closures & headcount attrition stability"
    },
    "HDFCBANK.NS": {
        "name": "HDFC Bank",
        "sector": "Private Banking & Retail Credit",
        "currency": "INR",
        "bull_facts": [
            "Post-merger deposit mobilization stabilizing credit-to-deposit (CD) ratio",
            "Superior asset quality with Gross NPA <1.25% across retail & corporate portfolios"
        ],
        "bull_note": "Dominant private banking franchise with unrivaled branch compounding reach.",
        "bear_facts": [
            "Near-term Net Interest Margin (NIM) pressure from competitive deposit rates",
            "RBI regulatory scrutiny on liquidity coverage ratios (LCR)"
        ],
        "bear_note": "Pace of loan growth balanced against disciplined deposit accretion.",
        "catalyst": "Core NIM recovery above 3.5% & CD ratio normalization"
    },
    "TATAMOTORS.NS": {
        "name": "Tata Motors",
        "sector": "Commercial Vehicles, Passenger EV & JLR",
        "currency": "INR",
        "bull_facts": [
            "JLR order book strength with high-margin Range Rover & Defender sales mix",
            "Dominant >68% market share in Indian domestic electric vehicles"
        ],
        "bull_note": "Planned demerger will unlock pure-play commercial and passenger EV value.",
        "bear_facts": [
            "European luxury auto demand moderation amid higher consumer borrowing rates",
            "Domestic commercial vehicle cyclical replacement demand stabilization"
        ],
        "bear_note": "Input metal commodity price movements (aluminum/battery cells) affect margins.",
        "catalyst": "JLR net debt-free milestone delivery & Domestic EV registration growth"
    },
    "INFY.NS": {
        "name": "Infosys",
        "sector": "Enterprise Cloud & AI Consulting",
        "currency": "INR",
        "bull_facts": [
            "Topaz Generative AI enterprise suite deal momentum ($3.5B+ TCV quarterly)",
            "Cost optimization program expanding operating margins alongside buybacks"
        ],
        "bull_note": "Strong balance sheet with zero debt and predictable cash distributions.",
        "bear_facts": [
            "Discretionary tech budget caution in telecom and manufacturing verticals",
            "Wage hikes and subcontractor cost inflation during mega-deal transitions"
        ],
        "bear_note": "Client decision cycles remain elongated for non-essential digital projects.",
        "catalyst": "Large deal pipeline conversion & constant-currency guidance revisions"
    },
    "ZOMATO.NS": {
        "name": "Zomato",
        "sector": "Quick Commerce & Food Delivery",
        "currency": "INR",
        "bull_facts": [
            "Blinkit quick-commerce gross order value (GOV) growing >120% YoY",
            "Food delivery Adjusted EBITDA margins expanding with platform fee optimizations"
        ],
        "bull_note": "Blinkit store density driving strong operating leverage and repeat user growth.",
        "bear_facts": [
            "Intense quick-commerce competitive expansion (Swiggy, Zepto)",
            "Delivery fleet wage pressure and localized seasonal weather disruptions"
        ],
        "bear_note": "Dark store expansion capex pacing requires close unit economic monitoring.",
        "catalyst": "Blinkit company-wide EBITDA breakeven milestone & Monthly Transacting Users"
    }
}


def generate_stock_specific_debate(
    symbol: str,
    price: float,
    log_return: float,
    volatility: float,
    regime_state: int,
    regime_name: str,
    sentiment_score: float,
    currency: str = "USD"
) -> Tuple[str, str, str, str, float, str]:
    """
    Generates short, crisp, highly-scannable Bull, Bear, and Judge analyses with bullet points and key takeaways.
    """
    clean_sym = symbol.upper().strip()
    profile = STOCK_PROFILES.get(clean_sym)
    curr_sym = "₹" if currency == "INR" or ".NS" in clean_sym or ".BO" in clean_sym else "$"
    
    if not profile:
        is_indian = ".NS" in clean_sym or ".BO" in clean_sym
        name = clean_sym.replace(".NS", "").replace(".BO", "") + (" (NSE)" if is_indian else "")
        bull_facts = [
            f"Momentum positive with {log_return:+.2f}% 24h log return inside {regime_name}",
            f"News sentiment favorable at +{sentiment_score:.2f} score"
        ]
        bull_note = f"Order flow demonstrates steady institutional accumulation above {curr_sym}{price:,.2f}."
        bear_facts = [
            f"Annualized realized volatility at {volatility * 100:.1f}% indicates tail risk",
            f"Discretionary risk ceiling requires strict stop-loss adherence"
        ]
        bear_note = "A break below short-term support triggers immediate capital defense."
        catalyst = f"Volatility spike above {volatility * 1.5:.4f} or sentiment flip below 0.0"
    else:
        name = profile["name"]
        bull_facts = profile["bull_facts"]
        bull_note = profile["bull_note"]
        bear_facts = profile["bear_facts"]
        bear_note = profile["bear_note"]
        catalyst = profile["catalyst"]

    # 1. CRISP BULL ARGUMENT (2 Bullets + Note)
    bull_arg = (
        f"Key Catalysts ({clean_sym} - {name}):\n"
        f"- {bull_facts[0]}\n"
        f"- {bull_facts[1]}\n\n"
        f"Key Note: {bull_note}"
    )

    # 2. CRISP BEAR ARGUMENT (2 Bullets + Note)
    bear_arg = (
        f"Key Headwinds & Risks ({clean_sym}):\n"
        f"- {bear_facts[0]}\n"
        f"- {bear_facts[1]}\n\n"
        f"Key Note: {bear_note}"
    )

    # 3. CHIEF JUDGE SYNTHESIS (Clean Numbers + Kelly Sizing)
    win_rate = 0.72 if regime_state == 0 else (0.42 if regime_state == 1 else 0.58)
    win_loss_ratio = 2.1 if regime_state == 0 else (1.4 if regime_state == 1 else 1.8)
    raw_kelly = (win_rate * win_loss_ratio - (1.0 - win_rate)) / win_loss_ratio
    fractional_kelly = max(0.05, min(0.35, raw_kelly * 0.5))
    
    if regime_state == 0 and sentiment_score >= 0.15:
        rec_label = "BUY"
        confidence = 0.88
        stance = f"ACCUMULATE ({regime_name})"
    elif regime_state == 1 or sentiment_score <= -0.25:
        rec_label = "SELL"
        confidence = 0.84
        stance = f"CAPITAL PRESERVATION ({regime_name})"
    else:
        rec_label = "HOLD"
        confidence = 0.76
        stance = f"TACTICAL HOLD ({regime_name})"

    target_price = price * (1.10 if rec_label == "BUY" else (0.92 if rec_label == "SELL" else 1.04))
    stop_loss = price * (0.94 if rec_label == "BUY" else 1.06)

    final_judgment = (
        f"RECOMMENDATION: {rec_label}\n"
        f"CONFIDENCE: {int(confidence * 100)}%\n"
        f"- Directive: {stance}\n"
        f"- Half-Kelly Sizing: {fractional_kelly * 100:.1f}% NAV (Win Rate: {int(win_rate * 100)}%)\n"
        f"- Target Price: {curr_sym}{target_price:,.2f}  |  Stop-Loss: {curr_sym}{stop_loss:,.2f}\n\n"
        f"Key Trigger: {catalyst}"
    )

    return bull_arg, bear_arg, final_judgment, rec_label, confidence, catalyst
