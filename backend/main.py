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
import io  # ← ده الناقص!
from pathlib import Path
import logging

from dotenv import load_dotenv
from supabase import create_client, Client

# تحميل المتغيرات البيئية
load_dotenv()

# إعداد CORS
ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(',') if origin.strip()]
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000").rstrip('/')

# إعداد Supabase Storage
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME", "product-images")

# إعداد اللوقر أولاً
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# إنشاء عميل Supabase
supabase_storage: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase_storage = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase Storage initialized")
    except Exception as e:
        logger.error(f"Supabase init failed: {e}")

# استيراد Auth & Models
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
    Token, FileUploadResponse, DashboardStats, OrderItemCreate
)

# إعداد التطبيق
app = FastAPI(
    title="SK Bags API",
    description="API for managing handmade bags",
    version="1.0.0"
)

# Middleware
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
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ===== Helper Functions =====
def _make_absolute_media(product: dict) -> dict:
    """تحويل روابط الصور النسبية إلى مطلقة"""
    try:
        img = product.get('image_url')
        if isinstance(img, str) and img and not img.startswith('http'):
            if img.startswith('/uploads/'):
                product['image_url'] = f"{BACKEND_PUBLIC_URL}{img}"
            else:
                product['image_url'] = f"{BACKEND_PUBLIC_URL}/uploads/{img.lstrip('/')}"

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

import io

async def upload_to_supabase(file_content: bytes, filename: str, content_type: str) -> str:
    """رفع ملف إلى Supabase Storage"""
    try:
        if not supabase_storage:
            raise Exception("Supabase not initialized")
        
        logger.info(f"Uploading {filename} ({len(file_content)} bytes)")
        
        # استخدام bytes مباشرة بدلاً من BytesIO
        result = supabase_storage.storage.from_(BUCKET_NAME).upload(
            path=filename,
            file=file_content,  # 👈 bytes مباشرة بدون BytesIO
            file_options={"content-type": content_type}
        )
        
        logger.info(f"Supabase upload response: {result}")
        
        # التحقق من الأخطاء
        if isinstance(result, dict):
            if result.get("error"):
                raise Exception(result["error"])
            if result.get("statusCode") and result["statusCode"] >= 400:
                raise Exception(result.get("message", "Upload failed"))
        
        # إنشاء URL العام
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{filename}"
        logger.info(f"Upload success: {public_url}")
        
        return public_url
        
    except Exception as e:
        logger.error(f"Supabase upload failed: {e}")
        raise


# ===== Startup =====
@app.on_event("startup")
async def startup_event():
    try:
        await setup_default_admin()
        logger.info("App started successfully")
    except Exception as e:
        logger.error(f"Startup error: {e}")

# ===== Health Check =====
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/status")
async def get_status():
    return {
        "status": "healthy",
        "backend_url": BACKEND_PUBLIC_URL,
        "supabase_configured": bool(supabase_storage),
        "bucket_name": BUCKET_NAME
    }

# ===== Auth Endpoints =====
@app.post("/admin/login", response_model=Token)
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials"
        )
    
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def auth_login_alias(form_data: OAuth2PasswordRequestForm = Depends()):
    return await admin_login(form_data)

@app.get("/admin/me")
async def get_current_admin(current_user=Depends(get_current_active_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "is_active": current_user["is_active"]
    }

# ===== Products =====
@app.get("/products", response_model=List[Product])
async def get_products(skip: int = 0, limit: int = 50, category: Optional[str] = None, search: Optional[str] = None):
    try:
        products = await db.get_all_products()
        products = [_make_absolute_media(dict(p)) for p in products]
        
        if category:
            products = [p for p in products if p.get('category', '').lower() == category.lower()]
        
        if search:
            search_lower = search.lower()
            products = [p for p in products if 
                       search_lower in p.get('name', '').lower() or 
                       search_lower in p.get('description', '').lower()]
        
        return products[skip:skip + limit]
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    try:
        product = await db.get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return _make_absolute_media(dict(product))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product: {e}")
        raise HTTPException(status_code=500, detail="Error")

@app.post("/admin/products", response_model=Product)
async def create_product(product: ProductCreate, current_user=Depends(get_current_active_user)):
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
        raise HTTPException(status_code=500, detail="Error")

@app.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: int, product: ProductUpdate, current_user=Depends(get_current_active_user)):
    try:
        existing = await db.get_product_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Not found")
        
        update_data = {k: v for k, v in product.dict().items() if v is not None}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        updated = await db.update_product(product_id, update_data)
        return _make_absolute_media(dict(updated))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update error: {e}")
        raise HTTPException(status_code=500, detail="Error")

