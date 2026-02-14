import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// Chave para armazenamento
const STORAGE_KEYS = {
  USER: 'doma_crioula_user',
  TOKEN: 'doma_crioula_token',
  USERS_DB: 'doma_crioula_users_db',
  ORDERS_DB: 'doma_crioula_orders_db'
}

// Gerar ID único
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Gerar token simples (em produção usar JWT)
const generateToken = (userId) => {
  const payload = {
    userId,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 dias
    iat: Date.now()
  }
  return btoa(JSON.stringify(payload))
}

// Validar token
const validateToken = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Hash simples (em produção usar bcrypt no servidor)
const hashPassword = (password) => {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36) + btoa(password.split('').reverse().join(''))
}

// Verificar senha
const verifyPassword = (password, hashedPassword) => {
  return hashPassword(password) === hashedPassword
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
        
        if (token && storedUser) {
          const payload = validateToken(token)
          if (payload) {
            const userData = JSON.parse(storedUser)
            setUser(userData)
          } else {
            // Token expirado
            localStorage.removeItem(STORAGE_KEYS.TOKEN)
            localStorage.removeItem(STORAGE_KEYS.USER)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    loadUser()
  }, [])

  // Obter banco de usuários
  const getUsersDB = useCallback(() => {
    try {
      const db = localStorage.getItem(STORAGE_KEYS.USERS_DB)
      return db ? JSON.parse(db) : []
    } catch {
      return []
    }
  }, [])

  // Salvar banco de usuários
  const saveUsersDB = useCallback((users) => {
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users))
  }, [])

  // Obter banco de pedidos
  const getOrdersDB = useCallback(() => {
    try {
      const db = localStorage.getItem(STORAGE_KEYS.ORDERS_DB)
      return db ? JSON.parse(db) : []
    } catch {
      return []
    }
  }, [])

  // Salvar banco de pedidos
  const saveOrdersDB = useCallback((orders) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS_DB, JSON.stringify(orders))
  }, [])

  // Registrar novo usuário
  const register = useCallback(async (userData) => {
    const { name, email, password, phone, document, documentType, ...address } = userData
    
    // Validações
    if (!name || !email || !password) {
      throw new Error('Nome, e-mail e senha são obrigatórios')
    }
    
    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres')
    }
    
    const users = getUsersDB()
    
    // Verificar se e-mail já existe
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Este e-mail já está cadastrado')
    }
    
    // Criar novo usuário
    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      phone: phone || '',
      document: document || '',
      documentType: documentType || 'cpf',
      address: {
        zipCode: address.zipCode || '',
        street: address.street || '',
        streetNumber: address.streetNumber || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Salvar no banco
    users.push(newUser)
    saveUsersDB(users)
    
    // Gerar token e fazer login
    const token = generateToken(newUser.id)
    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword))
    
    setUser(userWithoutPassword)
    
    return userWithoutPassword
  }, [getUsersDB, saveUsersDB])

  // Login
  const login = useCallback(async (email, password) => {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios')
    }
    
    const users = getUsersDB()
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!foundUser) {
      throw new Error('E-mail ou senha incorretos')
    }
    
    if (!verifyPassword(password, foundUser.password)) {
      throw new Error('E-mail ou senha incorretos')
    }
    
    // Gerar token
    const token = generateToken(foundUser.id)
    const userWithoutPassword = { ...foundUser }
    delete userWithoutPassword.password
    
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword))
    
    setUser(userWithoutPassword)
    
    return userWithoutPassword
  }, [getUsersDB])

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
    
    const users = getUsersDB()
    const userIndex = users.findIndex(u => u.id === user.id)
    
    if (userIndex === -1) {
      throw new Error('Usuário não encontrado')
    }
    
    // Atualizar dados
    const updatedUser = {
      ...users[userIndex],
      ...updates,
      address: {
        ...users[userIndex].address,
        ...(updates.address || {})
      },
      updatedAt: new Date().toISOString()
    }
    
    // Manter senha original
    if (updates.password) {
      updatedUser.password = hashPassword(updates.password)
    } else {
      updatedUser.password = users[userIndex].password
    }
    
    users[userIndex] = updatedUser
    saveUsersDB(users)
    
    const userWithoutPassword = { ...updatedUser }
    delete userWithoutPassword.password
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword))
    setUser(userWithoutPassword)
    
    return userWithoutPassword
  }, [user, getUsersDB, saveUsersDB])

  // Adicionar pedido
  const addOrder = useCallback((orderData) => {
    const orders = getOrdersDB()
    
    const newOrder = {
      id: generateId(),
      orderNumber: `DC${Date.now().toString().slice(-8)}`,
      userId: user?.id || null,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerDocument: orderData.customerDocument,
      items: orderData.items,
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      total: orderData.total,
      paymentStatus: orderData.paymentStatus || 'pending', // pending, paid, failed, refunded
      paymentMethod: orderData.paymentMethod || 'pix',
      transactionId: orderData.transactionId,
      shippingAddress: orderData.shippingAddress,
      trackingCode: null, // Será preenchido pelo admin
      trackingUrl: null,
      status: 'processing', // processing, shipped, delivered, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    orders.push(newOrder)
    saveOrdersDB(orders)
    
    return newOrder
  }, [user, getOrdersDB, saveOrdersDB])

  // Obter pedidos do usuário
  const getUserOrders = useCallback(() => {
    if (!user) return []
    
    const orders = getOrdersDB()
    return orders
      .filter(o => o.userId === user.id || o.customerEmail?.toLowerCase() === user.email?.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [user, getOrdersDB])

  // Buscar pedido por código de rastreio ou número
  const findOrder = useCallback((searchTerm) => {
    const orders = getOrdersDB()
    const term = searchTerm.trim().toUpperCase()
    
    return orders.find(o => 
      o.orderNumber?.toUpperCase() === term ||
      o.trackingCode?.toUpperCase() === term ||
      o.transactionId?.toUpperCase() === term
    )
  }, [getOrdersDB])

  // Atualizar pedido (para admin futuro)
  const updateOrder = useCallback((orderId, updates) => {
    const orders = getOrdersDB()
    const orderIndex = orders.findIndex(o => o.id === orderId)
    
    if (orderIndex === -1) {
      throw new Error('Pedido não encontrado')
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    saveOrdersDB(orders)
    return orders[orderIndex]
  }, [getOrdersDB, saveOrdersDB])

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
    updateOrder
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
