/**
 * Webhook PodPay - Recebe notificações de pagamento
 * 
 * Endpoint: POST /api/podpay/webhook
 * 
 * Este endpoint é chamado pelo PodPay quando o status de uma transação muda.
 * Atualiza o pedido no banco de dados e dispara eventos.
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Webhook-Signature',
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('[Webhook] Recebido:', JSON.stringify(req.body))

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Webhook] Supabase não configurado')
    return res.status(500).json({ error: 'Service not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const { 
      id,
      transactionId,
      transaction_id,
      status,
      event,
      type,
      data
    } = req.body

    // PodPay pode enviar em diferentes formatos
    const txnId = id || transactionId || transaction_id || data?.id || data?.transactionId
    const txnStatus = status || data?.status || event || type

    console.log(`[Webhook] Transaction ID: ${txnId}, Status: ${txnStatus}`)

    if (!txnId) {
      console.log('[Webhook] ID da transação não encontrado no payload')
      return res.status(200).json({ received: true, message: 'No transaction ID' })
    }

    // Buscar pedido pelo transaction_id
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('transaction_id', txnId)
      .single()

    if (findError || !order) {
      console.log('[Webhook] Pedido não encontrado para transação:', txnId)
      return res.status(200).json({ received: true, message: 'Order not found' })
    }

    // Determinar novo status
    let newStatus = order.status
    const isPaid = ['paid', 'approved', 'completed', 'pago', 'aprovado'].some(s => 
      txnStatus?.toLowerCase?.()?.includes?.(s)
    )
    const isCancelled = ['cancelled', 'canceled', 'failed', 'expired', 'cancelado', 'expirado'].some(s => 
      txnStatus?.toLowerCase?.()?.includes?.(s)
    )

    if (isPaid) {
      newStatus = 'paid'
    } else if (isCancelled) {
      newStatus = 'cancelled'
    }

    // Atualizar pedido
    if (newStatus !== order.status) {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      if (isPaid) {
        updateData.paid_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (updateError) {
        console.error('[Webhook] Erro ao atualizar pedido:', updateError)
      } else {
        console.log(`[Webhook] Pedido ${order.order_number} atualizado: ${order.status} -> ${newStatus}`)
      }

      // Se pago, disparar evento Purchase para CAPI
      if (isPaid) {
        try {
          const customerData = typeof order.customer === 'string' 
            ? JSON.parse(order.customer) 
            : order.customer
          
          const items = typeof order.items === 'string' 
            ? JSON.parse(order.items) 
            : order.items

          // Disparar evento para Facebook Conversions API
          const eventData = {
            eventName: 'Purchase',
            eventData: {
              content_name: items.map(i => i.name).join(', '),
              content_ids: items.map(i => i.id || i.name),
              content_type: 'product',
              num_items: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
              value: order.total,
              currency: 'BRL',
              transaction_id: txnId
            },
            userData: {
              em: customerData?.email,
              ph: customerData?.phone
            },
            eventSourceUrl: 'https://www.domacrioulacaixastermicaspersonalizadas.site/checkout'
          }

          // Enviar para CAPI
          const origin = process.env.SITE_URL || 'https://www.domacrioulacaixastermicaspersonalizadas.site'
          await fetch(`${origin}/api/meta/event`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
          }).catch(err => console.error('[Webhook] CAPI error:', err))

          console.log('[Webhook] Evento Purchase enviado para CAPI')

          // Notificar admin via WhatsApp
          const itemsList = items.map(i => `• ${i.name} (${i.quantity}x)`).join('\n')
          const totalFormatted = new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(order.total / 100)

          const message = `✅ *PAGAMENTO CONFIRMADO!*\n\n` +
            `📦 *Pedido:* #${order.order_number}\n` +
            `👤 *Cliente:* ${customerData?.name || 'Não informado'}\n` +
            `📱 *WhatsApp:* ${customerData?.phone || 'Não informado'}\n` +
            `📧 *Email:* ${customerData?.email}\n\n` +
            `📦 *Produtos:*\n${itemsList}\n\n` +
            `💰 *Total:* ${totalFormatted}\n\n` +
            `✅ Pagamento confirmado via PIX!`

          await fetch(`${origin}/api/notify/whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: process.env.ADMIN_WHATSAPP,
              data: { message }
            })
          }).catch(err => console.error('[Webhook] WhatsApp error:', err))

        } catch (eventError) {
          console.error('[Webhook] Erro ao disparar eventos:', eventError)
        }
      }
    }

    return res.status(200).json({ 
      received: true, 
      orderId: order.id,
      orderNumber: order.order_number,
      status: newStatus
    })

  } catch (error) {
    console.error('[Webhook] Erro:', error)
    // Retornar 200 para o PodPay não ficar reenviando
    return res.status(200).json({ received: true, error: error.message })
  }
}
