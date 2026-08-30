from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = "Institutional Trader"
    subscription_tier: Optional[str] = "pro"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class SendOTPRequest(BaseModel):
    email: EmailStr
    purpose: Optional[str] = "login"


class SendOTPResponse(BaseModel):
    message: str
    otp_preview: str
    expires_in: int = 300


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    full_name: Optional[str] = "Institutional Trader"
    subscription_tier: Optional[str] = "pro"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    subscription_tier: str
    timezone: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    timezone: Optional[str] = None


class TierUpgradeRequest(BaseModel):
    tier: str = Field(..., description="free, pro, or enterprise")
    billing_cycle: str = Field("monthly", description="monthly or annual")
    payment_method: Optional[str] = "Credit Card (Visa ending 4242)"


class BillingInvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    tier: str
    amount_usd: float
    amount_inr: float
    status: str
    payment_method: str
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreateRequest(BaseModel):
    name: str = "Live Strategy Key"


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    prefix: str
    created_at: datetime
    last_used: Optional[datetime]
    is_active: bool
    raw_key: Optional[str] = None

    class Config:
        from_attributes = True
