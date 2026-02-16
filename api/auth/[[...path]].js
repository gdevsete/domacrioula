/**
 * API de Autenticação Consolidada
 * 
 * Rotas:
 * - POST /api/auth/login - Login de usuário
 * - POST /api/auth/register - Registro de usuário
 * - GET/PUT /api/auth/me - Buscar/atualizar usuário logado
 * - GET /api/auth/customers - Listar clientes (admin)
 * - POST /api/auth/forgot-password - Solicitar código de recuperação
 * - POST /api/auth/reset-password - Redefinir senha com código
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Gerar código de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// ==================== LOGIN ====================
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    if (authError) {
      console.error('Login error:', authError)
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

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

// ==================== REGISTER ====================
async function handleRegister(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  try {
    const { email, password, name, phone, document, address } = req.body

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

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(400).json({ 
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      })
    }

    if (document) {
      const { data: existingDoc } = await supabase
        .from('users')
        .select('id, email')
        .eq('document', document)
        .single()

      if (existingDoc) {
        return res.status(400).json({ 
          error: 'CPF/CNPJ já cadastrado. Faça login ou recupere sua senha.',
          code: 'DOCUMENT_EXISTS'
        })
      }
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return res.status(400).json({ error: authError.message })
    }

    const addresses = address ? [address] : []

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

    if (userError) {
      console.error('User insert error:', userError)
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: 'Erro ao criar usuário' })
    }

    // Enviar email de boas-vindas
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY)
        await resend.emails.send({
          from: 'Doma Crioula <noreply@domacrioulacaixastermicaspersonalizadas.site>',
          to: [email.toLowerCase()],
          subject: 'Bem-vindo à Doma Crioula! 🎉',
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #c45a3d 0%, #2c1810 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Doma Crioula</h1>
              </div>
              <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #2c1810;">Olá, ${name}! 👋</h2>
                <p>Seja muito bem-vindo(a) à <strong>Doma Crioula</strong>!</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://domacrioulacaixastermicaspersonalizadas.site/caixas-termicas" 
                     style="background: #c45a3d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Ver Produtos
                  </a>
                </div>
              </div>
              <div style="background: #2c1810; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #f0d9c0; margin: 0; font-size: 12px;">© 2026 Doma Crioula</p>
              </div>
            </body>
            </html>
          `
        })
      } catch (emailErr) {
        console.error('Welcome email error:', emailErr)
      }
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    })

    const savedAddresses = userData.addresses || []
    const savedAddress = savedAddresses.length > 0 ? savedAddresses[0] : null

    if (loginError) {
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

// ==================== ME (GET/PUT) ====================
async function handleMe(req, res) {
  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }

    // GET
    if (req.method === 'GET') {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

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

    // PUT
    if (req.method === 'PUT') {
      const { name, phone, document, addresses, address } = req.body

      const updates = {}
      if (name) updates.name = name
      if (phone !== undefined) updates.phone = phone
      if (document !== undefined) updates.document = document
      
      if (address !== undefined) {
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

// ==================== CUSTOMERS (Admin) ====================
async function handleCustomers(req, res) {
  // Validar admin token
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  const token = authHeader.split(' ')[1]
  
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now() || payload.role !== 'admin') {
      return res.status(401).json({ error: 'Token inválido ou expirado' })
    }
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  // GET - Listar clientes
  if (req.method === 'GET') {
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

  // DELETE - Deletar cliente
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório' })
      }

      // Deletar da tabela users
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (userError) {
        console.error('Error deleting user from users:', userError)
        return res.status(500).json({ error: 'Erro ao deletar cliente' })
      }

      // Deletar do Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id)

      if (authError) {
        console.error('Error deleting user from auth:', authError)
        // Não retornar erro pois o usuário já foi removido da tabela
      }

      return res.status(200).json({ 
        success: true,
        message: 'Cliente deletado com sucesso'
      })

    } catch (error) {
      console.error('Delete customer error:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// ==================== FORGOT PASSWORD ====================
async function handleForgotPassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      return res.status(200).json({ 
        success: true, 
        message: 'Se o email existir, você receberá um código de recuperação.' 
      })
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    const { error: codeError } = await supabase
      .from('password_reset_codes')
      .insert({
        user_id: user.id,
        email: user.email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (codeError) {
      console.error('Error saving reset code:', codeError)
      return res.status(500).json({ error: 'Erro ao gerar código' })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY)
        
        await resend.emails.send({
          from: 'Doma Crioula <noreply@domacrioulacaixastermicaspersonalizadas.site>',
          to: [user.email],
          subject: 'Código de Recuperação de Senha - Doma Crioula',
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #c45a3d 0%, #2c1810 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Doma Crioula</h1>
                <p style="color: #f0d9c0; margin: 10px 0 0;">Recuperação de Senha</p>
              </div>
              <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #2c1810;">Olá, ${user.name || 'Cliente'}!</h2>
                <p>Use o código abaixo para redefinir sua senha:</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                  <span style="font-size: 32px; font-weight: bold; color: #c45a3d; letter-spacing: 8px;">${code}</span>
                </div>
                <p style="color: #666; font-size: 14px;"><strong>Este código expira em 15 minutos.</strong></p>
              </div>
              <div style="background: #2c1810; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #f0d9c0; margin: 0; font-size: 12px;">© 2026 Doma Crioula</p>
              </div>
            </body>
            </html>
          `
        })
      } catch (emailErr) {
        console.error('Error sending email:', emailErr)
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Se o email existir, você receberá um código de recuperação.' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// ==================== RESET PASSWORD ====================
async function handleResetPassword(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
    }

    const { data: resetCode, error: codeError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !resetCode) {
      return res.status(400).json({ error: 'Código inválido ou expirado' })
    }

    const authUserId = resetCode.user_id

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUserId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return res.status(500).json({ error: 'Erro ao atualizar senha' })
    }

    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', resetCode.id)

    return res.status(200).json({ 
      success: true, 
      message: 'Senha atualizada com sucesso!' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// ==================== MAIN HANDLER ====================
export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  // Determinar a rota pelo path
  const pathParts = req.query.path || []
  const route = pathParts[0] || ''

  switch (route) {
    case 'login':
      return handleLogin(req, res)
    
    case 'register':
      return handleRegister(req, res)
    
    case 'me':
      return handleMe(req, res)
    
    case 'customers':
      return handleCustomers(req, res)
    
    case 'forgot-password':
      return handleForgotPassword(req, res)
    
    case 'reset-password':
      return handleResetPassword(req, res)
    
    default:
      return res.status(404).json({
        error: 'Not found',
        message: `Route /api/auth/${route} not found`,
        availableRoutes: [
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET/PUT /api/auth/me',
          'GET/DELETE /api/auth/customers',
          'POST /api/auth/forgot-password',
          'POST /api/auth/reset-password'
        ]
      })
  }
}
