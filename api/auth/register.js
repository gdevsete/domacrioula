/**
 * API de Registro de Usuário
 * POST /api/auth/register
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

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
      return res.status(400).json({ 
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      })
    }

    // Verificar se CPF/CNPJ já existe
    if (document) {
      const cleanDoc = document.replace(/\D/g, '')
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

    if (userError) {
      console.error('User insert error:', userError)
      // Deletar usuário do auth se falhar inserir na tabela
      await supabase.auth.admin.deleteUser(authData.user.id)
      return res.status(400).json({ error: 'Erro ao criar usuário' })
    }

    // Enviar email de boas-vindas (não bloquear o registro se falhar)
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    if (RESEND_API_KEY) {
      try {
        const resend = new Resend(RESEND_API_KEY)
        
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: 'Doma Crioula <noreply@domacrioulacaixastermicaspersonalizadas.site>',
          to: [email.toLowerCase()],
          subject: 'Bem-vindo à Doma Crioula! 🎉',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #c45a3d 0%, #2c1810 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Doma Crioula</h1>
                <p style="color: #f0d9c0; margin: 10px 0 0; font-size: 14px;">Tradição em Churrasco</p>
              </div>
              
              <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                <h2 style="color: #2c1810; margin-top: 0;">Olá, ${name}! 👋</h2>
                
                <p>Seja muito bem-vindo(a) à <strong>Doma Crioula</strong>!</p>
                
                <p>Estamos muito felizes em ter você conosco. Agora você faz parte de uma comunidade apaixonada por churrasco de qualidade.</p>
                
                <p>Com sua conta, você pode:</p>
                <ul style="color: #555;">
                  <li>Acompanhar seus pedidos em tempo real</li>
                  <li>Salvar seus endereços de entrega</li>
                  <li>Receber ofertas exclusivas</li>
                  <li>Personalizar suas caixas térmicas</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://domacrioulacaixastermicaspersonalizadas.site/caixas-termicas" 
                     style="background: #c45a3d; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Ver Produtos
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Se tiver alguma dúvida, estamos à disposição pelo WhatsApp ou email.
                </p>
              </div>
              
              <div style="background: #2c1810; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
                <p style="color: #f0d9c0; margin: 0; font-size: 12px;">
                  © 2026 Doma Crioula - Todos os direitos reservados
                </p>
              </div>
            </body>
            </html>
          `
        })
        
        if (emailError) {
          console.error('Welcome email error:', emailError)
        } else {
          console.log('Welcome email sent to:', email, emailData)
        }
      } catch (emailErr) {
        console.error('Welcome email error:', emailErr)
        // Não bloquear o registro se o email falhar
      }
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
