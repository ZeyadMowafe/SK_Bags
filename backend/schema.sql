-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    in_stock BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (with is_admin field)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer JSONB NOT NULL, -- Stores customer info as JSON
    items JSONB NOT NULL, -- Stores order items as JSON array
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin); -- Index for admin lookup

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, full_name, password_hash, is_admin) 
VALUES (
    'admin@handmadebags.com', 
    'مدير النظام', 
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Ge',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, image_url, category, stock_quantity) VALUES
(
    'شنطة جلد طبيعي كلاسيك',
    'شنطة يد من الجلد الطبيعي عالي الجودة، مصنوعة بحرفية عالية مع تفاصيل أنيقة. مثالية للمناسبات الرسمية والكاجوال.',
    850.00,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    'classic',
    10
),
(
    'شنطة بوهيمية ملونة',
    'شنطة يد بتصميم بوهيمي فريد مع ألوان زاهية وتطريز جميل، مثالية للمناسبات والخروجات.',
    650.00,
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop',
    'bohemian',
    15
),
(
    'شنطة كروس صغيرة',
    'شنطة كروس عملية وأنيقة، مناسبة للاستخدام اليومي مع تصميم عصري ومساحة مناسبة.',
    450.00,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    'crossbody',
    20
),
(
    'شنطة كلتش فاخرة',
    'شنطة كلتش أنيقة مصنوعة يدوياً بتفاصيل ذهبية، مثالية للمناسبات الخاصة.',
    750.00,
    'https://images.unsplash.com/photo-1566150902409-dd739999b331?w=400&h=400&fit=crop',
    'clutch',
    8
),
(
    'شنطة ظهر عملية',
    'شنطة ظهر مريحة وعملية مع جيوب متعددة، مصنوعة من مواد عالية الجودة.',
    550.00,
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    'backpack',
    12
),
(
    'شنطة توتي كبيرة',
    'شنطة توتي واسعة مثالية للتسوق والسفر، مصنوعة من القماش المتين والجلد الطبيعي.',
    380.00,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
    'tote',
    25
) ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "Products are insertable by admin users" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Products are updatable by admin users" ON products
    FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Products are deletable by admin users" ON products
    FOR DELETE USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

-- Create policies for orders table
CREATE POLICY "Orders are insertable by everyone" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are viewable by admin users" ON orders
    FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Orders are updatable by admin users" ON orders
    FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

-- Create policies for users table
CREATE POLICY "Users are viewable by admin users" ON users
    FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Users are insertable by admin users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Users are updatable by admin users" ON users
    FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

CREATE POLICY "Users are deletable by admin users" ON users
    FOR DELETE USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
    ));

-- Allow first admin user creation without authentication
CREATE POLICY "First user can be created without auth" ON users
    FOR INSERT WITH CHECK (
        NOT EXISTS (SELECT 1 FROM users)
    );
