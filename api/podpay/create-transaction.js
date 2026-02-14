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

    // Payload para PodPay
    const payload = {
      amount,
      currency: 'BRL',
      paymentMethod: 'pix',
      items: items.map(item => ({
        title: item.title || item.name,
        unitPrice: item.unitPrice || item.price,
        quantity: item.quantity || 1,
        tangible: item.tangible !== false
      })),
      customer: {
        email: customer.email,
        name: customer.name || 'Cliente',
        phone: customer.phone || undefined,
        document: customer.document || undefined
      },
      pix: {
        expiresIn: pix?.expiresIn || 3600 // 1 hora padrão
      }
    }

    // Chamar API PodPay
    const response = await fetch('https://api.podpay.pro/v1/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PodPay API error:', data)
      return res.status(response.status).json({
        error: 'Payment API error',
        message: data.message || 'Failed to create transaction',
        details: process.env.NODE_ENV === 'development' ? data : undefined
      })
    }

    // Retornar dados da transação (sem expor dados sensíveis)
    return res.status(200).json({
      success: true,
      transactionId: data.id,
      status: data.status,
      amount: data.amount,
      pix: {
        qrCode: data.pix?.qrCode || data.pix?.qr_code,
        qrCodeImage: data.pix?.qrCodeImage || data.pix?.qr_code_url,
        copyPaste: data.pix?.copyPaste || data.pix?.qr_code,
        expiresAt: data.pix?.expiresAt || data.pix?.expires_at
      },
      createdAt: data.createdAt || data.created_at
    })

  } catch (error) {
    console.error('Transaction creation error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process payment request'
    })
  }
}
