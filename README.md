👜 Handmade Bags E-commerce Project

A professional e-commerce platform for selling handmade bags, built with modern and scalable technologies.🚀 Features
For Customers

✨ Modern and elegant user interface

🛒 Advanced shopping cart system

📱 Fully responsive design across devices

🔍 Easy product browsing and filtering

💳 Secure ordering system

📞 Clear contact information

For Admin

🔐 Secure admin dashboard

📦 Product management (Add, Edit, Delete)

📋 Order management with status updates

📊 Sales statistics and reports

🖼️ Product image uploads

👥 User management



🛠️ Tech Stack
Frontend

React.js – UI library

Tailwind CSS – CSS framework

React Router – Client-side routing

Lucide React – Modern icons

Axios – HTTP requests

Backend

FastAPI – High-performance Python framework

Supabase – PostgreSQL database with RLS

JWT – Secure authentication

Pydantic – Data validation

Uvicorn – ASGI server

Database

PostgreSQL – Relational database

Row Level Security (RLS) – Advanced access control

Real-time Subscriptions – Live updates

📁 Project Structure
Hand_Made/
├── frontend/                 # React frontend app
│   ├── public/              
│   ├── src/                 
│   │   ├── components/      
│   │   ├── services/        
│   │   └── ...
│   ├── package.json         
│   └── ...
├── backend/                  # FastAPI backend
│   ├── models.py            
│   ├── database.py          
│   ├── auth.py              
│   ├── main.py              
│   ├── requirements.txt     
│   └── ...
├── database/                
│   └── schema.sql           
├── package.json             
├── start_all.bat            
└── README.md                


🚀 Installation & Setup
Prerequisites

Node.js (v16+)

Python (v3.8+)

pip (Python package manager)

Supabase account

Quick Start

Clone the repository:

git clone <repository-url>
cd Hand_Made


Run with batch script (Windows):

start_all.bat


Or manually:

# Install main dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..


Setup database:

Create a new project in Supabase

Copy credentials and update backend/.env

Run database/schema.sql in Supabase

Run the project:

# Backend
cd backend
python run.py

# Frontend (in new terminal)
cd frontend
npm start


🌐 URLs
Main Website: http://localhost:3000

Admin Dashboard: http://localhost:3000/admin

API Docs: http://localhost:8000/docs

Backend Health Check: http://localhost:8000/health

🔐 Default Credentials

Admin

Email: admin@handmadebags.com

Password: admin123

📝 Environment Variables

Create backend/.env:

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

📊 API Endpoints
Products

GET /api/products – Fetch all products

GET /api/products/{id} – Fetch single product

POST /api/admin/products – Add new product

PUT /api/admin/products/{id} – Update product

DELETE /api/admin/products/{id} – Delete product

Orders

GET /api/orders – Fetch all orders

POST /api/orders – Create new order

PUT /api/orders/{id}/status – Update order status

Authentication

POST /api/auth/login – Login

POST /api/auth/register – Register

Files

POST /api/upload-simple – Upload file

🧑‍💻 Development

Add a new component:

cd frontend/src/components
# create new component file


Add a new API endpoint:

cd backend
# update main.py


Update database schema:

cd database
# modify schema.sql and apply in Supabase


🐛 Troubleshooting

Pillow installation error

pip install --only-binary=all Pillow


CORS error
Check CORS settings in backend/main.py.

Database error
Verify .env variables and Supabase schema.

Frontend error

cd frontend
rm -rf node_modules package-lock.json
npm install

📈 Future Improvements

Online payment system

Ratings & reviews system

Notifications system

Mobile app (Flutter)

Inventory management

Advanced analytics & reports

Discounts & promotions system

Multi-language support

🤝 Contribution

Fork the project

Create a new branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

This project is licensed under the MIT License – see the LICENSE file for details.

📞 Support

Email: zezomowafe2@gmail.com

Phone: +20 1102666300
