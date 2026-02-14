/**
 * Serviço de Autenticação
 * Faz chamadas à API de autenticação no backend
 */

const getApiUrl = () => {
  if (import.meta.env.DEV) {
    return ''
  }
  return ''
}

/**
 * Helper para fazer fetch com tratamento de erro
 */
const safeFetch = async (url, options) => {
  const response = await fetch(url, options)
  
  // Tentar parsear JSON, mas tratar resposta vazia
  let data = null
  const text = await response.text()
  
  if (text) {
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Erro ao parsear resposta:', text)
      throw new Error('Resposta inválida do servidor')
    }
  }
  
  return { response, data }
}

/**
 * Registrar novo usuário
 */
export const registerUser = async ({ email, password, name, phone, document }) => {
  const apiUrl = getApiUrl()
  
  const { response, data } = await safeFetch(`${apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, name, phone, document })
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao registrar')
  }

  return data
}

/**
 * Login de usuário
 */
export const loginUser = async ({ email, password }) => {
  const apiUrl = getApiUrl()
  
  const { response, data } = await safeFetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Email ou senha incorretos')
  }

  return data
}

/**
 * Buscar usuário logado
 */
export const getMe = async (token) => {
  const apiUrl = getApiUrl()
  
  const { response, data } = await safeFetch(`${apiUrl}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao buscar usuário')
  }

  return data
}

/**
 * Atualizar dados do usuário
 */
export const updateUser = async (token, updates) => {
  const apiUrl = getApiUrl()
  
  const { response, data } = await safeFetch(`${apiUrl}/api/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao atualizar')
  }

  return data
}

/**
 * Buscar pedidos do usuário
 */
export const getOrders = async (token) => {
  const apiUrl = getApiUrl()
  
  const { response, data } = await safeFetch(`${apiUrl}/api/orders`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao buscar pedidos')
  }

  return data?.orders || []
}

/**
 * Criar novo pedido
 */
export const createOrder = async (token, orderData) => {
  const apiUrl = getApiUrl()
  
  const headers = {
    'Content-Type': 'application/json'
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const { response, data } = await safeFetch(`${apiUrl}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  })

  if (!response.ok) {
    throw new Error(data?.error || 'Erro ao criar pedido')
  }

  return data
}