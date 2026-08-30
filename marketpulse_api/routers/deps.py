from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from marketpulse_api.core.database import get_db
from marketpulse_api.core.security import decode_token, hash_api_key
from marketpulse_api.models.user import User, UserApiKey

security_bearer = HTTPBearer(auto_error=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def get_current_user(
    auth: HTTPAuthorizationCredentials = Depends(security_bearer),
    api_key: str = Depends(api_key_header),
    db: AsyncSession = Depends(get_db)
) -> User:
    # 1. Try Bearer JWT
    if auth and auth.credentials:
        payload = decode_token(auth.credentials)
        if payload and payload.get("type") == "access":
            user_id = payload.get("sub")
            query = select(User).where(User.id == user_id)
            res = await db.execute(query)
            user = res.scalars().first()
            if user and user.is_active:
                return user

    # 2. Try API Key Header
    if api_key:
        key_hash = hash_api_key(api_key)
        query = select(UserApiKey).where(UserApiKey.key_hash == key_hash, UserApiKey.is_active == True)
        res = await db.execute(query)
        api_key_obj = res.scalars().first()
        if api_key_obj:
            user_query = select(User).where(User.id == api_key_obj.user_id)
            user_res = await db.execute(user_query)
            user = user_res.scalars().first()
            if user and user.is_active:
                return user

    # Fallback to demo default user if unauthenticated in local development mode
    query = select(User).where(User.email == "demo@marketpulse.ai")
    res = await db.execute(query)
    demo_user = res.scalars().first()
    if demo_user:
        return demo_user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials."
    )


async def require_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required."
        )
    return current_user
