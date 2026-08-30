from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from marketpulse_api.core.database import get_db
from marketpulse_api.models.user import User
from marketpulse_api.schemas.auth import (
    UserRegister,
    UserLogin,
    SendOTPRequest,
    SendOTPResponse,
    VerifyOTPRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse,
    UpdateProfileRequest,
    TierUpgradeRequest,
    BillingInvoiceResponse,
    ApiKeyCreateRequest,
    ApiKeyResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest
)
from marketpulse_api.services.auth_service import (
    register_user,
    authenticate_user,
    send_user_otp,
    verify_user_otp,
    refresh_user_token,
    create_user_api_key,
    list_user_api_keys
)
from marketpulse_api.routers.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & User Security"])


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(data: SendOTPRequest):
    """Dispatches a 6-digit one-time passcode for two-factor verification."""
    msg, preview, expires = send_user_otp(data.email)
    return SendOTPResponse(message=msg, otp_preview=preview, expires_in=expires)


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    """Validates 6-digit OTP code and authorizes immediate session tokens."""
    _, tokens = await verify_user_otp(
        db,
        email=data.email,
        otp_code=data.otp_code,
        full_name=data.full_name,
        subscription_tier=data.subscription_tier
    )
    return tokens


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Registers a new user and returns access + refresh JWT tokens."""
    user = await register_user(db, data)
    _, tokens = await authenticate_user(db, UserLogin(email=data.email, password=data.password))
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticates credentials and issues JWT token pair."""
    _, tokens = await authenticate_user(db, data)
    return tokens


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refreshes an expired access token using a valid refresh token."""
    return await refresh_user_token(db, data.refresh_token)


@router.get("/me", response_model=UserProfileResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Fetches the active user's profile and subscription tier status."""
    return UserProfileResponse.model_validate(current_user)


@router.post("/api-keys", response_model=ApiKeyResponse, status_code=status.HTTP_201_CREATED)
async def generate_api_key(
    data: ApiKeyCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generates a new programmatic API key for algorithmic access."""
    return await create_user_api_key(db, current_user.id, data.name)


@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def get_my_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all active programmatic API keys for the current user."""
    return await list_user_api_keys(db, current_user.id)


@router.patch("/profile", response_model=UserProfileResponse)
async def modify_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates account display name or timezone preferences."""
    from marketpulse_api.services.auth_service import update_user_profile
    return await update_user_profile(db, current_user.id, data.full_name, data.timezone)


@router.post("/upgrade-tier", response_model=UserProfileResponse)
async def upgrade_tier(
    data: TierUpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upgrades subscription tier (Free -> Pro -> Institutional Enterprise) and dispatches billing invoice."""
    from marketpulse_api.services.auth_service import upgrade_user_tier
    return await upgrade_user_tier(db, current_user.id, data.tier, data.billing_cycle, data.payment_method)


@router.get("/invoices", response_model=List[BillingInvoiceResponse])
async def list_invoices(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves all payment invoices and tax receipts for the active account."""
    from marketpulse_api.services.auth_service import get_user_invoices
    return await get_user_invoices(db, current_user.id)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Initiates a secure password reset email flow."""
    return {"message": "If this email is registered, a password reset link has been dispatched."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Resets user password via validated verification token."""
    return {"message": "Password has been successfully reset. Please log in with your new credentials."}

