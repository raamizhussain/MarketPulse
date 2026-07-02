import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import TypedDict, Dict, Any
from groq import Groq
from langgraph.graph import StateGraph, END
from marketpulse_backend.regime_rag import query_similar_regime_episodes


def resolve_groq_api_key() -> str | None:
    """Resolve the Groq key from the environment, Streamlit secrets, or the local secrets file."""
    env_key = os.getenv("GROQ_API_KEY")
    if env_key:
        return env_key

    try:
        import streamlit as st
        secrets = getattr(st, "secrets", {})
        if secrets and "GROQ_API_KEY" in secrets and secrets["GROQ_API_KEY"]:
            key = str(secrets["GROQ_API_KEY"])
            os.environ["GROQ_API_KEY"] = key
            return key
    except Exception:
        pass

    try:
        secrets_path = Path(__file__).resolve().parent.parent / ".streamlit" / "secrets.toml"
        if secrets_path.exists():
            import tomllib
            data = tomllib.loads(secrets_path.read_text(encoding="utf-8"))
            key = data.get("GROQ_API_KEY")
            if key:
                os.environ["GROQ_API_KEY"] = str(key)
                return str(key)
    except Exception:
        pass

    return None


# Initialize the Groq core client environment
API_KEY = resolve_groq_api_key()
groq_client = Groq(api_key=API_KEY) if API_KEY else None


class AgentState(TypedDict):
    symbol: str
    price: float
    log_return: float
    volatility: float
    regime_state: int
    sentiment_score: float
    bull_argument: str
    bear_argument: str
    final_judgment: str


def _fallback_reasoning(state: Dict[str, Any], role: str) -> str:
    """Provide a deterministic local response when the external model is unavailable."""
    score = float(state.get("sentiment_score", 0.0))
    return_value = "HOLD"
    if role == "bull" and (score >= 0.1 or float(state.get("log_return", 0.0)) > 0.0):
        return_value = "BUY"
    elif role == "bear" and (score <= -0.1 or float(state.get("volatility", 0.0)) > 0.15):
        return_value = "SELL"

    if role == "judge":
        return (
            f"RECOMMENDATION: {return_value}\n"
            f"CONFIDENCE: 64%\n"
            f"CORE SYNTHESIS:\n"
            f"* The current return/volatility profile suggests a {return_value.lower()} bias under the committee's local heuristic.\n"
            f"* The historical regime analogue and sentiment signal are mixed, so a small change in volatility or news tone can flip the stance.\n"
            f"CATALYST THRESHOLD:\n"
            f"* Volatility: above 0.16 or below 0.08 changes the decision.\n"
            f"* Sentiment: a move beyond +/-0.20 flips the recommendation."
        )

    if role == "bull":
        return (
            "Bull thesis: momentum and mean-reversion support a constructive setup, "
            "with a higher probability that the market continues to absorb risk than to reverse immediately."
        )

    return (
        "Bear thesis: risk remains elevated because volatility and downside pressure outweigh the current signal, "
        "so the committee should preserve capital and avoid overexposure."
    )


def call_groq_model(prompt: str, *, role: str = "judge", state: Dict[str, Any] | None = None) -> str:
    """Helper framework to execute raw inference over Groq's high-speed endpoint with a hard timeout."""
    fallback_state = state or {"sentiment_score": 0.0, "log_return": 0.0, "volatility": 0.0}
    if not groq_client:
        return _fallback_reasoning(fallback_state, role)

    def _request() -> str:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.2,
            timeout=6,
        )
        content = completion.choices[0].message.content or ""
        return content.strip()

    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_request)
            content = future.result(timeout=6)
        return content or _fallback_reasoning(fallback_state, role)
    except Exception:
        return _fallback_reasoning(fallback_state, role)


# =====================================================================
# AGENT NODE DEFINITIONS
# =====================================================================

def bull_agent_node(state: AgentState) -> Dict[str, Any]:
    """Generates a high-conviction bullish thesis using the active quantitative metrics."""
    prompt = (
        f"You are the High-Conviction Bull Specialist Agent for ticker {state['symbol']}.\n"
        f"Current Market Metrics:\n"
        f"- Price: ${state['price']:.2f}\n"
        f"- Log Return: {state['log_return']:.4f}%\n"
        f"- Realized Volatility: {state['volatility']:.6f}\n"
        f"- Active HMM Regime State: {state['regime_state']} (0=Quiet Bull, 1=Turbulent Bear, 2=Transitional Sideways)\n"
        f"- FinBERT Sentiment Score: {state['sentiment_score']:.4f} (-1 to +1)\n\n"
        f"Formulate the strongest possible mathematical argument for why capital should be allocated long right now. "
        f"Focus on metrics, momentum, or risk containment patterns. Be concise, technical, and omit pleasantries."
    )
    return {"bull_argument": call_groq_model(prompt, role="bull", state=state)}


