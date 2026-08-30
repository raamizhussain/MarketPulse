import csv
import io
from typing import List
from marketpulse_api.schemas.strategy import TradeResponse, StrategyPerformanceResponse


def export_trades_to_csv(trades: List[TradeResponse]) -> str:
    """Generates clean CSV text formatted for institutional ledger auditing."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Trade ID",
        "Timestamp",
        "Symbol",
        "Action",
        "Quantity",
        "Execution Price ($)",
        "PnL ($)",
        "PnL (%)",
        "Regime State",
        "Sentiment Score",
        "Model Confidence",
        "Tags"
    ])

    for t in trades:
        writer.writerow([
            t.id,
            t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            t.symbol,
            t.action,
            t.quantity,
            f"{t.price:.2f}",
            f"{t.pnl:.2f}",
            f"{t.pnl_percent:.2f}%",
            t.regime_at_trade,
            f"{t.sentiment_at_trade:+.2f}",
            f"{t.recommendation_confidence * 100:.1f}%",
            t.tags or ""
        ])

    return output.getvalue()


def generate_executive_html_report(
    perf: StrategyPerformanceResponse,
    user_name: str = "Institutional Trader"
) -> str:
    """Generates an institutional PDF-ready HTML performance tear sheet."""
    return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>MarketPulse AI - Strategy Performance Tear Sheet</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; background: #0B0F17; color: #E5E7EB; }}
        .header {{ border-bottom: 2px solid #374151; padding-bottom: 20px; margin-bottom: 30px; }}
        .title {{ font-size: 26px; font-weight: bold; color: #60A5FA; margin: 0; }}
        .subtitle {{ font-size: 14px; color: #9CA3AF; margin-top: 5px; }}
        .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }}
        .card {{ background: #111827; border: 1px solid #1F2937; border-radius: 8px; padding: 15px; }}
        .card-label {{ font-size: 12px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.05em; }}
        .card-value {{ font-size: 22px; font-weight: bold; margin-top: 5px; }}
        .positive {{ color: #10B981; }}
        .negative {{ color: #EF4444; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; background: #111827; border-radius: 8px; overflow: hidden; }}
        th, td {{ padding: 12px 15px; text-align: left; border-bottom: 1px solid #1F2937; }}
        th {{ background: #1F2937; color: #9CA3AF; font-size: 12px; text-transform: uppercase; }}
        .footer {{ margin-top: 40px; font-size: 11px; color: #6B7280; text-align: center; border-top: 1px solid #1F2937; padding-top: 15px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">📈 MarketPulse AI: Executive Tear Sheet</h1>
        <div class="subtitle">Strategy: {perf.strategy_name} | Generated for: {user_name}</div>
    </div>

    <div class="grid">
        <div class="card">
            <div class="card-label">Current Equity</div>
            <div class="card-value">${perf.current_equity:,.2f}</div>
        </div>
        <div class="card">
            <div class="card-label">Total Return</div>
            <div class="card-value positive">+{perf.total_return_pct:.2f}%</div>
        </div>
        <div class="card">
            <div class="card-label">Sharpe Ratio</div>
            <div class="card-value positive">{perf.sharpe_ratio:.2f}</div>
        </div>
        <div class="card">
            <div class="card-label">Max Peak Drawdown</div>
            <div class="card-value negative">{perf.max_drawdown * 100:.2f}%</div>
        </div>
    </div>

    <div class="grid">
        <div class="card">
            <div class="card-label">Win Rate</div>
            <div class="card-value">{perf.win_rate * 100:.1f}%</div>
        </div>
        <div class="card">
            <div class="card-label">Profit Factor</div>
            <div class="card-value">{perf.profit_factor:.2f}</div>
        </div>
        <div class="card">
            <div class="card-label">Sortino Ratio</div>
            <div class="card-value positive">{perf.sortino_ratio:.2f}</div>
        </div>
        <div class="card">
            <div class="card-label">Total Executions</div>
            <div class="card-value">{perf.total_trades}</div>
        </div>
    </div>

    <h3>Monthly Performance Attribution</h3>
    <table>
        <thead>
            <tr>
                <th>Month</th>
                <th>Strategy Return</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            {"".join([f'<tr><td>{k}</td><td class="{"positive" if v >= 0 else "negative"}">{v*100:+.2f}%</td><td>{"Profitable" if v >= 0 else "Controlled Loss"}</td></tr>' for k, v in perf.monthly_returns.items()])}
        </tbody>
    </table>

    <div class="footer">
        Confidential Institutional Quantitative Intelligence Document. Engineered via MarketPulse AI Multi-Agent Engine.
    </div>
</body>
</html>"""