@app.delete("/admin/products/{product_id}")
async def delete_product(product_id: int, current_user=Depends(get_current_active_user)):
    try:
        existing = await db.get_product_by_id(product_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Not found")
        
        await db.delete_product(product_id)
        return {"success": True, "message": "Deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Error")

# ===== Orders =====
@app.get("/admin/orders", response_model=List[Order])
async def get_orders(current_user=Depends(get_current_active_user), skip: int = 0, limit: int = 50, status: Optional[str] = None):
    try:
        orders = await db.get_all_orders()
        
        if status:
            orders = [o for o in orders if o.get('status') == status]
        
        orders = orders[skip:skip + limit]
        
        for order in orders:
            order['items'] = await db.get_order_items(order['id'])
        
        return orders
    except Exception as e:
        logger.error(f"Orders error: {e}")
        raise HTTPException(status_code=500, detail="Error")

@app.get("/orders", response_model=List[Order])
async def get_orders_alias(current_user=Depends(get_current_active_user), skip: int = 0, limit: int = 50, status: Optional[str] = None):
    return await get_orders(current_user, skip, limit, status)

@app.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    try:
        total_amount = 0
        order_items_data = []
        
        for item in order_data.items:
            product = await db.get_product_by_id(item.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            
            if product['stock_quantity'] < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock")
            
            item_total = product['price'] * item.quantity
            total_amount += item_total
            
            order_items_data.append({
                'product_id': item.product_id,
                'quantity': item.quantity,
                'price_per_unit': product['price'],
                'total_price': item_total
            })
        
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
        
        for item_data in order_items_data:
            item_data['order_id'] = new_order['id']
        
        order_items = await db.create_order_items(order_items_data)
        
        for item in order_data.items:
            product = await db.get_product_by_id(item.product_id)
            new_stock = product['stock_quantity'] - item.quantity
            await db.update_product(item.product_id, {'stock_quantity': new_stock})
        
        new_order['items'] = order_items
        return new_order
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Order creation error: {e}")
        raise HTTPException(status_code=500, detail="Error")

@app.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: int, status_update: OrderUpdate, current_user=Depends(get_current_active_user)):
    try:
        existing = await db.get_order_by_id(order_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Not found")
        
        updated = await db.update_order_status(order_id, status_update.status.value)
        return {"success": True, "order": updated}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Status update error: {e}")
        raise HTTPException(status_code=500, detail="Error")

# ===== File Upload =====
@app.post("/admin/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...), current_user=Depends(get_current_active_user)):
    try:
        logger.info(f"Upload: {file.filename}")
        
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail=f"Type not allowed: {file.content_type}")
        
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        if file_size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large")
        
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'jpg'
        unique_filename = f"{uuid.uuid4()}.{ext}"
        
        # محاولة Supabase أولاً
        if supabase_storage:
            try:
                supabase_url = await upload_to_supabase(file_content, unique_filename, file.content_type)
                return {
                    "success": True,
                    "filename": unique_filename,
                    "url": supabase_url,
                    "size": file_size,
                    "storage": "supabase"
                }
            except Exception as e:
                logger.warning(f"Supabase failed: {e}, trying local")
        
        # التخزين المحلي كـ backup
        file_path = UPLOAD_DIR / unique_filename
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        local_url = f"{BACKEND_PUBLIC_URL}/uploads/{unique_filename}"
        return {
            "success": True,
            "filename": unique_filename,
            "url": local_url,
            "size": file_size,
            "storage": "local"
        }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-simple", response_model=FileUploadResponse)
async def upload_simple(file: UploadFile = File(...), current_user=Depends(get_current_active_user)):
    return await upload_file(file, current_user)

# ===== Storage Tests =====
@app.get("/admin/storage-status")
async def storage_status(current_user=Depends(get_current_active_user)):
    result = {
        "supabase_configured": bool(supabase_storage),
        "bucket_name": BUCKET_NAME,
        "backend_url": BACKEND_PUBLIC_URL
    }
    
    if supabase_storage:
        try:
            buckets = supabase_storage.storage.list_buckets()
            result["buckets_count"] = len(buckets) if buckets else 0
            result["target_exists"] = any(
                getattr(b, 'id', '') == BUCKET_NAME or getattr(b, 'name', '') == BUCKET_NAME 
                for b in buckets
            )
        except Exception as e:
            result["error"] = str(e)
    
    return result

# ===== Dashboard =====
@app.get("/admin/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user=Depends(get_current_active_user)):
    try:
        products = await db.get_all_products()
        orders = await db.get_all_orders()
        
        return {
            "total_products": len(products),
            "total_orders": len(orders),
            "pending_orders": len([o for o in orders if o.get('status') == 'pending']),
            "total_revenue": sum(o.get('total_amount', 0) for o in orders if o.get('status') in ['confirmed', 'shipped', 'delivered']),
            "low_stock_products": len([p for p in products if p.get('stock_quantity', 0) < 5])
        }
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail="Error")

# ===== Search & Categories =====
@app.get("/search")
async def search_products(q: str, limit: int = 20):
    try:
        products = await db.get_all_products()
        search_lower = q.lower()
        
        filtered = [p for p in products if 
            search_lower in p.get('name', '').lower() or 
            search_lower in p.get('description', '').lower() or 
            search_lower in p.get('category', '').lower()
        ]
        
        return filtered[:limit]
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Error")

@app.get("/categories")
async def get_categories():
    try:
        products = await db.get_all_products()
        categories = list(set(p.get('category', '') for p in products if p.get('category')))
        return {"categories": sorted(categories)}
    except Exception as e:
        logger.error(f"Categories error: {e}")
        raise HTTPException(status_code=500, detail="Error")

# ===== Error Handlers =====
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal error"}
    )

# ===== Frontend Serving =====
try:
    static_dir = Path("backend/static/static")
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory="backend/static/static"), name="static_files")
except Exception as e:
    logger.warning(f"Static mount failed: {e}")

@app.get("/favicon.ico")
async def favicon():
    path = Path("backend/static/favicon.ico")
    if path.exists():
        return FileResponse(path)
    raise HTTPException(status_code=404)

@app.get("/manifest.json")
async def manifest():
    path = Path("backend/static/manifest.json")
    if path.exists():
        return FileResponse(path)
    raise HTTPException(status_code=404)

@app.get("/{path_name:path}")
async def serve_spa(path_name: str):
    api_paths = ["docs", "openapi.json", "redoc", "health", "status", "admin", "auth", "products", "orders", "upload", "search", "categories", "uploads", "api"]
    
    if any(path_name.startswith(p) for p in api_paths):
        raise HTTPException(status_code=404)
    
    frontend_dir = Path("backend/static")
    if path_name and frontend_dir.exists():
        file_path = frontend_dir / path_name
        if file_path.is_file():
            return FileResponse(file_path)
    
    index_path = frontend_dir / "index.html"
    if index_path.exists():
        return FileResponse(index_path, media_type="text/html")
    
    return JSONResponse({"message": "SK Bags API", "status": "healthy"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port, log_level="info")
