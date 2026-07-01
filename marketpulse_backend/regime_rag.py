import os
import chromadb
import numpy as np
import pandas as pd

# Initialize a persistent local vector database directory
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "chroma_data")
chroma_client = chromadb.PersistentClient(path=DB_PATH)

# Create or extract our targeted structural regime collection
collection = chroma_client.get_or_create_collection(name="regime_episodes")

def index_historical_regime_shifts(df: pd.DataFrame):
    """
    Scans a sorted dataframe to locate regime shift transition windows 
    and saves them as structured context records inside ChromaDB.
    """
    print("🧠 Extracting historical regime shift memories into ChromaDB...")
    
    # Ensure sequential chronology per instrument block
    df = df.sort_values(['symbol', 'created_at']).reset_index(drop=True)
    
    # Identify index coordinates where states differ from the previous record
    state_changes = df['hidden_state'].diff() != 0
    shift_indices = df[state_changes & (df['symbol'] == df['symbol'].shift(1))].index
    
    ids = []
    embeddings = []
    metadatas = []
    documents = []
    
    for idx in shift_indices:
        prev_row = df.iloc[idx - 1]
        curr_row = df.iloc[idx]
        
        timestamp_str = curr_row['created_at'].strftime("%Y-%m-%d %H:%M")
        symbol = curr_row['symbol']
        state_from = int(prev_row['hidden_state'])
        state_to = int(curr_row['hidden_state'])
        
        # Use our engineered quantitative values as the direct numerical embedding space!
        # [Scaled Return Component, Scaled Volatility Component]
        feature_vector = [float(curr_row['log_return']), float(curr_row['realized_volatility'])]
        
        # Human-readable descriptive document context
        doc_summary = (
            f"On {timestamp_str}, {symbol} underwent a regime transition from "
            f"State {state_from} to State {state_to}. At the boundary, log return registered "
            f"{curr_row['log_return']:.4f}% with an active realized volatility scale of {curr_row['realized_volatility']:.6f}."
        )
        
        unique_id = f"{symbol}_{idx}_{state_from}_to_{state_to}"
        
        ids.append(unique_id)
        embeddings.append(feature_vector)
        metadatas.append({
            "symbol": symbol,
            "timestamp": timestamp_str,
            "state_from": state_from,
            "state_to": state_to
        })
        documents.append(doc_summary)
        
    if ids:
        batch_size = 4000
        total_items = len(ids)
        print(f"   📦 Splitting {total_items} items into chunked database batches...")
        # Batch insert raw elements into local vector database memory space
        for i in range(0, total_items, batch_size):
            end_idx = min(i + batch_size, total_items)
            
            collection.upsert(
                ids=ids[i:end_idx],
                embeddings=embeddings[i:end_idx],
                metadatas=metadatas[i:end_idx],
                documents=documents[i:end_idx]
            )
            print(f"      Processed chunk {i} to {end_idx}...")
        print(f"   ✅ Successfully indexed {len(ids)} micro-regime shift milestones into ChromaDB.\n")
    else:
        print("   ⚠️ No historical transition milestones detected.")

def query_similar_regime_episodes(log_return: float, realized_volatility: float, n_results: int = 3) -> list:
    """
    Retrieves the nearest historical matching market conditions based 
    on mathematical proximity in the engineered 2D feature matrix.
    """
    query_vector = [float(log_return), float(realized_volatility)]
    
    try:
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=n_results
        )
        return results.get("documents", [[]])[0]
    except Exception as e:
        return [f"Query failed to retrieve contextual database logs: {e}"]

if __name__ == "__main__":
    # Local component diagnostic testing loop
    from marketpulse_backend.regime_detector import fetch_all_warehouse_data, calculate_multi_asset_features, train_robust_regime_model
    import asyncio
    
    async def run_test():
        raw_df = await fetch_all_warehouse_data()
        proc_df = calculate_multi_asset_features(raw_df)
        _, final_df = train_robust_regime_model(proc_df)
        
        index_historical_regime_shifts(final_df)
        
        print("🔍 Testing Retrieval Matcher...")
        sample_match = query_similar_regime_episodes(log_return=-1.5, realized_volatility=2.5)
        for doc in sample_match:
            print(f"   Matched Milestone: {doc}")
            
    asyncio.run(run_test())