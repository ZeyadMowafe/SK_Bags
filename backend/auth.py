from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from db_service import db_service_instance as db
import logging
import os
from dotenv import load_dotenv

# تحميل المتغيرات البيئية
load_dotenv()

# إعداد JWT عبر env vars
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# إعداد الادمن عبر env vars
ADMIN_DEFAULT_PASSWORD = os.getenv("ADMIN_DEFAULT_PASSWORD")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@handmadebags.com")
ADMIN_DEFAULT_PASSWORD = os.getenv("ADMIN_DEFAULT_PASSWORD", "admin123")
SYNC_ADMIN_PASSWORD_ON_STARTUP = os.getenv("SYNC_ADMIN_PASSWORD_ON_STARTUP", "false").lower() == "true"

# إعداد تشفير كلمات المرور
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

# إعداد اللوقر
logger = logging.getLogger(__name__)

def verify_password(plain_password, hashed_password):
    """التحقق من كلمة المرور"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """تشفير كلمة المرور"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """إنشاء JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_admin_by_email(email: str):
    """جلب الادمن بالبريد الإلكتروني"""
    try:
        admin = await db.get_admin_by_email(email)
        return admin
    except Exception as e:
        logger.error(f"Error fetching admin: {e}")
        return None

async def authenticate_user(email: str, password: str):
    """التحقق من صحة بيانات المستخدم"""
    admin = await get_admin_by_email(email)
    if not admin:
        return False
    if not verify_password(password, admin["password_hash"]):
        return False
    return admin

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """جلب المستخدم الحالي من JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    admin = await get_admin_by_email(email)
    if admin is None:
        raise credentials_exception
    return admin

async def get_current_active_user(current_user: dict = Depends(get_current_user)):
    """جلب المستخدم النشط الحالي"""
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def setup_default_admin():
    """إنشاء حساب الادمن الافتراضي"""
    try:
        # التحقق من وجود الادمن
        existing_admin = await get_admin_by_email(ADMIN_EMAIL)
        if existing_admin:
            logger.info("Default admin already exists")
            # فرض مزامنة كلمة السر (يضمن التطابق مع .env)
            try:
                new_hash = get_password_hash(ADMIN_DEFAULT_PASSWORD)
                updated = await db.update_admin_password(ADMIN_EMAIL, new_hash)
                if updated:
                    logger.info("Admin password reset from environment variable")
            except Exception as e:
                logger.error(f"Failed resetting admin password: {e}")
            return
        
        # إنشاء كلمة مرور مشفرة من البيئة
        password_hash = get_password_hash(ADMIN_DEFAULT_PASSWORD)
        
        # إنشاء بيانات الادمن
        admin_data = {
            "email": ADMIN_EMAIL,
            "password_hash": password_hash,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # إنشاء الادمن في قاعدة البيانات
        new_admin = await db.create_admin(admin_data)
        if new_admin:
            logger.info(f"Default admin created: {ADMIN_EMAIL}")
        else:
            logger.error("Failed to create default admin")
    except Exception as e:
        logger.error(f"Error setting up default admin: {e}")