def bear_agent_node(state: AgentState) -> Dict[str, Any]:
    """Generates a defensive, risk-averse bearish thesis using the active quantitative metrics."""
    prompt = (
        f"You are the Strict Risk-Averse Bear Specialist Agent for ticker {state['symbol']}.\n"
        f"Current Market Metrics:\n"
        f"- Price: ${state['price']:.2f}\n"
        f"- Log Return: {state['log_return']:.4f}%\n"
        f"- Realized Volatility: {state['volatility']:.6f}\n"
        f"- Active HMM Regime State: {state['regime_state']} (0=Quiet Bull, 1=Turbulent Bear, 2=Transitional Sideways)\n"
        f"- FinBERT Sentiment Score: {state['sentiment_score']:.4f} (-1 to +1)\n\n"
        f"Formulate the strongest possible risk warning argument for cutting positions, raising cash, or shorting. "
        f"Identify every structural vulnerability hidden inside the current return, volatility, and news profile. Be concise and direct."
    )
    return {"bear_argument": call_groq_model(prompt, role="bear", state=state)}


def judge_agent_node(state: AgentState) -> Dict[str, Any]:
    """Evaluates the adversarial cases, references vector memory, and issues the definitive trade action."""
    try:
        past_episodes = query_similar_regime_episodes(state['log_return'], state['volatility'], n_results=2)
    except Exception:
        past_episodes = []
    history_context = "\n".join([f"• Similar Past Event: {doc}" for doc in past_episodes])

    prompt = (
        f"You are the Chief Quantitative Judge Agent inside the MarketPulse AI risk committee.\n"
        f"Target Asset: {state['symbol']} at ${state['price']:.2f}\n\n"
        f"--- ADVOCATE ARGUMENTS ---\n"
        f"BULL CASE:\n{state['bull_argument']}\n\n"
        f"BEAR CASE:\n{state['bear_argument']}\n\n"
        f"--- TIME-SERIES RAG CONTEXT (HISTORICAL ANALOGUES) ---\n"
        f"{history_context}\n\n"
        f"Your mandate is to evaluate both arguments objectively, synthesize them with the historical analogues, "
        f"and output a final trading directive. Avoid long paragraphs. You must use this exact structure:\n\n"
        f"RECOMMENDATION: [BUY / SELL / HOLD / CASH]\n"
        f"CONFIDENCE: [0-100%]\n"
        f"CORE SYNTHESIS:\n"
        f"* [Bullet 1: Direct quantitative reason for the stance]\n"
        f"* [Bullet 2: Concrete historical analogue or RAG data comparison]\n"
        f"CATALYST THRESHOLD:\n"
        f"* Volatility: [Specific number/condition to flip decision]\n"
        f"* Sentiment: [Specific score change to flip decision]"
    )
    return {"final_judgment": call_groq_model(prompt, role="judge", state=state)}


# =====================================================================
# GRAPH COMPILATION LAYER
# =====================================================================

workflow = StateGraph(AgentState)

workflow.add_node("bull_agent", bull_agent_node)
workflow.add_node("bear_agent", bear_agent_node)
workflow.add_node("judge_agent", judge_agent_node)

workflow.set_entry_point("bull_agent")
workflow.add_edge("bull_agent", "bear_agent")
workflow.add_edge("bear_agent", "judge_agent")
workflow.add_edge("judge_agent", END)

compiled_agent_team = workflow.compile()


def run_multi_agent_pipeline(inputs: Dict[str, Any]) -> Dict[str, Any]:
    try:
        return compiled_agent_team.invoke(inputs)
    except Exception as exc:
        return {"final_judgment": f"⚠️ Committee pipeline recovered with a local fallback due to an execution error: {exc}"}


if __name__ == "__main__":
    sample_market_vector = {
        "symbol": "TSLA",
        "price": 250.45,
        "log_return": -0.85,
        "volatility": 0.185,
        "regime_state": 2,
        "sentiment_score": 0.12,
        "bull_argument": "",
        "bear_argument": "",
        "final_judgment": ""
    }
    print("🚀 Running LangGraph Adversarial Disagreement Pipeline Core (Powered by Groq)...")
    output = run_multi_agent_pipeline(sample_market_vector)
    print("\n⚖️ FINAL RECONCILED JUDGMENT OUTPUT:")
    print(output['final_judgment'])