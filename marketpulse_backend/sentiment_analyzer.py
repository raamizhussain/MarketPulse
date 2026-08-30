import asyncio
import os
import re
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Any

import pandas as pd
from alpaca.data.historical.news import NewsClient
from alpaca.data.requests import NewsRequest
from groq import Groq


ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")

NEWS_COLUMNS = ["created_at", "headline", "sentiment", "source"]
NEWS_FETCH_TIMEOUT_SECONDS = float(os.getenv("MARKETPULSE_NEWS_TIMEOUT_SECONDS", "5"))
GROQ_SENTIMENT_TIMEOUT_SECONDS = float(os.getenv("MARKETPULSE_GROQ_SENTIMENT_TIMEOUT_SECONDS", "3"))
MAX_NEWS_ARTICLES_TO_SCORE = int(os.getenv("MARKETPULSE_NEWS_HEADLINE_LIMIT", "5"))


def empty_news_df() -> pd.DataFrame:
    return pd.DataFrame(columns=NEWS_COLUMNS)


def safe_log(message: str) -> None:
    """Avoid UnicodeEncodeError in Windows terminals with legacy encodings."""
    try:
        print(message)
    except UnicodeEncodeError:
        print(message.encode("ascii", errors="replace").decode("ascii"))


def resolve_groq_api_key() -> str | None:
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


def build_news_client() -> NewsClient:
    client = NewsClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    original_request = client._session.request

    def request_with_timeout(method: str, url: str, **kwargs: Any) -> Any:
        kwargs.setdefault("timeout", NEWS_FETCH_TIMEOUT_SECONDS)
        return original_request(method, url, **kwargs)

    client._session.request = request_with_timeout
    return client


def extract_articles(news_payload: Any) -> list[Any]:
    if news_payload is None:
        return []

    if isinstance(news_payload, dict):
        return list(news_payload.get("news", []) or [])

    data = getattr(news_payload, "data", None)
    if isinstance(data, dict):
        return list(data.get("news", []) or [])

    articles = getattr(news_payload, "news", None)
    return list(articles or [])


def article_value(article: Any, field: str, default: Any = None) -> Any:
    if isinstance(article, dict):
        return article.get(field, default)
    return getattr(article, field, default)


def normalize_timestamp(timestamp: Any) -> Any:
    if timestamp is not None and getattr(timestamp, "tzinfo", None) is not None:
        return timestamp.replace(tzinfo=None)
    return timestamp


GROQ_API_KEY = resolve_groq_api_key()
groq_client = Groq(api_key=GROQ_API_KEY, timeout=GROQ_SENTIMENT_TIMEOUT_SECONDS) if GROQ_API_KEY else None


def analyze_headline_sentiment(text: str) -> float:
    if not text or not groq_client:
        return 0.0

    try:
        prompt = (
            "You are a financial sentiment analysis tool. Analyze the following headline and score its sentiment "
            "strictly with a single floating-point number between -1.0 (extremely negative/bearish) and +1.0 "
            "(extremely positive/bullish). Neutral headlines must be 0.0. Output ONLY the raw number, nothing else."
            f"\n\nHeadline: {text}"
        )
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            max_tokens=10,
            timeout=GROQ_SENTIMENT_TIMEOUT_SECONDS,
        )
        raw_value = (completion.choices[0].message.content or "").strip()
        match = re.search(r"[-+]?(?:\d*\.\d+|\d+)", raw_value)
        if not match:
            return 0.0
        score = float(match.group(0))
        return max(-1.0, min(1.0, score))
    except Exception:
        return 0.0


def articles_to_sentiment_frame(articles_raw: list[Any]) -> pd.DataFrame:
    if not articles_raw:
        return empty_news_df()

    processed_articles = []
    for article in articles_raw[:MAX_NEWS_ARTICLES_TO_SCORE]:
        headline = article_value(article, "headline", "") or ""
        processed_articles.append({
            "created_at": normalize_timestamp(article_value(article, "created_at")),
            "headline": headline,
            "sentiment": analyze_headline_sentiment(headline),
            "source": article_value(article, "source", "Unknown") or "Unknown",
        })

    if not processed_articles:
        return empty_news_df()

    df = pd.DataFrame(processed_articles, columns=NEWS_COLUMNS)
    return df.sort_values("created_at", ascending=False, na_position="last").reset_index(drop=True)


def build_news_request(symbol: str, days_back: int) -> NewsRequest:
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=days_back)
    return NewsRequest(
        symbols=symbol,
        start=start_time,
        end=end_time,
        limit=MAX_NEWS_ARTICLES_TO_SCORE,
    )


async def fetch_ticker_news_sentiment(symbol: str, days_back: int = 7) -> pd.DataFrame:
    safe_log(f"Connecting to Alpaca News Wire for {symbol} (Groq sentiment, async)...")
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        safe_log("Sentiment extraction skipped: Alpaca credentials are missing.")
        return empty_news_df()

    try:
        client = build_news_client()
        request_params = build_news_request(symbol, days_back)
        loop = asyncio.get_running_loop()
        news_payload = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: client.get_news(request_params)),
            timeout=NEWS_FETCH_TIMEOUT_SECONDS + 1,
        )
        return articles_to_sentiment_frame(extract_articles(news_payload))
    except Exception as exc:
        safe_log(f"Sentiment extraction failed for {symbol}: {type(exc).__name__}: {exc}")
        return empty_news_df()


def fetch_ticker_news_sentiment_sync(symbol: str, days_back: int = 7) -> pd.DataFrame:
    safe_log(f"Connecting to Alpaca News Wire for {symbol} (Groq sentiment, sync)...")
    if not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        safe_log("Sentiment extraction skipped: Alpaca credentials are missing.")
        return empty_news_df()

    try:
        client = build_news_client()
        news_payload = client.get_news(build_news_request(symbol, days_back))
        return articles_to_sentiment_frame(extract_articles(news_payload))
    except Exception as exc:
        safe_log(f"Sentiment extraction failed for {symbol}: {type(exc).__name__}: {exc}")
        return empty_news_df()


if __name__ == "__main__":
    async def test():
        df = await fetch_ticker_news_sentiment("NVDA", days_back=3)
        print(df.head())

    asyncio.run(test())
