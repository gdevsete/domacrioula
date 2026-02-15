/**
 * API para listar clientes (Admin)
 * GET /api/auth/customers
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificar autenticação admin (token simples)
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const token = authHeader.split(' ')[1]
  
  // Validar token admin
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now() || payload.role !== 'admin') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured')
    return res.status(500).json({ error: 'Service not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { search } = req.query

    let query = supabase
      .from('users')
      .select('id, email, name, phone, document, addresses, created_at')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: customers, error } = await query

    if (error) {
      console.error('Error fetching customers:', error)
      return res.status(500).json({ error: 'Erro ao buscar clientes' })
    }

    // Formatar dados para o admin
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      document: customer.document,
      addresses: customer.addresses || [],
      createdAt: customer.created_at
    }))

    return res.status(200).json({ 
      customers: formattedCustomers,
      total: formattedCustomers.length
    })

  } catch (error) {
    console.error('Customers API error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
