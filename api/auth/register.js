/**
 * API de Registro de Usuário
 * POST /api/auth/register
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
    const { email, password, name, phone, document, address } = req.body

    console.log('=== REGISTRO RECEBIDO ===')
    console.log('Email:', email)
    console.log('Name:', name)
    console.log('Address recebido:', JSON.stringify(address))

    // Validações
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: email, password, name' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter no mínimo 6 caracteres' 
      })
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' })
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    // Montar array de endereços
    const addresses = address ? [address] : []
    console.log('Addresses a salvar:', JSON.stringify(addresses))

    // Salvar dados adicionais na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        document: document || null,
        addresses: addresses,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    console.log('userData salvo:', JSON.stringify(userData))

    if (userError) {
      console.error('User insert error:', userError)
      // Deletar usuário do auth se falhar inserir na tabela
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: 'Erro ao criar usuário' })
    }

    // Fazer login automático para obter token válido
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (loginError) {
      console.error('Auto-login error:', loginError)
      // Ainda retornar sucesso, usuário terá que fazer login manual
      const savedAddresses = userData.addresses || []
      const savedAddress = savedAddresses.length > 0 ? savedAddresses[0] : null
      
      return res.status(201).json({
        success: true,
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          document: userData.document,
          address: savedAddress,
          addresses: savedAddresses
        },
        token: null,
        message: 'Cadastro realizado. Faça login para continuar.'
      })
    }

    // Extrair endereço salvo para retornar
    const savedAddresses = userData.addresses || []
    const savedAddress = savedAddresses.length > 0 ? savedAddresses[0] : null

    return res.status(201).json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        document: userData.document,
        address: savedAddress,
        addresses: savedAddresses
      },
      token: loginData.session.access_token
    })

  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
