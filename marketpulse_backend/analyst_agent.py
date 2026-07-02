import os
import asyncio
import pandas as pd
import google.generativeai as genai
from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model
from marketpulse_backend.sentiment_analyzer import fetch_ticker_news_sentiment

# Retrieve the securely stored environment token
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# =====================================================================
# AGENT TOOLSET DEFINITION LAYER
# =====================================================================
def get_market_context_summary(symbol: str) -> str:
    """
    Queries the PostgreSQL warehouse and runs the machine learning model 
    to extract the current price, volatility, and active market regime state.
    """
    try:
        # Run async warehouse routines inside a localized sync block container
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            raw_df = loop.run_until_complete(fetch_all_warehouse_data())
            if raw_df.empty:
                return f"Error: Data warehouse table is currently empty for {symbol}."
                
            processed_df = calculate_multi_asset_features(raw_df)
            _, final_df = train_robust_regime_model(processed_df)
            
            # Filter specifically down to the requested asset
            asset_df = final_df[final_df['symbol'] == symbol.upper()].sort_values('created_at')
            if asset_df.empty:
                return f"No records found specifically mapping out ticker symbol {symbol}."
                
            latest = asset_df.iloc[-1]
            regime_txt = "🔴 TURBULENT / CRITICAL RISK" if latest['hidden_state'] == 1 else "🟢 STABLE / LOW RISK"
            
            summary_msg = (
                f"--- {symbol.upper()} CURRENT QUANT METRICS ---\n"
                f"Timestamp: {latest['created_at']}\n"
                f"Latest Closing Price: ${latest['price']:.2f}\n"
                f"Calculated 1-Minute Log Return: {latest['log_return']:.4f}%\n"
                f"Rolling 20-Period Realized Volatility: {latest['realized_volatility']:.6f}\n"
                f"Active AI Regime State Assignment: {regime_txt}\n"
            )
            return summary_msg
        finally:
            loop.close()
    except Exception as e:
        return f"Tool Execution Failure: Couldn't parse market states. Details: {e}"

def get_recent_news_sentiment_summary(symbol: str) -> str:
    """
    Connects live to the institutional news wire and returns a summary 
    of recent breaking headlines alongside their computed NLP text scores.
    """
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            news_df = loop.run_until_complete(fetch_ticker_news_sentiment(symbol.upper(), days_back=3))
            if news_df.empty:
                return f"No recent news wire records found over the last 3 days for {symbol}."
                
            avg_score = news_df['sentiment'].mean()
            
            # Compile a compact text string block of the top 5 raw news records
            news_lines = [f"--- LIVE NEWS WIRE & VADER SENTIMENT MAP FOR {symbol.upper()} (Average Mood: {avg_score:+.4f}) ---"]
            for _, row in news_df.head(5).iterrows():
                news_lines.append(f"• [{row['created_at'].strftime('%m-%d %H:%M')}] (Score: {row['sentiment']:+.2f}) -> {row['headline']}")
                
            return "\n".join(news_lines)
        finally:
            loop.close()
    except Exception as e:
        return f"Tool Execution Failure: Couldn't aggregate news streams. Details: {e}"

# =====================================================================
# AGENT ORCHESTRATION LAYER
# =====================================================================
def run_analyst_agent_query(user_prompt: str) -> str:
    """Orchestrates an interactive chat interface backed by live tool-calling options."""
    if not API_KEY:
        return "❌ Agent Configuration Warning: GEMINI_API_KEY variable is missing from system context environment."
        
    # Bind our explicit analytical functions into the LLM Tool-Calling container
    market_analyst_model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        tools=[get_market_context_summary, get_recent_news_sentiment_summary],
        system_instruction=(
            "You are an elite, institutional-grade Quantitative Research Analyst Agent inside the MarketPulse AI platform. "
            "Your role is to reason over complex probabilistic Hidden Markov Model data and raw financial news streams to provide crisp, "
            "mathematically rigorous insights. Always prefer executing your tools to check real-time parameters before explaining market events. "
            "Be direct, avoid generic advice, and speak with high technical confidence."
        )
    )
    
    # Fire up an automated function-calling conversation sequence
    chat = market_analyst_model.start_chat(enable_automatic_function_calling=True)
    
    response = chat.send_message(user_prompt)
    return response.text

# Quick verification block to test tool compilation
if __name__ == "__main__":
    print("🤖 Booting Local Analyst Agent Session...")
    test_query = "Check the active metrics for NVDA and explain if its current volatility matches the recent news mood."
    print(f"User Query: {test_query}\n")
    agent_output = run_analyst_agent_query(test_query)
    print("\n🏢 QUANT ANALYST AGENT RESPONSE:")
    print(agent_output)