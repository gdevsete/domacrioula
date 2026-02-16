/**
 * Vercel Serverless Function - Criar Transação PIX PodPay
 * 
 * Endpoint: POST /api/podpay/create-transaction
 * 
 * Este endpoint protege a chave secreta da API PodPay,
 * mantendo-a apenas no servidor (variáveis de ambiente Vercel).
 */

// Configuração CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  // Apenas POST permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Use POST to create a transaction' 
    })
  }

  // Validar chave secreta nas variáveis de ambiente
  const secretKey = process.env.PODPAY_SECRET_KEY
  
  if (!secretKey) {
    console.error('PODPAY_SECRET_KEY not configured in environment variables')
    return res.status(500).json({ 
      error: 'Configuration error',
      message: 'Payment service not configured' 
    })
  }

  try {
    const { amount, customer, items, pix } = req.body

    console.log('[PodPay] Received request:', JSON.stringify({ amount, customer: { ...customer, document: '***' }, items }))

    // Validações básicas
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Amount must be a positive number (in cents)'
      })
    }

    if (!customer || !customer.email) {
      return res.status(400).json({
        error: 'Invalid customer',
        message: 'Customer email is required'
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid items',
        message: 'At least one item is required'
      })
    }

    // Formatar documento (apenas números)
    const cleanDocument = customer.document ? customer.document.replace(/\D/g, '') : null
    const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : null

    // Payload para PodPay - formato conforme documentação
    const payload = {
      amount: Math.round(amount), // Valor em centavos
      paymentMethod: 'pix',
      customer: {
        name: customer.name || 'Cliente',
        email: customer.email
      },
      items: items.map((item, index) => ({
        title: item.title || item.name,
        unitPrice: Math.round(item.unitPrice || item.price),
        quantity: item.quantity || 1,
        tangible: true
      }))
    }

    // Adicionar campos opcionais se existirem
    if (cleanPhone) {
      payload.customer.phone = cleanPhone
    }
    if (cleanDocument) {
      // document deve ser objeto com type e number
      payload.customer.document = {
        type: cleanDocument.length === 14 ? 'cnpj' : 'cpf',
        number: cleanDocument
      }
    }

    console.log('[PodPay] Sending to API:', JSON.stringify(payload))

    // Autenticação Basic: publicKey:secretKey em base64
    const publicKey = process.env.PODPAY_PUBLIC_KEY || ''
    
    // Log para debug (mostra apenas início das chaves)
    console.log('[PodPay] Auth check - publicKey starts with:', publicKey ? publicKey.substring(0, 10) + '...' : 'EMPTY')
    console.log('[PodPay] Auth check - secretKey starts with:', secretKey ? secretKey.substring(0, 10) + '...' : 'EMPTY')
    
    const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64')

    // Chamar API PodPay
    const response = await fetch('https://api.podpay.pro/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    console.log('[PodPay] API Response:', response.status)
    console.log('[PodPay] Full response data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('PodPay API error:', JSON.stringify(data))
      return res.status(response.status).json({
        error: 'Payment API error',
        message: data.message || data.errors?.[0]?.message || 'Failed to create transaction',
        details: data
      })
    }

    // Log para debug dos campos PIX
    console.log('[PodPay] PIX data:', JSON.stringify({
      'data.pix': data.pix,
      'data.pixQrCode': data.pixQrCode,
      'data.qrCode': data.qrCode,
      'data.qrcode': data.qrcode
    }))

    // Calcular data de expiração (1 hora a partir de agora)
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

    // Enviar notificação ao admin via WhatsApp
    try {
      const adminWhatsapp = process.env.ADMIN_WHATSAPP || '5551998137009'
      const itemsList = items.map(i => `• ${i.title || i.name} (${i.quantity}x)`).join('\n')
      const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount / 100)
      
      const message = `🛒 *NOVO PIX GERADO!*\n\n` +
        `👤 *Cliente:* ${customer.name || 'Não informado'}\n` +
        `📱 *WhatsApp:* ${customer.phone || 'Não informado'}\n` +
        `📧 *Email:* ${customer.email}\n\n` +
        `📦 *Produtos:*\n${itemsList}\n\n` +
        `💰 *Total:* ${totalFormatted}\n\n` +
        `⏳ Aguardando pagamento...`

      // Enviar via API de notificação (não bloquear se falhar)
      fetch(`${req.headers.origin || 'https://www.domacrioulacaixastermicaspersonalizadas.site'}/api/notify/whatsapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: adminWhatsapp,
          data: { message }
        })
      }).catch(err => console.error('[Notify] WhatsApp error:', err))
    } catch (notifyError) {
      console.error('[Notify] Error sending notification:', notifyError)
    }

    // Retornar dados da transação - tentar múltiplos caminhos possíveis
    const pixData = data.pix || {}
    return res.status(200).json({
      success: true,
      transactionId: data.id,
      status: data.status,
      amount: data.amount,
      pix: {
        qrCode: pixData.qrCode || pixData.qrcode || pixData.qr_code || data.pixQrCode || data.qrCode || data.qrcode,
        qrCodeImage: pixData.qrCodeImage || pixData.qrcodeImage || pixData.qr_code_url || pixData.qrCodeUrl || data.pixQrCodeUrl,
        copyPaste: pixData.copyPaste || pixData.copiaECola || pixData.qrCode || pixData.qrcode || data.pixQrCode || data.qrCode,
        expiresAt: expiresAt // Usar data calculada
      },
      createdAt: data.createdAt || data.date_created || data.created_at,
      // Incluir dados brutos para debug
      rawPix: data.pix,
      rawData: data
    })

  } catch (error) {
    console.error('Transaction creation error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process payment request'
    })
  }
}
