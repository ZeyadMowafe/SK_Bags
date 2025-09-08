# 🚀 تشغيل سريع - موقع شنط هاند ميد

## ⚡ التشغيل السريع (Windows)

### الطريقة الأولى: ملف واحد
```bash
# انقر مرتين على الملف
start_project.bat
```

### الطريقة الثانية: خطوات منفصلة

#### 1. تشغيل الباك إند
```bash
# انقر مرتين على الملف
start_backend.bat
```

#### 2. تشغيل الفرونت إند
```bash
# انقر مرتين على الملف
start_frontend.bat
```

## 🔧 الإعداد اليدوي

### 1. إعداد Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. انسخ محتوى `database/schema.sql` إلى SQL Editor
4. نفذ الكود

### 2. إعداد الباك إند
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

أنشئ ملف `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

```bash
python run.py
```

### 3. إعداد الفرونت إند
```bash
npm install
npm start
```

## 🌐 الروابط

- **الموقع الرئيسي:** http://localhost:3000
- **لوحة التحكم:** http://localhost:3000/admin
- **الباك إند API:** http://localhost:8000

## 👤 بيانات تسجيل دخول المدير

- **البريد الإلكتروني:** admin@handmadebags.com
- **كلمة المرور:** admin123

## 📱 المميزات

### للعملاء:
- ✅ تصفح المنتجات
- ✅ إضافة للسلة
- ✅ إتمام الشراء

### للمدير:
- ✅ إدارة المنتجات
- ✅ إدارة الطلبات
- ✅ لوحة تحكم شاملة

## 🆘 استكشاف الأخطاء

### مشكلة: الباك إند لا يعمل
- تأكد من تثبيت Python
- تأكد من صحة بيانات Supabase في ملف .env

### مشكلة: الفرونت إند لا يعمل
- تأكد من تثبيت Node.js
- تأكد من تشغيل الباك إند أولاً

### مشكلة: لا يمكن تسجيل الدخول
- تأكد من تنفيذ ملف schema.sql في Supabase
- تأكد من صحة بيانات تسجيل الدخول

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع ملف README.md
2. تأكد من تثبيت جميع المتطلبات
3. فحص console المتصفح للرسائل

---

**تم تطوير هذا المشروع بواسطة فريق تطوير محترف** 🚀
