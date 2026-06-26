import asyncio
from datetime import datetime, timedelta, timezone
from alpaca.data.historical.news import NewsClient
from alpaca.data.requests import NewsRequest
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pandas as pd

# 🔑 Alpaca API Credentials
ALPACA_API_KEY    = "PKFRQFCJ42X4FL3WAXLEOD5TWL"
ALPACA_SECRET_KEY = "AScC3Bvgh6xvdR93N3En5U6zBwVW7iAEer5jxfHMud6T"

# Initialize VADER globally for performance
sia = SentimentIntensityAnalyzer()

# Adjust VADER lexicon with financial-domain weights
financial_context_tweaks = {
    'crush': 2.0, 'beat': 1.5, 'miss': -2.0, 'down': -1.0,
    'drop': -1.5, 'rally': 2.0, 'surge': 2.5, 'growth': 1.5
}
sia.lexicon.update(financial_context_tweaks)

# =====================================================================
# SENTIMENT PROCESSING LAYER
# =====================================================================
def analyze_headline_sentiment(text: str) -> float:
    """Passes text through VADER and returns a compound score from -1.0 to +1.0."""
    if not text:
        return 0.0
    scores = sia.polarity_scores(text)
    return float(scores['compound'])


# =====================================================================
# FETCH LIVE TICKER NEWS & AGGREGATE SENTIMENT
# =====================================================================
async def fetch_ticker_news_sentiment(symbol: str, days_back: int = 7) -> pd.DataFrame:
    """Queries Alpaca's news API for a stock symbol and aggregates sentiment metrics."""
    print(f"📰 Connecting to Alpaca News Wire for {symbol}...")

    client = NewsClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)

    end_time   = datetime.now(timezone.utc)
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

        # ✅ FIX: NewsSet stores articles in .data["news"], NOT .news
        articles_raw = news_payload.data.get("news", [])

        if not articles_raw:
            print(f"   ⚠️ No articles found for {symbol} over the last {days_back} days.")
            return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])

        processed_articles = []
        for article in articles_raw:
            headline  = article.headline or ""
            summary   = article.summary  or ""
            timestamp = article.created_at

            # Strip timezone info for clean DataFrame display
            if timestamp and timestamp.tzinfo is not None:
                timestamp = timestamp.replace(tzinfo=None)

            sentiment_score = analyze_headline_sentiment(headline)

            processed_articles.append({
                'created_at': timestamp,
                'headline':   headline,
                'sentiment':  sentiment_score,
                'source':     article.source
            })

        df          = pd.DataFrame(processed_articles)
        avg_sentiment = df['sentiment'].mean()
        print(f"   ✅ Ingested {len(df)} articles. Avg Sentiment Score: {avg_sentiment:+.4f}")
        return df.sort_values('created_at', ascending=False).reset_index(drop=True)

    except Exception as e:
        print(f"❌ Sentiment extraction failed for {symbol}: {e}")
        return pd.DataFrame(columns=['created_at', 'headline', 'sentiment', 'source'])


# =====================================================================
# ENTRY POINT
# =====================================================================
async def main():
    target_stock = "NVDA"
    news_df = await fetch_ticker_news_sentiment(target_stock, days_back=7)

    if not news_df.empty:
        print("\n📝 Sample Headlines & Sentiment Scores:")
        print(news_df[['created_at', 'sentiment', 'headline']].head(10).to_string(index=False))


if __name__ == "__main__":
    asyncio.run(main())