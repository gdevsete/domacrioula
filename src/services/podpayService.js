/**
 * PodPay Service - Cliente para API de Pagamentos
 * 
 * Este serviço faz chamadas ao backend serverless (Vercel Functions)
 * que protege as credenciais da API PodPay.
 * 
 * @version 2.0.0
 * @author Doma Crioula
 */

// URL base da API (funciona tanto local quanto produção)
const getApiUrl = () => {
  // Em desenvolvimento, usar proxy do Vite
  if (import.meta.env.DEV) {
    return ''
  }
  // Em produção, API está no mesmo domínio
  return ''
}

/**
 * Cria uma transação PIX
 * 
 * @param {Object} params - Parâmetros da transação
 * @param {number} params.amount - Valor total em centavos (Ex: 10000 = R$ 100,00)
 * @param {Object} params.customer - Dados do cliente { email, name?, phone?, document? }
 * @param {Array} params.items - Lista de produtos [{ title, unitPrice, quantity }]
 * @param {Object} params.pix - Config PIX { expiresIn? } (opcional)
 * @returns {Promise<Object>} Dados da transação com QR Code PIX
 * 
 * @example
 * const transaction = await createPixTransaction({
 *   amount: 22999,
 *   customer: { email: 'cliente@email.com', name: 'João Silva' },
 *   items: [{ title: 'Caixa Térmica 30L', unitPrice: 22999, quantity: 1 }]
 * })
 */
export const createPixTransaction = async ({ amount, customer, items, pix, shippingAddress }) => {
  const apiUrl = getApiUrl()

  try {
    const response = await fetch(`${apiUrl}/api/podpay/create-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount,
        customer,
        items,
        pix,
        shippingAddress
      })
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.message || 'Erro ao criar transação PIX'
      console.error('[PodPay] Erro na criação:', errorMessage)
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('[PodPay] createPixTransaction error:', error)
    throw error
  }
}

/**
 * Busca o status de uma transação
 * 
 * @param {string} transactionId - ID da transação retornado na criação
 * @returns {Promise<Object>} Status da transação { status, paidAt, ... }
 * 
 * @example
 * const status = await getTransaction('txn_abc123')
 * if (status.status === 'paid') { ... }
 */
export const getTransaction = async (transactionId) => {
  const apiUrl = getApiUrl()

  try {
    const response = await fetch(
      `${apiUrl}/api/podpay/get-transaction?id=${encodeURIComponent(transactionId)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.message || 'Erro ao buscar transação'
      console.error('[PodPay] Erro na busca:', errorMessage)
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('[PodPay] getTransaction error:', error)
    throw error
  }
}

/**
 * Formata valor em centavos para moeda brasileira
 * 
 * @param {number} cents - Valor em centavos
 * @returns {string} Valor formatado (R$ X.XXX,XX)
 * 
 * @example
 * formatCurrency(22999) // "R$ 229,99"
 * formatCurrency(109999) // "R$ 1.099,99"
 */
export const formatCurrency = (cents) => {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return 'R$ 0,00'
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100)
}

/**
 * Converte valor em reais para centavos
 * 
 * @param {number} reais - Valor em reais
 * @returns {number} Valor em centavos (inteiro)
 * 
 * @example
 * toCents(229.99) // 22999
 * toCents(1099.99) // 109999
 */
export const toCents = (reais) => {
  if (typeof reais !== 'number' || isNaN(reais)) {
    return 0
  }
  return Math.round(reais * 100)
}

/**
 * Converte centavos para reais
 * 
 * @param {number} cents - Valor em centavos
 * @returns {number} Valor em reais
 */
export const toReais = (cents) => {
  if (typeof cents !== 'number' || isNaN(cents)) {
    return 0
  }
  return cents / 100
}

// Export default para compatibilidade
export default {
  createPixTransaction,
  getTransaction,
  formatCurrency,
  toCents,
  toReais
}
