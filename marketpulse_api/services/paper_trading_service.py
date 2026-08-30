import random
import math
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from marketpulse_api.models.paper_trading import PaperPortfolio, PaperPosition, PaperOrder
from marketpulse_api.services.live_quote_service import fetch_live_stock_quote, get_live_current_regime


def generate_market_depth(ltp: float) -> Dict[str, Any]:
    """Generates realistic 5-level Bid/Ask Market Depth Ladder (Zerodha / Angel One style)."""
    spread = max(0.05, ltp * 0.0004)
    bids = []
    asks = []
    total_buy_qty = 0
    total_sell_qty = 0

    for i in range(1, 6):
        # Bids (Lower than LTP)
        bid_price = round(ltp - (spread * i) - (random.uniform(0.01, 0.05) * i), 2)
        bid_orders = random.randint(3, 45)
        bid_qty = random.randint(50, 2500) * i
        total_buy_qty += bid_qty
        bids.append({"orders": bid_orders, "qty": bid_qty, "price": bid_price})

        # Asks (Higher than LTP)
        ask_price = round(ltp + (spread * i) + (random.uniform(0.01, 0.05) * i), 2)
        ask_orders = random.randint(3, 45)
        ask_qty = random.randint(50, 2500) * i
        total_sell_qty += ask_qty
        asks.append({"orders": ask_orders, "qty": ask_qty, "price": ask_price})

    return {
        "bids": bids,
        "asks": asks,
        "total_buy_qty": total_buy_qty,
        "total_sell_qty": total_sell_qty,
        "buy_ratio": round((total_buy_qty / (total_buy_qty + total_sell_qty)) * 100, 1),
        "sell_ratio": round((total_sell_qty / (total_buy_qty + total_sell_qty)) * 100, 1),
        "lower_circuit": round(ltp * 0.90, 2),
        "upper_circuit": round(ltp * 1.10, 2)
    }


def calculate_charges(total_val: float, is_indian: bool, side: str) -> Dict[str, float]:
    """Simulates real-world exchange, statutory, and regulatory charges (SEBI/SEC, STT, GST)."""
    if is_indian:
        brokerage = 20.0  # Flat ₹20 discount brokerage
        stt = total_val * 0.001 if side == "BUY" else total_val * 0.001  # 0.1% delivery
        exch_turnover = total_val * 0.0000345
        gst = (brokerage + exch_turnover) * 0.18
        sebi_charges = total_val * 0.000001
        stamp_duty = total_val * 0.00015 if side == "BUY" else 0.0
        total_charges = round(brokerage + stt + exch_turnover + gst + sebi_charges + stamp_duty, 2)
        return {
            "brokerage": brokerage,
            "stt": round(stt, 2),
            "exchange_turnover": round(exch_turnover, 2),
            "gst": round(gst, 2),
            "total_charges": total_charges
        }
    else:
        # US zero-commission with SEC/FINRA fractional fee
        sec_fee = round(total_val * 0.0000278, 2) if side == "SELL" else 0.0
        finra_taf = round(0.000166 * 10, 2) if side == "SELL" else 0.0
        total_charges = round(sec_fee + finra_taf, 2)
        return {
            "brokerage": 0.0,
            "stt": 0.0,
            "exchange_turnover": sec_fee,
            "gst": 0.0,
            "total_charges": total_charges
        }


