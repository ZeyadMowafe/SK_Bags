# 👜 Handmade Bags E-commerce Project

موقع احترافي لبيع الشنط اليدوية المصنوعة يدوياً، مبني بتقنيات حديثة ومتطورة.

## 🚀 المميزات

### للعملاء
- ✨ واجهة مستخدم حديثة وأنيقة
- 🛒 سلة تسوق متطورة
- 📱 تصميم متجاوب مع جميع الأجهزة
- 🔍 تصفح سهل للمنتجات
- 💳 نظام طلبات آمن
- 📞 معلومات تواصل واضحة

### للمدير
- 🔐 لوحة تحكم آمنة
- 📦 إدارة المنتجات (إضافة، تعديل، حذف)
- 📋 إدارة الطلبات وحالاتها
- 📊 عرض إحصائيات المبيعات
- 🖼️ رفع الصور للمنتجات
- 👥 إدارة المستخدمين

## 🛠️ التقنيات المستخدمة

### Frontend
- **React.js** - مكتبة واجهة المستخدم
- **Tailwind CSS** - إطار عمل CSS
- **React Router** - التنقل بين الصفحات
- **Lucide React** - أيقونات جميلة
- **Axios** - طلبات HTTP

### Backend
- **FastAPI** - إطار عمل Python سريع
- **Supabase** - قاعدة بيانات PostgreSQL
- **JWT** - مصادقة آمنة
- **Pydantic** - التحقق من البيانات
- **Uvicorn** - خادم ASGI

### Database
- **PostgreSQL** - قاعدة بيانات علائقية
- **Row Level Security (RLS)** - أمان متقدم
- **Real-time subscriptions** - تحديثات فورية

## 📁 هيكل المشروع

```
Hand_Made/
├── frontend/                 # تطبيق React
│   ├── public/              # الملفات العامة
│   ├── src/                 # كود المصدر
│   │   ├── components/      # مكونات React
│   │   ├── services/        # خدمات API
│   │   └── ...
│   ├── package.json         # تبعيات Frontend
│   └── ...
├── backend/                 # خادم FastAPI
│   ├── models.py           # نماذج البيانات
│   ├── database.py         # إعداد قاعدة البيانات
│   ├── auth.py             # المصادقة
│   ├── main.py             # التطبيق الرئيسي
│   ├── requirements.txt    # تبعيات Python
│   └── ...
├── database/               # ملفات قاعدة البيانات
│   └── schema.sql         # مخطط قاعدة البيانات
├── package.json           # تبعيات المشروع الرئيسي
├── start_all.bat          # تشغيل المشروع كاملاً
└── README.md              # هذا الملف
```

## 🚀 التثبيت والتشغيل

### المتطلبات الأساسية
- Node.js (v16 أو أحدث)
- Python (v3.8 أو أحدث)
- pip (مدير حزم Python)
- حساب Supabase

### التثبيت السريع

1. **استنساخ المشروع**
   ```bash
   git clone <repository-url>
   cd Hand_Made
   ```

2. **تشغيل ملف الباتش (Windows)**
   ```bash
   start_all.bat
   ```

   أو يدوياً:
   ```bash
   # تثبيت تبعيات المشروع الرئيسي
   npm install
   
   # تثبيت تبعيات Frontend
   cd frontend
   npm install
   cd ..
   
   # تثبيت تبعيات Backend
   cd backend
   pip install -r requirements.txt
   cd ..
   ```

3. **إعداد قاعدة البيانات**
   - أنشئ مشروع في Supabase
   - انسخ بيانات الاتصال
   - عدّل ملف `backend/.env`
   - شغل `database/schema.sql` في Supabase

4. **تشغيل المشروع**
   ```bash
   # تشغيل Backend
   cd backend
   python run.py
   
   # في نافذة جديدة - تشغيل Frontend
   cd frontend
   npm start
   ```

## 🌐 الروابط

- **الموقع الرئيسي**: http://localhost:3000
- **لوحة التحكم**: http://localhost:3000/admin
- **API Documentation**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/health

## 🔐 بيانات تسجيل الدخول

### المدير
- **البريد الإلكتروني**: admin@handmadebags.com
- **كلمة المرور**: admin123

## 📝 متغيرات البيئة

أنشئ ملف `backend/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🛠️ الأوامر المفيدة

```bash
# تشغيل المشروع كاملاً
npm start

# تشغيل في وضع التطوير
npm run dev

# تشغيل Frontend فقط
npm run start:frontend

# تشغيل Backend فقط
npm run start:backend

# تثبيت جميع التبعيات
npm run install:all
```

## 📊 API Endpoints

### المنتجات
- `GET /api/products` - جلب جميع المنتجات
- `GET /api/products/{id}` - جلب منتج محدد
- `POST /api/admin/products` - إضافة منتج جديد
- `PUT /api/admin/products/{id}` - تعديل منتج
- `DELETE /api/admin/products/{id}` - حذف منتج

### الطلبات
- `GET /api/orders` - جلب جميع الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `PUT /api/orders/{id}/status` - تحديث حالة الطلب

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب جديد

### الملفات
- `POST /api/upload-simple` - رفع ملف

## 🔧 التطوير

### إضافة مكون جديد
```bash
cd frontend/src/components
# أنشئ ملف جديد للمكون
```

### إضافة API endpoint جديد
```bash
cd backend
# أضف endpoint في main.py
```

### تحديث قاعدة البيانات
```bash
cd database
# عدّل schema.sql
# شغل في Supabase
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ في تثبيت Pillow**
   ```bash
   # جرب تثبيت من wheel
   pip install --only-binary=all Pillow
   ```

2. **خطأ في CORS**
   - تأكد من إعدادات CORS في `backend/main.py`

3. **خطأ في قاعدة البيانات**
   - تحقق من متغيرات البيئة
   - تأكد من تشغيل schema.sql

4. **خطأ في Frontend**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📈 التطوير المستقبلي

- [ ] نظام دفع إلكتروني
- [ ] نظام تقييمات ومراجعات
- [ ] نظام إشعارات
- [ ] تطبيق موبايل
- [ ] نظام إدارة المخزون
- [ ] تقارير وإحصائيات متقدمة
- [ ] نظام العروض والخصومات
- [ ] دعم متعدد اللغات

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للbranch (`git push origin feature/AmazingFeature`)
5. أنشئ Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

- **البريد الإلكتروني**: support@handmadebags.com
- **الهاتف**: +20 123 456 7890
- **العنوان**: القاهرة، مصر

---

**صنع بـ ❤️ في مصر**
