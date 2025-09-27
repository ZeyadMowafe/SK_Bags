from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from datetime import timedelta, datetime
from typing import List, Optional
from db_service import db_service_instance as db

import os
import shutil
import uuid
from pathlib import Path
import logging

import os
from dotenv import load_dotenv

# تحميل المتغيرات البيئية
load_dotenv()

# إعداد CORS من env vars
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(',') if origin.strip()]

# عنوان الباك إند العام لاستخدامه في إنشاء روابط الملفات
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000").rstrip('/')

# استيراد الملفات المحلية
from auth import (
    create_access_token, 
    authenticate_user, 
    get_current_active_user,
    setup_default_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

from models import (
    Product, ProductCreate, ProductUpdate,
    Order, OrderCreate, OrderUpdate, OrderStatus,
    Token, ApiResponse, ProductListResponse, OrderListResponse,
    FileUploadResponse, DashboardStats, CustomerInfo, OrderItemCreate
)

# إعداد التطبيق
app = FastAPI(
    title="Hand Made Bags API",
    description="API for managing handmade bags e-commerce",
    version="1.0.0"
)

# Middleware لتحويل المسارات التي تبدأ بـ /api إلى المسارات الحالية
class ApiPrefixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        path = request.scope.get('path', '')
        if path == '/api':
            request.scope['path'] = '/'
        elif path.startswith('/api/'):
            request.scope['path'] = path[4:]
        response = await call_next(request)
        return response

app.add_middleware(ApiPrefixMiddleware)

# إعداد CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# إعداد المجلدات
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# تقديم الملفات الثابتة
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# إعداد اللوقر
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===== Helpers =====
def _make_absolute_media(product: dict) -> dict:
    try:
        # image_url
        img = product.get('image_url')
        if isinstance(img, str) and img and not img.startswith('http'):  # relative/path-like
            if img.startswith('/uploads/'):
                product['image_url'] = f"{BACKEND_PUBLIC_URL}{img}"
            else:
                product['image_url'] = f"{BACKEND_PUBLIC_URL}/uploads/{img.lstrip('/')}"

        # images list
        imgs = product.get('images')
        if isinstance(imgs, list):
            normalized = []
            for it in imgs:
                if isinstance(it, str) and it and not it.startswith('http'):
                    if it.startswith('/uploads/'):
                        normalized.append(f"{BACKEND_PUBLIC_URL}{it}")
                    else:
                        normalized.append(f"{BACKEND_PUBLIC_URL}/uploads/{it.lstrip('/')}")
                else:
                    normalized.append(it)
            product['images'] = normalized
    except Exception:
        pass
    return product

# ===== Startup Events =====
@app.on_event("startup")
async def startup_event():
    """إعداد التطبيق عند البدء"""
    try:
        await setup_default_admin()
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {e}")

# ===== Health Check =====
@app.get("/health")
async def health_check():
    """فحص صحة التطبيق"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# ===== Authentication Endpoints =====
@app.post("/admin/login", response_model=Token)
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    """تسجيل دخول الادمن"""
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Alias to match frontend expectation: /auth/login (same behavior as /admin/login)
@app.post("/auth/login", response_model=Token)
async def auth_login_alias(form_data: OAuth2PasswordRequestForm = Depends()):
    return await admin_login(form_data)

@app.get("/admin/me")
async def get_current_admin(current_user=Depends(get_current_active_user)):
    """جلب بيانات الادمن الحالي"""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "is_active": current_user["is_active"]
    }

# ===== Products Endpoints =====
@app.get("/products", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    search: Optional[str] = None
):
    """جلب قائمة المنتجات"""
    try:
        products = await db.get_all_products()
        products = [_make_absolute_media(dict(p)) for p in products]
        
        # تطبيق الفلاتر
        if category:
            products = [p for p in products if p.get('category', '').lower() == category.lower()]
        
        if search:
            search_lower = search.lower()
            products = [p for p in products if 
                       search_lower in p.get('name', '').lower() or 
                       search_lower in p.get('description', '').lower()]
        
        # تطبيق الـ pagination
        total = len(products)
        products = products[skip:skip + limit]
        
        return products
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    """جلب منتج بالمعرف"""
    try:
        product = await db.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return _make_absolute_media(dict(product))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching product")

@app.post("/admin/products", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_user=Depends(get_current_active_user)
):
    """إنشاء منتج جديد (ادمن فقط)"""
    try:
        product_data = product.dict()
        product_data['created_at'] = datetime.utcnow().isoformat()
        product_data['is_available'] = True
        
        new_product = await db.create_product(product_data)
        if not new_product:
            raise HTTPException(status_code=400, detail="Error creating product")
        
        return _make_absolute_media(dict(new_product))
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Error creating product")

@app.put("/admin/products/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product: ProductUpdate,
    current_user=Depends(get_current_active_user)
):
    """تحديث منتج (ادمن فقط)"""
    try:
        # التحقق من وجود المنتج
        existing_product = await db.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        # تحديث البيانات
        update_data = {k: v for k, v in product.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        updated_product = await db.update_product(product_id, update_data)
        if not updated_product:
            raise HTTPException(status_code=400, detail="Error updating product")
        
        return _make_absolute_media(dict(updated_product))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating product")

@app.delete("/admin/products/{product_id}")
async def delete_product(
    product_id: int,
    current_user=Depends(get_current_active_user)
):
    """حذف منتج (ادمن فقط)"""
    try:
        # التحقق من وجود المنتج
        existing_product = await db.get_product_by_id(product_id)
        if not existing_product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        await db.delete_product(product_id)
        return {"success": True, "message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting product")

# ===== Orders Endpoints =====
@app.get("/admin/orders", response_model=List[Order])
async def get_orders(
    current_user=Depends(get_current_active_user),
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None
):
    """جلب قائمة الطلبات (ادمن فقط)"""
    try:
        orders = await db.get_all_orders()
        
        # تطبيق فلتر الحالة
        if status:
            orders = [o for o in orders if o.get('status') == status]
        
        # تطبيق الـ pagination
        total = len(orders)
        orders = orders[skip:skip + limit]
        
        # جلب عناصر كل طلب
        for order in orders:
            order['items'] = await db.get_order_items(order['id'])
        
        return orders
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail="Error fetching orders")

# Alias to match frontend expectation: GET /orders (admin-protected)
@app.get("/orders", response_model=List[Order])
async def get_orders_alias(current_user=Depends(get_current_active_user), skip: int = 0, limit: int = 50, status: Optional[str] = None):
    return await get_orders(current_user=current_user, skip=skip, limit=limit, status=status)

@app.get("/admin/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    current_user=Depends(get_current_active_user)
):
    """جلب طلب بالمعرف (ادمن فقط)"""
    try:
        order = await db.get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # جلب عناصر الطلب
        order['items'] = await db.get_order_items(order_id)
        
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching order")

@app.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    """إنشاء طلب جديد"""
    try:
        # حساب إجمالي الطلب
        total_amount = 0
        order_items_data = []
        
        for item in order_data.items:
            # التحقق من المنتج والمخزون
            product = await db.get_product_by_id(item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            if product['stock_quantity'] < item.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock for product {product['name']}"
                )
            
            # حساب السعر الإجمالي للعنصر
            item_total = product['price'] * item.quantity
            total_amount += item_total
            
            # إعداد بيانات عنصر الطلب
            order_items_data.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'price_per_unit': product['price'],
                'total_price': item_total
            })
        
        # إنشاء الطلب
        order_create_data = {
            'customer_info': order_data.customer_info.dict(),
            'status': OrderStatus.PENDING.value,
            'total_amount': total_amount,
            'notes': order_data.notes,
            'created_at': datetime.utcnow().isoformat()
        }
        
        new_order = await db.create_order(order_create_data)
        if not new_order:
            raise HTTPException(status_code=400, detail="Error creating order")
        
        # إضافة عناصر الطلب
        for item_data in order_items_data:
            item_data['order_id'] = new_order['id']
        
        order_items = await db.create_order_items(order_items_data)
        
        # تحديث المخزون
        for item in order_data.items:
            product = await db.get_product_by_id(item.product_id)
            new_stock = product['stock_quantity'] - item.quantity
            await db.update_product(item.product_id, {'stock_quantity': new_stock})
        
        # إضافة العناصر للطلب المُنشأ
        new_order['items'] = order_items
        
        return new_order
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Error creating order")

@app.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderUpdate,
    current_user=Depends(get_current_active_user)
):
    """تحديث حالة الطلب (ادمن فقط)"""
    try:
        # التحقق من وجود الطلب
        existing_order = await db.get_order_by_id(order_id)
        if not existing_order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # تحديث الحالة
        updated_order = await db.update_order_status(order_id, status_update.status.value)
        if not updated_order:
            raise HTTPException(status_code=400, detail="Error updating order status")
        
        return {"success": True, "message": "Order status updated successfully", "order": updated_order}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating order status")

# ===== File Upload Endpoints =====
@app.post("/admin/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_active_user)
):
    """رفع ملف (ادمن فقط)"""
    try:
        # التحقق من نوع الملف
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # إنشاء اسم فريد للملف
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # حفظ الملف
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # إنشاء URL مطلق للملف وضمان توافر مسار نسبي أيضاً للتوافق الخلفي
        file_url = f"{BACKEND_PUBLIC_URL}/uploads/{unique_filename}"
        relative_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "filename": unique_filename,
            "url": file_url,
            "relative_url": relative_url,
            "size": os.path.getsize(file_path)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Error uploading file")

# Alias to match frontend expectation: /upload-simple (admin-protected)
@app.post("/upload-simple", response_model=FileUploadResponse)
async def upload_file_alias(
    file: UploadFile = File(...),
    current_user=Depends(get_current_active_user)
):
    return await upload_file(file=file, current_user=current_user)

# ===== Dashboard/Statistics Endpoints =====
@app.get("/admin/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user=Depends(get_current_active_user)):
    """جلب إحصائيات لوحة التحكم (ادمن فقط)"""
    try:
        # جلب جميع البيانات
        products = await db.get_all_products()
        orders = await db.get_all_orders()
        
        # حساب الإحصائيات
        total_products = len(products)
        total_orders = len(orders)
        pending_orders = len([o for o in orders if o.get('status') == 'pending'])
        total_revenue = sum(o.get('total_amount', 0) for o in orders if o.get('status') in ['confirmed', 'shipped', 'delivered'])
        low_stock_products = len([p for p in products if p.get('stock_quantity', 0) < 5])
        
        return {
            "total_products": total_products,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "total_revenue": total_revenue,
            "low_stock_products": low_stock_products
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Error fetching dashboard stats")

# ===== Search Endpoints =====
@app.get("/search")
async def search_products(
    q: str,
    limit: int = 20
):
    """البحث في المنتجات"""
    try:
        products = await db.get_all_products()
        search_lower = q.lower()
        
        # البحث في الاسم والوصف والكاتيجوري
        filtered_products = [
            p for p in products if 
            search_lower in p.get('name', '').lower() or 
            search_lower in p.get('description', '').lower() or 
            search_lower in p.get('category', '').lower()
        ]
        
        return filtered_products[:limit]
    except Exception as e:
        logger.error(f"Error searching products: {e}")
        raise HTTPException(status_code=500, detail="Error searching products")

# ===== Categories Endpoint =====
@app.get("/categories")
async def get_categories():
    """جلب قائمة الكاتيجوريات المتاحة"""
    try:
        products = await db.get_all_products()
        categories = list(set(p.get('category', '') for p in products if p.get('category')))
        return {"categories": sorted(categories)}
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Error fetching categories")

# ===== Error Handlers =====
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal server error"}
    )

# ===== Frontend Serving (Must be LAST) =====

# Mount static files (CSS, JS, images) - بدون decorator
try:
    static_dir = Path("backend/static/static")
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory="backend/static/static"), name="static_files")
        logger.info("Static files mounted successfully")
    else:
        logger.warning("Static directory not found - frontend may not work")
except Exception as e:
    logger.warning(f"Could not mount static files: {e}")

# Serve individual frontend files
@app.get("/favicon.ico")
async def favicon():
    favicon_path = Path("backend/static/favicon.ico")
    if favicon_path.exists():
        return FileResponse(favicon_path)
    raise HTTPException(status_code=404, detail="Favicon not found")

@app.get("/manifest.json")
async def manifest():
    manifest_path = Path("backend/static/manifest.json")
    if manifest_path.exists():
        return FileResponse(manifest_path)
    raise HTTPException(status_code=404, detail="Manifest not found")

# Catch-all for React SPA - This MUST be the very last route
@app.get("/{path_name:path}")
async def serve_spa(path_name: str):
    """Serve React app for any non-API routes"""
    
    # List of API endpoints that should return 404
    api_paths = [
        "docs", "openapi.json", "redoc", "health",
        "admin", "auth", "products", "orders", "upload", "upload-simple",
        "search", "categories", "uploads", "api"
    ]
    
    # If this is an API endpoint, return 404
    if any(path_name.startswith(api_path) for api_path in api_paths):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Try to serve specific file first
    frontend_dir = Path("backend/static")
    if path_name and frontend_dir.exists():
        file_path = frontend_dir / path_name
        if file_path.is_file():
            return FileResponse(file_path)
    
    # For everything else (SPA routes), serve index.html
    index_path = frontend_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path, media_type="text/html")
    
    # If no frontend files found, return API info
    return JSONResponse(
        content={
            "message": "SK Bags API is running", 
            "status": "healthy",
            "endpoints": {
                "products": "/products",
                "health": "/health",
                "docs": "/docs"
            }
        },
        status_code=200
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
