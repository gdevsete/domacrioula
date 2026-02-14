/**
 * Vercel Serverless Function - Consultar Transação PodPay
 * 
 * Endpoint: GET /api/podpay/get-transaction?id={transactionId}
 * 
 * Este endpoint permite verificar o status de uma transação PIX
 * para saber se o pagamento foi confirmado.
 */

// Configuração CORS
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Apenas GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Use GET to fetch transaction status' 
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

  const { id } = req.query

  if (!id) {
    return res.status(400).json({
      error: 'Missing transaction ID',
      message: 'Transaction ID is required'
    })
  }

  try {
    // Autenticação Basic: publicKey:secretKey em base64
    const publicKey = process.env.PODPAY_PUBLIC_KEY || ''
    const auth = 'Basic ' + Buffer.from(publicKey + ':' + secretKey).toString('base64')

    // Chamar API PodPay
    const response = await fetch(`https://api.podpay.pro/v1/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': auth
      }
    })

    const data = await response.json()

    console.log('[PodPay] Get Transaction Response:', response.status, JSON.stringify(data))

    if (!response.ok) {
      console.error('PodPay API error:', data)
      return res.status(response.status).json({
        error: 'Payment API error',
        message: data.errors?.[0]?.message || data.message || 'Failed to fetch transaction',
        details: data.errors || data
      })
    }

    // Retornar status da transação
    return res.status(200).json({
      success: true,
      transactionId: data.id,
      status: data.status,
      amount: data.amount,
      paidAt: data.paidAt || data.paid_at || data.date_updated || null,
      createdAt: data.createdAt || data.created_at || data.date_created
    })

  } catch (error) {
    console.error('Transaction fetch error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch transaction status'
    })
  }
}
