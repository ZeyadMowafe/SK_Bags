from pydantic import BaseModel, EmailStr, field_validator
from pydantic.config import ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ===== Enums =====
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# ===== Product Models =====
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    images: Optional[List[str]] = []  # احتفظ بهذا فقط
    stock_quantity: int = 0
    is_available: bool = True

    @field_validator('price')
    @classmethod
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v
class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    stock_quantity: Optional[int] = None
    is_available: Optional[bool] = None

    @field_validator('price')
    @classmethod
    def price_update_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Price must be positive')
        return v

class Product(ProductBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ===== Customer Models =====
class CustomerInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    city: Optional[str] = None
    postal_code: Optional[str] = None

# ===== Order Item Models =====
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int

    @field_validator('quantity')
    @classmethod
    def quantity_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be positive')
        return v

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: int
    order_id: int
    price_per_unit: float
    total_price: float
    product: Optional[Product] = None

    model_config = ConfigDict(from_attributes=True)

# ===== Order Models =====
class OrderBase(BaseModel):
    customer_info: CustomerInfo
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: OrderStatus

class Order(OrderBase):
    id: int
    status: OrderStatus
    total_amount: float
    items: Optional[List[OrderItem]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ===== Auth Models =====
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Admin(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AdminCreate(BaseModel):
    email: EmailStr
    password: str

# ===== Response Models =====
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class ProductListResponse(BaseModel):
    products: List[Product]
    total: int
    skip: int
    limit: int

class OrderListResponse(BaseModel):
    orders: List[Order]
    total: int
    skip: int
    limit: int

class FileUploadResponse(BaseModel):
    success: bool
    filename: str
    url: str
    size: int

class DashboardStats(BaseModel):
    total_products: int
    total_orders: int
    pending_orders: int
    total_revenue: float
    low_stock_products: int

# Validation moved into classes above for Pydantic v2