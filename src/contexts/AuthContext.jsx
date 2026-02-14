import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

// Chave para armazenamento local (cache)
const STORAGE_KEYS = {
  USER: 'doma_crioula_user',
  TOKEN: 'doma_crioula_token'
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Obter token do localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }, [])

  // Carregar usuário ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getToken()
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
        
        if (token && storedUser) {
          // Tentar validar token no servidor
          try {
            const { user: serverUser } = await authService.getMe(token)
            setUser(serverUser)
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(serverUser))
          } catch (error) {
            // Token inválido - limpar e deslogar
            console.warn('Token inválido, fazendo logout:', error.message)
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem(STORAGE_KEYS.TOKEN)
        localStorage.removeItem(STORAGE_KEYS.USER)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    loadUser()
  }, [getToken])

  // Registrar novo usuário
  const register = useCallback(async (userData) => {
    const { name, email, password, phone, document } = userData
    
    // Validações básicas
    if (!name || !email || !password) {
      throw new Error('Nome, e-mail e senha são obrigatórios')
    }
    
    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }
    
    // Chamar API de registro
    const result = await authService.registerUser({
      email: email.toLowerCase().trim(),
      password,
      name: name.trim(),
      phone: phone || null,
      document: document || null
    })
    
    // Salvar token e usuário localmente
    localStorage.setItem(STORAGE_KEYS.TOKEN, result.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user))
    
    setUser(result.user)
    
    return result.user
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios')
    }
    
    // Chamar API de login
    const result = await authService.loginUser({
      email: email.toLowerCase().trim(),
      password
    })
    
    // Salvar token e usuário localmente
    localStorage.setItem(STORAGE_KEYS.TOKEN, result.token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user))
    
    setUser(result.user)
    
    return result.user
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    setUser(null)
  }, [])

  // Atualizar perfil
  const updateProfile = useCallback(async (updates) => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }
    
    const token = getToken()
    if (!token) {
      throw new Error('Token não encontrado')
    }
    
    // Chamar API de atualização
    const result = await authService.updateUser(token, updates)
    
    // Atualizar cache local
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user))
    setUser(result.user)
    
    return result.user
  }, [user, getToken])

  // Adicionar pedido
  const addOrder = useCallback(async (orderData) => {
    const token = getToken()
    
    // Chamar API de criação de pedido
    const result = await authService.createOrder(token, {
      items: orderData.items,
      total: orderData.total,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping || 0,
      discount: orderData.discount || 0,
      customer: {
        email: orderData.customerEmail,
        name: orderData.customerName,
        phone: orderData.customerPhone,
        document: orderData.customerDocument
      },
      shippingAddress: orderData.shippingAddress,
      paymentMethod: orderData.paymentMethod,
      transactionId: orderData.transactionId,
      pixCode: orderData.pixCode,
      pixQrCode: orderData.pixQrCode
    })
    
    return result.order
  }, [getToken])

  // Obter pedidos do usuário
  const getUserOrders = useCallback(async () => {
    const token = getToken()
    if (!token) return []
    
    try {
      const orders = await authService.getOrders(token)
      return orders
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      return []
    }
  }, [getToken])

  // Buscar pedido por número (mantido para compatibilidade)
  const findOrder = useCallback(async (searchTerm) => {
    // Por enquanto, buscar na lista de pedidos
    const orders = await getUserOrders()
    const term = searchTerm.trim().toUpperCase()
    
    return orders.find(o => 
      o.order_number?.toUpperCase() === term ||
      o.orderNumber?.toUpperCase() === term ||
      o.transaction_id?.toUpperCase() === term
    )
  }, [getUserOrders])

  // Atualizar pedido (para admin - será implementado separadamente)
  const updateOrder = useCallback(async (orderId, updates) => {
    // TODO: Implementar quando necessário
    console.warn('updateOrder: não implementado ainda')
    return null
  }, [])

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    addOrder,
    getUserOrders,
    findOrder,
    updateOrder,
    getToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export default AuthContext
