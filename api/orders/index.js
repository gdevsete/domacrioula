/**
 * API de Pedidos
 * GET /api/orders - Lista pedidos do usuário
 * POST /api/orders - Cria novo pedido
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Verificar token (opcional para criar pedido, obrigatório para listar)
  const authHeader = req.headers.authorization
  let userId = null

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) userId = user.id
  }

  try {
    // GET - Listar pedidos do usuário
    if (req.method === 'GET') {
      if (!userId) {
        return res.status(401).json({ error: 'Token obrigatório' })
      }

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('List orders error:', error)
        return res.status(400).json({ error: 'Erro ao buscar pedidos' })
      }

      return res.status(200).json({ orders })
    }

    // POST - Criar pedido
    if (req.method === 'POST') {
      const { 
        items, 
        total, 
        subtotal,
        shipping,
        discount,
        customer, 
        shippingAddress, 
        paymentMethod,
        transactionId,
        pixCode,
        pixQrCode
      } = req.body

      if (!items || !items.length || !total || !customer) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: items, total, customer' 
        })
      }

      // Gerar número do pedido
      const orderNumber = `DC${Date.now().toString(36).toUpperCase()}`

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId,
          items,
          total,
          subtotal: subtotal || total,
          shipping: shipping || 0,
          discount: discount || 0,
          customer,
          shipping_address: shippingAddress,
          payment_method: paymentMethod || 'pix',
          transaction_id: transactionId,
          pix_code: pixCode,
          pix_qr_code: pixQrCode,
          status: 'waiting_payment',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Create order error:', error)
        return res.status(400).json({ error: 'Erro ao criar pedido' })
      }

      return res.status(201).json({
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          status: order.status,
          total: order.total,
          createdAt: order.created_at
        }
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Orders API error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
