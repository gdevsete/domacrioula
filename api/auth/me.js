/**
 * API para buscar/atualizar usuário
 * GET /api/auth/me - Retorna usuário logado
 * PUT /api/auth/me - Atualiza dados do usuário
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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

  // Verificar token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Verificar token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // GET - Buscar usuário
    if (req.method === 'GET') {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Extrair primeiro endereço do array para facilitar frontend
      const addresses = userData.addresses || []
      const address = addresses.length > 0 ? addresses[0] : null

      return res.status(200).json({
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          document: userData.document,
          address: address,
          addresses: addresses
        }
      })
    }

    // PUT - Atualizar usuário
    if (req.method === 'PUT') {
      const { name, phone, document, addresses, address } = req.body

      const updates = {}
      if (name) updates.name = name
      if (phone !== undefined) updates.phone = phone
      if (document !== undefined) updates.document = document
      
      // Suporta tanto 'address' (objeto) quanto 'addresses' (array)
      if (address !== undefined) {
        // Se recebeu address singular, converte para array
        updates.addresses = [address]
      } else if (addresses !== undefined) {
        updates.addresses = addresses
      }
      
      updates.updated_at = new Date().toISOString()

      const { data: userData, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Update error:', error)
        return res.status(400).json({ error: 'Erro ao atualizar' })
      }

      // Extrair primeiro endereço do array para facilitar frontend
      const updatedAddresses = userData.addresses || []
      const updatedAddress = updatedAddresses.length > 0 ? updatedAddresses[0] : null

      return res.status(200).json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          document: userData.document,
          address: updatedAddress,
          addresses: updatedAddresses
        }
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Me API error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
