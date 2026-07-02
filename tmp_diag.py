import os
import traceback
print('cwd', os.getcwd())
from marketpulse_backend.multi_agent_core import run_multi_agent_pipeline
print('API_KEY', bool(os.getenv('GROQ_API_KEY')))
inp = {'symbol':'AAPL','price':100.0,'log_return':0.1,'volatility':0.2,'regime_state':0,'sentiment_score':0.1,'bull_argument':'','bear_argument':'','final_judgment':''}
print('running')
out = run_multi_agent_pipeline(inp)
print('RESULT', out)