async def get_or_create_paper_portfolio(db: AsyncSession, user_id: str, active_symbol: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves full portfolio analytics, holdings, positions, margin, and order book."""
    query = select(PaperPortfolio).where(PaperPortfolio.user_id == user_id)
    result = await db.execute(query)
    portfolio = result.scalars().first()

    if not portfolio:
        portfolio = PaperPortfolio(
            user_id=user_id,
            cash_usd=100000.0,
            cash_inr=8000000.0,
            realized_pnl_usd=0.0,
            realized_pnl_inr=0.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(portfolio)
        await db.commit()
        await db.refresh(portfolio)

    # Fetch positions
    pos_query = select(PaperPosition).where(PaperPosition.portfolio_id == portfolio.id)
    pos_result = await db.execute(pos_query)
    positions = pos_result.scalars().all()

    holdings_list = []
    positions_list = []
    
    total_invested_usd = 0.0
    total_market_val_usd = 0.0
    total_day_pnl_usd = 0.0

    total_invested_inr = 0.0
    total_market_val_inr = 0.0
    total_day_pnl_inr = 0.0

    for pos in positions:
        quote = await fetch_live_stock_quote(pos.symbol)
        curr_price = quote.get("price", pos.average_entry_price)
        log_ret = quote.get("log_return", 0.002)
        day_change_pct = (math.exp(log_ret) - 1.0) * 100
        
        invested_amt = pos.shares * pos.average_entry_price
        current_market_val = pos.shares * curr_price
        unrealized_pnl = current_market_val - invested_amt
        unrealized_pnl_pct = (unrealized_pnl / invested_amt) * 100 if invested_amt > 0 else 0.0
        
        # Day's P&L calculation
        day_pnl = current_market_val * (day_change_pct / 100.0)
        
        pos_data = {
            "id": pos.id,
            "symbol": pos.symbol,
            "shares": pos.shares,
            "average_entry_price": round(pos.average_entry_price, 2),
            "current_price": round(curr_price, 2),
            "invested_value": round(invested_amt, 2),
            "market_value": round(current_market_val, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "unrealized_pnl_pct": round(unrealized_pnl_pct, 2),
            "day_pnl": round(day_pnl, 2),
            "day_change_pct": round(day_change_pct, 2),
            "product_type": getattr(pos, "product_type", "CNC"),
            "currency": pos.currency,
            "created_at": pos.created_at
        }

        if pos.currency == "USD":
            total_invested_usd += invested_amt
            total_market_val_usd += current_market_val
            total_day_pnl_usd += day_pnl
        else:
            total_invested_inr += invested_amt
            total_market_val_inr += current_market_val
            total_day_pnl_inr += day_pnl

        if getattr(pos, "product_type", "CNC") == "CNC":
            holdings_list.append(pos_data)
        else:
            positions_list.append(pos_data)

    # Fetch last 30 executed orders
    ord_query = select(PaperOrder).where(PaperOrder.portfolio_id == portfolio.id).order_by(PaperOrder.created_at.desc()).limit(30)
    ord_result = await db.execute(ord_query)
    orders = ord_result.scalars().all()

    # Active ticker market depth
    depth_sym = active_symbol or (positions[0].symbol if positions else "NVDA")
    quote_target = await fetch_live_stock_quote(depth_sym)
    market_depth = generate_market_depth(quote_target.get("price", 150.0))

    # Overall P&L metrics
    overall_pnl_usd = total_market_val_usd - total_invested_usd
    overall_pnl_pct_usd = (overall_pnl_usd / total_invested_usd * 100) if total_invested_usd > 0 else 0.0

    overall_pnl_inr = total_market_val_inr - total_invested_inr
    overall_pnl_pct_inr = (overall_pnl_inr / total_invested_inr * 100) if total_invested_inr > 0 else 0.0

    return {
        "portfolio_id": portfolio.id,
        # Balances
        "cash_usd": round(portfolio.cash_usd, 2),
        "cash_inr": round(portfolio.cash_inr, 2),
        "total_equity_usd": round(portfolio.cash_usd + total_market_val_usd, 2),
        "total_equity_inr": round(portfolio.cash_inr + total_market_val_inr, 2),
        # Holdings Metrics (Groww / Zerodha style)
        "total_invested_usd": round(total_invested_usd, 2),
        "total_market_val_usd": round(total_market_val_usd, 2),
        "overall_pnl_usd": round(overall_pnl_usd, 2),
        "overall_pnl_pct_usd": round(overall_pnl_pct_usd, 2),
        "day_pnl_usd": round(total_day_pnl_usd, 2),
        "day_pnl_pct_usd": round((total_day_pnl_usd / total_invested_usd * 100) if total_invested_usd > 0 else 0.0, 2),
        # INR Metrics
        "total_invested_inr": round(total_invested_inr, 2),
        "total_market_val_inr": round(total_market_val_inr, 2),
        "overall_pnl_inr": round(overall_pnl_inr, 2),
        "overall_pnl_pct_inr": round(overall_pnl_pct_inr, 2),
        "day_pnl_inr": round(total_day_pnl_inr, 2),
        "day_pnl_pct_inr": round((total_day_pnl_inr / total_invested_inr * 100) if total_invested_inr > 0 else 0.0, 2),
        # Realized Historical
        "realized_pnl_usd": round(portfolio.realized_pnl_usd, 2),
        "realized_pnl_inr": round(portfolio.realized_pnl_inr, 2),
        # Holdings & Positions Lists
        "holdings": holdings_list,
        "positions": holdings_list + positions_list,
        "market_depth": market_depth,
        "depth_symbol": depth_sym,
        "depth_price": quote_target.get("price", 150.0),
        "orders": [
            {
                "id": o.id,
                "order_id": getattr(o, "order_id", f"ORD-2026-{o.id[:6].upper()}"),
                "symbol": o.symbol,
                "side": o.side,
                "order_type": getattr(o, "order_type", "MARKET"),
                "product_type": getattr(o, "product_type", "CNC"),
                "shares": o.shares,
                "execution_price": round(o.execution_price, 2),
                "total_value": round(o.total_value, 2),
                "charges": round(getattr(o, "charges", 0.0), 2),
                "realized_pnl": round(getattr(o, "realized_pnl", 0.0), 2),
                "realized_pnl_pct": round(getattr(o, "realized_pnl_pct", 0.0), 2),
                "currency": o.currency,
                "status": o.status,
                "created_at": o.created_at
            }
            for o in orders
        ]
    }


async def execute_paper_order(
    db: AsyncSession,
    user_id: str,
    symbol: str,
    side: str,
    shares: float,
    order_type: str = "MARKET",
    product_type: str = "CNC"
) -> Dict[str, Any]:
    """Executes a realistic buy/sell paper trade with market depth, leverage, brokerage, and profit/loss calculation."""
    clean_sym = symbol.upper().strip()
    clean_side = side.upper().strip()
    clean_product = product_type.upper().strip() if product_type in ["CNC", "MIS"] else "CNC"

    if shares <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than zero.")
    if clean_side not in ["BUY", "SELL"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Side must be BUY or SELL.")

    # Get live quote
    quote = await fetch_live_stock_quote(clean_sym)
    exec_price = quote.get("price", 100.0)
    is_indian = ".NS" in clean_sym or ".BO" in clean_sym or quote.get("currency") == "INR"
    currency = "INR" if is_indian else "USD"
    curr_sym = "₹" if is_indian else "$"

    total_order_val = shares * exec_price
    charges_info = calculate_charges(total_order_val, is_indian, clean_side)
    net_charges = charges_info["total_charges"]

    # Get user portfolio
    query = select(PaperPortfolio).where(PaperPortfolio.user_id == user_id)
    result = await db.execute(query)
    portfolio = result.scalars().first()
    if not portfolio:
        portfolio = PaperPortfolio(
            user_id=user_id,
            cash_usd=100000.0,
            cash_inr=8000000.0,
            realized_pnl_usd=0.0,
            realized_pnl_inr=0.0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(portfolio)
        await db.flush()

    # Find position if existing
    pos_query = select(PaperPosition).where(
        PaperPosition.portfolio_id == portfolio.id,
        PaperPosition.symbol == clean_sym
    )
    pos_res = await db.execute(pos_query)
    position = pos_res.scalars().first()

    realized_pnl = 0.0
    realized_pnl_pct = 0.0
    sell_summary = None

    if clean_side == "BUY":
        # Required margin (MIS gets 5x leverage / 20% margin requirement)
        required_cash = (total_order_val * 0.20 if clean_product == "MIS" else total_order_val) + net_charges

        if currency == "USD":
            if portfolio.cash_usd < required_cash:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient USD cash. Required: ${required_cash:,.2f}, Available: ${portfolio.cash_usd:,.2f}"
                )
            portfolio.cash_usd -= required_cash
        else:
            if portfolio.cash_inr < required_cash:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient INR cash. Required: ₹{required_cash:,.2f}, Available: ₹{portfolio.cash_inr:,.2f}"
                )
            portfolio.cash_inr -= required_cash

        # Update position
        if position:
            new_shares = position.shares + shares
            position.average_entry_price = ((position.shares * position.average_entry_price) + total_order_val) / new_shares
            position.shares = new_shares
            position.updated_at = datetime.now(timezone.utc)
        else:
            position = PaperPosition(
                portfolio_id=portfolio.id,
                symbol=clean_sym,
                shares=shares,
                average_entry_price=exec_price,
                currency=currency,
                product_type=clean_product,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(position)

    elif clean_side == "SELL":
        if not position or position.shares < shares:
            held = position.shares if position else 0.0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient shares to sell for {clean_sym}. Held: {held}, Requested: {shares}"
            )

        # Compute Realized P&L
        gross_pnl = (exec_price - position.average_entry_price) * shares
        realized_pnl = gross_pnl - net_charges
        cost_basis = position.average_entry_price * shares
        realized_pnl_pct = (gross_pnl / cost_basis) * 100 if cost_basis > 0 else 0.0

        payout = total_order_val - net_charges
        if currency == "USD":
            portfolio.cash_usd += payout
            portfolio.realized_pnl_usd += realized_pnl
        else:
            portfolio.cash_inr += payout
            portfolio.realized_pnl_inr += realized_pnl

        position.shares -= shares
        if position.shares <= 0.0001:
            await db.delete(position)
        else:
            position.updated_at = datetime.now(timezone.utc)

        is_profitable = realized_pnl >= 0
        sell_summary = {
            "symbol": clean_sym,
            "shares_sold": shares,
            "entry_price": round(position.average_entry_price, 2),
            "exit_price": round(exec_price, 2),
            "gross_amount": round(total_order_val, 2),
            "charges": round(net_charges, 2),
            "realized_pnl": round(realized_pnl, 2),
            "realized_pnl_pct": round(realized_pnl_pct, 2),
            "is_profitable": is_profitable,
            "currency": currency,
            "headline": f"{'PROFIT BOOKED: +' if is_profitable else 'LOSS REALIZED: -'}{curr_sym}{abs(realized_pnl):,.2f} ({realized_pnl_pct:+.2f}%) on {clean_sym}"
        }

    # Record Order
    order_record = PaperOrder(
        portfolio_id=portfolio.id,
        order_id=f"ORD-2026-{clean_sym[:3]}-{random.randint(1000, 9999)}",
        symbol=clean_sym,
        side=clean_side,
        order_type=clean_order_type,
        product_type=clean_product,
        shares=shares,
        execution_price=exec_price,
        total_value=total_order_val,
        charges=net_charges,
        realized_pnl=realized_pnl,
        realized_pnl_pct=realized_pnl_pct,
        currency=currency,
        status="FILLED",
        created_at=datetime.now(timezone.utc)
    )
    db.add(order_record)
    portfolio.updated_at = datetime.now(timezone.utc)

    # Async dispatch to real Alpaca Paper Trading API if US stock
    if currency == "USD":
        try:
            from marketpulse_api.services.alpaca_service import execute_alpaca_order
            asyncio.create_task(execute_alpaca_order(clean_sym, shares, clean_side))
        except Exception as e:
            logger.warning(f"Alpaca order dispatch note: {e}")

    await db.commit()
    res = await get_or_create_paper_portfolio(db, user_id, active_symbol=clean_sym)
    res["latest_sell_summary"] = sell_summary
    return res


async def deposit_virtual_funds(db: AsyncSession, user_id: str, amount_usd: float = 0.0, amount_inr: float = 0.0) -> Dict[str, Any]:
    """Adds virtual funds to the paper trading portfolio."""
    query = select(PaperPortfolio).where(PaperPortfolio.user_id == user_id)
    result = await db.execute(query)
    portfolio = result.scalars().first()

    if portfolio:
        if amount_usd > 0:
            portfolio.cash_usd += amount_usd
        if amount_inr > 0:
            portfolio.cash_inr += amount_inr
        portfolio.updated_at = datetime.now(timezone.utc)
        await db.commit()

    return await get_or_create_paper_portfolio(db, user_id)


async def reset_paper_portfolio(db: AsyncSession, user_id: str) -> Dict[str, Any]:
    """Resets paper portfolio back to fresh starting balance ($100,000 USD / ₹80,00,000 INR)."""
    query = select(PaperPortfolio).where(PaperPortfolio.user_id == user_id)
    result = await db.execute(query)
    portfolio = result.scalars().first()

    if portfolio:
        # Delete positions
        del_pos = delete(PaperPosition).where(PaperPosition.portfolio_id == portfolio.id)
        await db.execute(del_pos)

        # Reset balances
        portfolio.cash_usd = 100000.0
        portfolio.cash_inr = 8000000.0
        portfolio.realized_pnl_usd = 0.0
        portfolio.realized_pnl_inr = 0.0
        portfolio.updated_at = datetime.now(timezone.utc)
        await db.commit()

    return await get_or_create_paper_portfolio(db, user_id)
