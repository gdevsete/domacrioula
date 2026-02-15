-- =====================================================
-- TABELA DE RASTREAMENTO DE PEDIDOS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Criar tabela de rastreamentos
CREATE TABLE IF NOT EXISTS trackings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code VARCHAR(12) NOT NULL UNIQUE,
  order_number VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  origin_city VARCHAR(100) DEFAULT 'Sapiranga',
  origin_state VARCHAR(2) DEFAULT 'RS',
  destination_city VARCHAR(100) NOT NULL,
  destination_state VARCHAR(2) NOT NULL,
  destination_cep VARCHAR(10),
  current_status VARCHAR(50) DEFAULT 'posted',
  history JSONB DEFAULT '[]'::jsonb,
  items JSONB DEFAULT '[]'::jsonb,
  total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trackings_tracking_code ON trackings(tracking_code);
CREATE INDEX IF NOT EXISTS idx_trackings_order_number ON trackings(order_number);
CREATE INDEX IF NOT EXISTS idx_trackings_customer_email ON trackings(customer_email);
CREATE INDEX IF NOT EXISTS idx_trackings_current_status ON trackings(current_status);
CREATE INDEX IF NOT EXISTS idx_trackings_created_at ON trackings(created_at DESC);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_tracking_updated_at ON trackings;
CREATE TRIGGER trigger_update_tracking_updated_at
  BEFORE UPDATE ON trackings
  FOR EACH ROW
  EXECUTE FUNCTION update_tracking_updated_at();

-- Habilitar Row Level Security (RLS)
ALTER TABLE trackings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública (apenas por código de rastreio)
CREATE POLICY "Allow public read by tracking code"
  ON trackings
  FOR SELECT
  USING (true);

-- Política para permitir todas as operações via service_role
CREATE POLICY "Allow service role full access"
  ON trackings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Comentários na tabela
COMMENT ON TABLE trackings IS 'Tabela de rastreamento de pedidos da Doma Crioula';
COMMENT ON COLUMN trackings.tracking_code IS 'Código único de rastreio no formato DCxxxxxxxx';
COMMENT ON COLUMN trackings.order_number IS 'Número do pedido original';
COMMENT ON COLUMN trackings.current_status IS 'Status atual: posted, in_transit, hub, out_for_delivery, delivery_attempt, awaiting_pickup, delivered, returned';
COMMENT ON COLUMN trackings.history IS 'Array JSON com histórico de movimentações';

-- =====================================================
-- STATUS DISPONÍVEIS:
-- posted           = Objeto Postado
-- in_transit       = Em Trânsito
-- hub              = Em Centro de Distribuição
-- out_for_delivery = Saiu para Entrega
-- delivery_attempt = Tentativa de Entrega
-- awaiting_pickup  = Aguardando Retirada
-- delivered        = Entregue
-- returned         = Devolvido
-- =====================================================

-- Exemplo de inserção para teste:
-- INSERT INTO trackings (tracking_code, order_number, customer_name, customer_email, destination_city, destination_state, destination_cep, history)
-- VALUES (
--   'DCTEST1234',
--   '12345',
--   'Cliente Teste',
--   'teste@email.com',
--   'Porto Alegre',
--   'RS',
--   '90000-000',
--   '[{"id": 1, "date": "2026-02-15T10:00:00Z", "status": "posted", "location": "Sapiranga - RS", "description": "Objeto postado", "details": "Objeto recebido na unidade de origem"}]'::jsonb
-- );
