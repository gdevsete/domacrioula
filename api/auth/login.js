/**
 * API de Login de Usuário
 * POST /api/auth/login
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not configured')
    return res.status(500).json({ error: 'Service not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    // Fazer login com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (authError) {
      console.error('Login error:', authError)
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    // Extrair primeiro endereço do array para facilitar frontend
    const addresses = userData.addresses || []
    const address = addresses.length > 0 ? addresses[0] : null

    return res.status(200).json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        document: userData.document,
        address: address,
        addresses: addresses
      },
      token: authData.session.access_token
    })

  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
