import asyncio
import os
from datetime import datetime, timedelta, timezone
from alpaca.data.historical.news import NewsClient
from alpaca.data.requests import NewsRequest
from groq import Groq
import pandas as pd

ALPACA_API_KEY = "PKFRQFCJ42X4FL3WAXLEOD5TWL"
ALPACA_SECRET_KEY = "AScC3Bvgh6xvdR93N3En5U6zBwVW7iAEer5jxfHMud6T"

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

def analyze_headline_sentiment(text: str) -> float:
    if not text or not groq_client:
        return 0.0
    try:
        prompt = (
            f"You are a financial sentiment analysis tool. Analyze the following headline and score its sentiment "
            f"strictly with a single floating-point number between -1.0 (extremely negative/bearish) and +1.0 (extremely positive/bullish). "
            f"Neutral headlines must be 0.0. Output ONLY the raw number, nothing else.\n\nHeadline: {text}"
        )
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            max_tokens=10
        )
        val = completion.choices[0].message.content.strip()
        return float(val)
    except:
        return 0.0

async def fetch_ticker_news_sentiment(symbol: str, days_back: int = 7) -> pd.DataFrame:
    print(f"📰 Connecting to Alpaca News Wire for {symbol} (Groq Sentiment)...")
    client = NewsClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=days_back)
    request_params = NewsRequest(
        symbols=symbol,
        start=start_time,
        end=end_time,
        limit=50
    )
    try:
        loop = asyncio.get_running_loop()
        news_payload = await loop.run_in_executor(
            None, lambda: client.get_news(request_params)
        )
        articles_raw = news_payload.data.get("news", [])
        if not articles_raw:
            return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])
        processed_articles = []
        for article in articles_raw:
            headline = article.headline or ""
            timestamp = article.created_at
            if timestamp and timestamp.tzinfo is not None:
                timestamp = timestamp.replace(tzinfo=None)
            sentiment_score = analyze_headline_sentiment(headline)
            processed_articles.append({
                'created_at': timestamp,
                'headline': headline,
                'sentiment': sentiment_score,
                'source': article.source
            })
        df = pd.DataFrame(processed_articles)
        return df.sort_values('created_at', ascending=False).reset_index(drop=True)
    except Exception as e:
        print(f"❌ Sentiment extraction failed for {symbol}: {e}")
        return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])

def fetch_ticker_news_sentiment_sync(symbol: str, days_back: int = 7) -> pd.DataFrame:
    print(f"📰 Connecting to Alpaca News Wire for {symbol} (Sync Groq Sentiment)...")
    client = NewsClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(days=days_back)
    request_params = NewsRequest(
        symbols=symbol,
        start=start_time,
        end=end_time,
        limit=50
    )
    try:
        news_payload = client.get_news(request_params)
        articles_raw = news_payload.data.get("news", [])
        if not articles_raw:
            return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])
        processed_articles = []
        for article in articles_raw:
            headline = article.headline or ""
            timestamp = article.created_at
            if timestamp and timestamp.tzinfo is not None:
                timestamp = timestamp.replace(tzinfo=None)
            sentiment_score = analyze_headline_sentiment(headline)
            processed_articles.append({
                'created_at': timestamp,
                'headline': headline,
                'sentiment': sentiment_score,
                'source': article.source
            })
        df = pd.DataFrame(processed_articles)
        return df.sort_values('created_at', ascending=False).reset_index(drop=True)
    except Exception as e:
        print(f"❌ Sentiment extraction failed for {symbol}: {e}")
        return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])
if __name__ == "__main__":
    async def test():
        df = await fetch_ticker_news_sentiment("NVDA", days_back=3)
        print(df.head())
    asyncio.run(test())