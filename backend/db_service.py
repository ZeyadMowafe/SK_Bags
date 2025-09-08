from supabase import create_client, Client
import logging
import os
from dotenv import load_dotenv

# تحميل المتغيرات البيئية
load_dotenv()

# إعداد Supabase من env vars
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY.")

# إنشاء عميل Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)

# إعداد اللوقر
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.client = supabase
        self.admin_client = supabase_admin

    # ===== Products Operations =====
    async def get_all_products(self):
        """جلب جميع المنتجات"""
        try:
            response = self.client.table('products').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            raise

    async def get_product_by_id(self, product_id: int):
        """جلب منتج بالمعرف"""
        try:
            response = self.client.table('products').select('*').eq('id', product_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching product {product_id}: {e}")
            raise

    async def create_product(self, product_data: dict):
        """إنشاء منتج جديد"""
        try:
            response = self.admin_client.table('products').insert(product_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            raise

    async def update_product(self, product_id: int, product_data: dict):
        """تحديث منتج"""
        try:
            response = self.admin_client.table('products').update(product_data).eq('id', product_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            raise

    async def delete_product(self, product_id: int):
        """حذف منتج"""
        try:
            response = self.admin_client.table('products').delete().eq('id', product_id).execute()
            return True
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}")
            raise

    # ===== Orders Operations =====
    async def get_all_orders(self):
        """جلب جميع الطلبات"""
        try:
            response = self.admin_client.table('orders').select('*').order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching orders: {e}")
            raise

    async def get_order_by_id(self, order_id: int):
        """جلب طلب بالمعرف"""
        try:
            response = self.admin_client.table('orders').select('*').eq('id', order_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching order {order_id}: {e}")
            raise

    async def create_order(self, order_data: dict):
        """إنشاء طلب جديد"""
        try:
            response = self.client.table('orders').insert(order_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            raise

    async def update_order_status(self, order_id: int, status: str):
        """تحديث حالة الطلب"""
        try:
            response = self.admin_client.table('orders').update({'status': status}).eq('id', order_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating order status {order_id}: {e}")
            raise

    # ===== Order Items Operations =====
    async def get_order_items(self, order_id: int):
        """جلب عناصر الطلب"""
        try:
            response = self.client.table('order_items').select('''
                *,
                products:product_id (*)
            ''').eq('order_id', order_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error fetching order items for order {order_id}: {e}")
            raise

    async def create_order_items(self, order_items: list):
        """إنشاء عناصر الطلب"""
        try:
            response = self.client.table('order_items').insert(order_items).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error creating order items: {e}")
            raise

    # ===== Admin Operations =====
    async def get_admin_by_email(self, email: str):
        """جلب الادمن بالبريد الإلكتروني"""
        try:
            response = self.admin_client.table('admins').select('*').eq('email', email).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error fetching admin by email {email}: {e}")
            raise

    async def create_admin(self, admin_data: dict):
        """إنشاء حساب ادمن جديد"""
        try:
            response = self.admin_client.table('admins').insert(admin_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating admin: {e}")
            raise

    async def update_admin_password(self, email: str, new_password_hash: str):
        """تحديث كلمة مرور الادمن بواسطة البريد"""
        try:
            response = self.admin_client.table('admins').update({'password_hash': new_password_hash}).eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error updating admin password for {email}: {e}")
            raise

# إنشاء instance من DatabaseService
db_service_instance = DatabaseService()