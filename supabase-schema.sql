-- =====================================================
-- SCHEMA SUPABASE - DOMA CRIOULA
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'super_admin' ou 'admin'
  avatar TEXT,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de usuários (clientes)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL, -- em centavos
  subtotal INTEGER DEFAULT 0,
  shipping INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  customer JSONB NOT NULL,
  shipping_address JSONB,
  payment_method TEXT DEFAULT 'pix',
  transaction_id TEXT,
  pix_code TEXT,
  pix_qr_code TEXT,
  status TEXT DEFAULT 'waiting_payment',
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações da loja
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos (para gerenciar estoque e customizações)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- em centavos
  original_price INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  customizable BOOLEAN DEFAULT false,
  customization_options JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de analytics/visitas
CREATE TABLE IF NOT EXISTS analytics_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page TEXT NOT NULL,
  referrer TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de eventos de analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  page TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_created ON analytics_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visits_visitor ON analytics_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (para evitar erro de duplicação)
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Service role full access users" ON users;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Service role full access settings" ON settings;
DROP POLICY IF EXISTS "Service role full access products" ON products;
DROP POLICY IF EXISTS "Service role full access analytics visits" ON analytics_visits;
DROP POLICY IF EXISTS "Service role full access analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Service role full access admins" ON admins;

-- Políticas de segurança para users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Políticas para service role (nosso backend)
CREATE POLICY "Service role full access users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access settings" ON settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access products" ON products
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analytics visits" ON analytics_visits
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analytics events" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admins" ON admins
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- CÓDIGOS DE RECUPERAÇÃO DE SENHA
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_reset_codes_email ON password_reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_reset_codes_code ON password_reset_codes(code);

-- RLS para códigos de reset
ALTER TABLE password_reset_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage reset codes" ON password_reset_codes;
CREATE POLICY "Service role can manage reset codes" ON password_reset_codes
  FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- CRIAR ADMIN PADRÃO (execute uma vez)
-- Senha: Admin@2026! (hash bcrypt abaixo)
-- =====================================================
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
  'admin@domacrioula.com.br',
  '$2b$10$rOvHPxfzO7rE5PbZi8WkueBQsMgY7.4QL7P.m8vYVEXvCgFIk5Wbq',
  'Administrador',
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- APÓS EXECUTAR, COPIE AS CREDENCIAIS:
-- Settings -> API -> Project URL e service_role key
-- =====================================================
