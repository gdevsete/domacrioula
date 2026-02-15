/**
 * API de Envio de Email
 * POST /api/email/send
 * Usa Resend para enviar emails
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Templates de email
const emailTemplates = {
  welcome: (name) => ({
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
  }),

  resetCode: (name, code) => ({
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
          <h2 style="color: #2c1810; margin-top: 0;">Olá, ${name}!</h2>
          
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

  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  try {
    const { to, template, data } = req.body

    if (!to || !template) {
      return res.status(400).json({ error: 'Campos obrigatórios: to, template' })
    }

    // Gerar conteúdo do email baseado no template
    let emailContent
    switch (template) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data?.name || 'Cliente')
        break
      case 'resetCode':
        emailContent = emailTemplates.resetCode(data?.name || 'Cliente', data?.code)
        break
      default:
        return res.status(400).json({ error: 'Template inválido' })
    }

    // Enviar email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Doma Crioula <noreply@domacrioulacaixastermicaspersonalizadas.site>',
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Resend error:', result)
      return res.status(400).json({ error: 'Erro ao enviar email' })
    }

    return res.status(200).json({ success: true, messageId: result.id })

  } catch (error) {
    console.error('Email send error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
