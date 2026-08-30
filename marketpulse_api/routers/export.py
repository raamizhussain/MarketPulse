from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.models.user import User
from marketpulse_api.services.strategy_service import get_user_strategies, get_strategy_trades, get_strategy_by_id
from marketpulse_api.services.export_service import export_trades_to_csv, generate_executive_html_report
from marketpulse_api.routers.deps import get_current_user

router = APIRouter(prefix="/export", tags=["Data Export & Audit Reporting"])


@router.get("/trades")
async def export_trades(
    strategy_id: str = Query(..., description="Target Strategy ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Exports all trade execution logs for a strategy in CSV format."""
    trades = await get_strategy_trades(db, strategy_id, current_user.id, limit=500)
    csv_data = export_trades_to_csv(trades)

    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=marketpulse_trades_{strategy_id[:8]}.csv"}
    )


@router.get("/performance-report")
async def export_performance_report(
    strategy_id: str = Query(..., description="Target Strategy ID"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generates an institutional PDF-ready HTML performance tear sheet."""
    s = await get_strategy_by_id(db, strategy_id, current_user.id)
    html_content = generate_executive_html_report(s.performance, current_user.full_name or "Institutional Trader")

    return Response(
        content=html_content,
        media_type="text/html",
        headers={"Content-Disposition": f"inline; filename=marketpulse_tear_sheet_{strategy_id[:8]}.html"}
    )
