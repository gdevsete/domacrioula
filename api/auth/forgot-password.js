/**
 * API de Esqueci a Senha
 * POST /api/auth/forgot-password
 * Gera código e envia por email
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Gerar código de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' })
    }

    // Verificar se o email existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      // Por segurança, sempre retornar sucesso
      return res.status(200).json({ 
        success: true, 
        message: 'Se o email existir, você receberá um código de recuperação.' 
      })
    }

    // Gerar código
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Invalidar códigos anteriores
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    // Salvar novo código
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

    // Enviar email com código
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Doma Crioula <noreply@domacriolacaixastermicaspersonalizadas.site>',
            to: [user.email],
            subject: 'Código de Recuperação de Senha - Doma Crioula',
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
                  <p style="color: #f0d9c0; margin: 10px 0 0; font-size: 14px;">Recuperação de Senha</p>
                </div>
                
                <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
                  <h2 style="color: #2c1810; margin-top: 0;">Olá, ${user.name || 'Cliente'}!</h2>
                  
                  <p>Recebemos uma solicitação para redefinir sua senha.</p>
                  
                  <p>Use o código abaixo para continuar:</p>
                  
                  <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; color: #c45a3d; letter-spacing: 8px;">${code}</span>
                  </div>
                  
                  <p style="color: #666; font-size: 14px;">
                    <strong>Este código expira em 15 minutos.</strong>
                  </p>
                  
                  <p style="color: #666; font-size: 14px;">
                    Se você não solicitou a redefinição de senha, ignore este email.
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
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
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
