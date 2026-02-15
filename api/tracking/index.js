/**
 * API de Rastreamento de Pedidos
 * 
 * GET /api/tracking?code=XXX - Buscar rastreio por código
 * GET /api/tracking?all=true - Listar todos os rastreios (admin)
 * POST /api/tracking - Criar novo rastreio (admin)
 * PUT /api/tracking - Atualizar rastreio (admin)
 * DELETE /api/tracking?id=XXX - Deletar rastreio (admin)
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Admin-Token',
}

// Gerar código de rastreio único (formato: DC + 8 caracteres alfanuméricos)
function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'DC'
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Validar token JWT do admin
function validateAdminToken(token) {
  try {
    if (!token) return null
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    // Verificar se não expirou
    if (payload.exp < Date.now()) return null
    // Verificar se tem role de admin
    if (payload.role !== 'admin') return null
    return payload
  } catch {
    return null
  }
}

// Verificar se é admin
function isAdmin(req) {
  const adminToken = req.headers['x-admin-token']
  // Validar o token JWT
  return validateAdminToken(adminToken) !== null
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Serviço não configurado' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // ==========================================
    // GET - Buscar rastreio por código ou listar todos
    // ==========================================
    if (req.method === 'GET') {
      const { code, all, customer_email } = req.query

      // Buscar todos os rastreios (apenas admin)
      if (all === 'true') {
        if (!isAdmin(req)) {
          return res.status(403).json({ error: 'Acesso negado' })
        }

        const { data, error } = await supabase
          .from('trackings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        return res.status(200).json({ trackings: data || [] })
      }

      // Buscar rastreios por email do cliente (para área do cliente)
      if (customer_email) {
        const { data, error } = await supabase
          .from('trackings')
          .select('*')
          .eq('customer_email', customer_email.toLowerCase())
          .order('created_at', { ascending: false })

        if (error) throw error

        return res.status(200).json({ trackings: data || [] })
      }

      // Buscar rastreio específico por código
      if (code) {
        const { data, error } = await supabase
          .from('trackings')
          .select('*')
          .or(`tracking_code.eq.${code.toUpperCase()},order_number.eq.${code.toUpperCase()}`)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (!data) {
          return res.status(404).json({ error: 'Rastreio não encontrado' })
        }

        return res.status(200).json({ tracking: data })
      }

      return res.status(400).json({ error: 'Parâmetro code, all ou customer_email é obrigatório' })
    }

    // ==========================================
    // POST - Criar novo rastreio (apenas admin)
    // ==========================================
    if (req.method === 'POST') {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const { 
        order_number, 
        customer_name, 
        customer_email,
        customer_phone,
        destination_city,
        destination_state,
        destination_cep,
        items,
        total
      } = req.body

      if (!order_number || !customer_name || !destination_city) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: order_number, customer_name, destination_city' 
        })
      }

      // Gerar código de rastreio único
      let trackingCode = generateTrackingCode()
      
      // Verificar se código já existe
      const { data: existing } = await supabase
        .from('trackings')
        .select('id')
        .eq('tracking_code', trackingCode)
        .single()

      if (existing) {
        trackingCode = generateTrackingCode() // Gerar outro
      }

      // Criar histórico inicial
      const now = new Date()
      const initialHistory = [{
        id: Date.now(),
        date: now.toISOString(),
        status: 'posted',
        location: 'Sapiranga - RS',
        description: 'Objeto postado',
        details: 'Objeto recebido na unidade de origem'
      }]

      const { data, error } = await supabase
        .from('trackings')
        .insert({
          tracking_code: trackingCode,
          order_number: order_number.toUpperCase(),
          customer_name,
          customer_email: customer_email?.toLowerCase() || null,
          customer_phone: customer_phone || null,
          origin_city: 'Sapiranga',
          origin_state: 'RS',
          destination_city,
          destination_state: destination_state || '',
          destination_cep: destination_cep || '',
          current_status: 'posted',
          history: initialHistory,
          items: items || [],
          total: total || 0,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return res.status(201).json({ 
        success: true, 
        tracking: data,
        message: `Rastreio ${trackingCode} criado com sucesso`
      })
    }

    // ==========================================
    // PUT - Atualizar rastreio (apenas admin)
    // ==========================================
    if (req.method === 'PUT') {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const { 
        id, 
        new_status, 
        status_description, 
        status_location,
        status_details,
        destination_city,
        destination_state,
        destination_cep
      } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID do rastreio é obrigatório' })
      }

      // Buscar rastreio atual
      const { data: current, error: fetchError } = await supabase
        .from('trackings')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      if (!current) {
        return res.status(404).json({ error: 'Rastreio não encontrado' })
      }

      const updates = {
        updated_at: new Date().toISOString()
      }

      // Atualizar destino se fornecido
      if (destination_city) updates.destination_city = destination_city
      if (destination_state) updates.destination_state = destination_state
      if (destination_cep) updates.destination_cep = destination_cep

      // Adicionar novo status ao histórico
      if (new_status && status_description) {
        const newHistoryEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          status: new_status,
          location: status_location || current.destination_city + ' - ' + current.destination_state,
          description: status_description,
          details: status_details || ''
        }

        updates.history = [...(current.history || []), newHistoryEntry]
        updates.current_status = new_status
      }

      const { data, error } = await supabase
        .from('trackings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return res.status(200).json({ 
        success: true, 
        tracking: data,
        message: 'Rastreio atualizado com sucesso'
      })
    }

    // ==========================================
    // DELETE - Deletar rastreio (apenas admin)
    // ==========================================
    if (req.method === 'DELETE') {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: 'Acesso negado' })
      }

      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'ID do rastreio é obrigatório' })
      }

      const { error } = await supabase
        .from('trackings')
        .delete()
        .eq('id', id)

      if (error) throw error

      return res.status(200).json({ 
        success: true, 
        message: 'Rastreio deletado com sucesso'
      })
    }

    return res.status(405).json({ error: 'Método não permitido' })

  } catch (error) {
    console.error('Tracking API Error:', error)
    return res.status(500).json({ error: error.message || 'Erro interno do servidor' })
  }
}
