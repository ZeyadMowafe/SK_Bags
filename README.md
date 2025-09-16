# 👜 Handmade Bags E-commerce Platform

A modern, full-stack e-commerce platform specifically designed for selling handmade bags. Built with cutting-edge technologies to provide a seamless shopping experience for customers and powerful management tools for administrators.

## 🌟 Features

### 🛍️ Customer Experience
- **Elegant UI/UX**: Clean, modern interface optimized for product showcase
- **Smart Shopping Cart**: Advanced cart management with real-time updates
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Product Discovery**: Intuitive browsing with advanced filtering and search
- **Secure Checkout**: Safe and streamlined ordering process
- **Easy Contact**: Clear communication channels with the store

### 🔧 Admin Management
- **Secure Dashboard**: Protected admin area with role-based access
- **Product Management**: Complete CRUD operations for product catalog
- **Order Processing**: Comprehensive order management with status tracking
- **Analytics Dashboard**: Sales insights and performance metrics
- **Media Management**: Easy product image upload and management
- **User Administration**: Customer account and profile management

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | Modern UI library for building interactive interfaces |
| **Tailwind CSS** | Utility-first CSS framework for rapid styling |
| **React Router** | Client-side routing and navigation |
| **Lucide React** | Beautiful, customizable icon library |
| **Axios** | Promise-based HTTP client for API communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance Python web framework |
| **Supabase** | Backend-as-a-service with PostgreSQL database |
| **JWT** | Secure token-based authentication |
| **Pydantic** | Data validation and settings management |
| **Uvicorn** | Lightning-fast ASGI server |

### Database & Infrastructure
- **PostgreSQL**: Robust relational database
- **Row Level Security (RLS)**: Advanced data access control
- **Real-time Subscriptions**: Live updates for dynamic content

## 📁 Project Architecture

```
Hand_Made/
├── 🎨 frontend/                    # React application
│   ├── public/                     # Static assets
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   ├── pages/                  # Route components
│   │   ├── services/               # API service layer
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Helper functions
│   │   └── styles/                 # Global styles
│   ├── package.json
│   └── tailwind.config.js
├── ⚡ backend/                     # FastAPI server
│   ├── models.py                   # Database models
│   ├── database.py                 # Database configuration
│   ├── auth.py                     # Authentication logic
│   ├── main.py                     # Application entry point
│   ├── routers/                    # API route handlers
│   ├── middleware/                 # Custom middleware
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Environment variables
├── 🗄️ database/
│   ├── schema.sql                  # Database schema
│   └── migrations/                 # Database migrations
├── 📋 docs/                        # Documentation
├── package.json                    # Root package configuration
├── start_all.bat                   # Windows startup script
└── README.md
```

## 🚀 Quick Start

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)
- **Supabase** account

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Hand_Made
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
SECRET_KEY=your_jwt_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. Database Setup
1. Create a new project in [Supabase](https://supabase.com)
2. Navigate to the SQL editor in your Supabase dashboard
3. Execute the schema from `database/schema.sql`
4. Update your `.env` file with the database credentials

### 4. Installation

#### Option A: Automated Setup (Windows)
```bash
start_all.bat
```

#### Option B: Manual Setup
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

### 5. Run the Application

#### Start Backend Server
```bash
cd backend
python run.py
# Backend will be available at http://localhost:8000
```

#### Start Frontend Application
```bash
cd frontend
npm start
# Frontend will be available at http://localhost:3000
```

## 🌐 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Main Website** | http://localhost:3000 | Customer-facing e-commerce site |
| **Admin Dashboard** | http://localhost:3000/admin | Admin management panel |
| **API Documentation** | http://localhost:8000/docs | Interactive API documentation |
| **API Health Check** | http://localhost:8000/health | Backend status endpoint |

## 🔐 Default Admin Access

For initial setup and testing:
- **Email**: `admin@handmadebags.com`
- **Password**: `admin123`

> ⚠️ **Important**: Change these credentials in production!

## 📚 API Documentation

### Products
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/products` | Get all products | No |
| `GET` | `/api/products/{id}` | Get single product | No |
| `POST` | `/api/admin/products` | Create new product | Yes (Admin) |
| `PUT` | `/api/admin/products/{id}` | Update product | Yes (Admin) |
| `DELETE` | `/api/admin/products/{id}` | Delete product | Yes (Admin) |

### Orders
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/orders` | Get all orders | Yes (Admin) |
| `POST` | `/api/orders` | Create new order | No |
| `PUT` | `/api/orders/{id}/status` | Update order status | Yes (Admin) |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/refresh` | Refresh access token |

### File Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/upload-simple` | Upload product images | Yes (Admin) |

## 🛠️ Development Guide

### Adding New Features

#### Frontend Component
```bash
cd frontend/src/components
# Create your component file
touch NewComponent.jsx
```

#### Backend Endpoint
```python
# In backend/routers/
# Create or modify router files
# Add your new endpoints
```

#### Database Changes
```sql
-- In database/migrations/
-- Create migration file
-- Update schema as needed
```

## 🐛 Common Issues & Solutions

### Backend Issues

**Pillow Installation Error**
```bash
pip install --only-binary=all Pillow
```

**CORS Problems**
- Check CORS middleware configuration in `backend/main.py`
- Ensure frontend URL is in allowed origins

**Database Connection Error**
- Verify `.env` variables are correct
- Check Supabase project status
- Ensure database schema is properly applied

### Frontend Issues

**Dependencies Error**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Build Error**
- Check for syntax errors in components
- Verify all imports are correct
- Ensure environment variables are set

## 📈 Future Roadmap

### Phase 1 - Core Enhancements
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications system
- [ ] Advanced search and filtering
- [ ] Product reviews and ratings

### Phase 2 - Advanced Features
- [ ] Inventory management system
- [ ] Multi-language support (Arabic/English)
- [ ] Advanced analytics dashboard
- [ ] SEO optimization

### Phase 3 - Expansion
- [ ] Mobile app (React Native/Flutter)
- [ ] Vendor marketplace functionality
- [ ] Subscription box service
- [ ] Social media integration

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the project
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

Need help? Get in touch:

- **Email**: zezomowafe2@gmail.com
- **Phone**: +20 1102666300


---

<div align="center">



⭐ Star this repo if you find it helpful!

</div>
