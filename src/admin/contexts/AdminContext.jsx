import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const AdminContext = createContext(null)

// Chaves de armazenamento
const ADMIN_STORAGE_KEYS = {
  ADMIN_USER: 'doma_crioula_admin',
  ADMIN_TOKEN: 'doma_crioula_admin_token',
  PRODUCTS_DB: 'doma_crioula_products_db',
  SETTINGS_DB: 'doma_crioula_settings_db'
}

// Credenciais padrão do admin (em produção, usar banco de dados seguro)
const DEFAULT_ADMIN = {
  id: 'admin_001',
  email: 'admin@domacrioula.com.br',
  password: 'Admin@2026!', // Em produção, hash
  name: 'Administrador',
  role: 'super_admin',
  avatar: null,
  createdAt: '2026-01-01T00:00:00.000Z'
}

// Gerar token
const generateAdminToken = (adminId) => {
  const payload = {
    adminId,
    role: 'admin',
    exp: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    iat: Date.now()
  }
  return btoa(JSON.stringify(payload))
}

// Validar token
const validateAdminToken = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Sistema de som de notificação usando Web Audio API
const playNotificationSound = (type = 'default') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configurar som baseado no tipo
    if (type === 'sale') {
      // Som de venda: mais alegre (duas notas ascendentes)
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2) // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.4)
    } else if (type === 'customer') {
      // Som de novo cliente: simples e amigável
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime) // A4
      oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.15) // C#5
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } else {
      // Som padrão
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    }
    
    oscillator.type = 'sine'
  } catch (error) {
    console.log('Som de notificação não disponível:', error)
  }
}

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])
  
  // Refs para monitorar novos pedidos/clientes
  const lastOrderCountRef = useRef(0)
  const lastCustomerCountRef = useRef(0)
  const isFirstLoadRef = useRef(true)

  // Carregar admin do localStorage
  useEffect(() => {
    const loadAdmin = () => {
      try {
        const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
        const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_USER)
        
        if (token && storedAdmin) {
          const payload = validateAdminToken(token)
          if (payload) {
            setAdmin(JSON.parse(storedAdmin))
          } else {
            localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
            localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_USER)
          }
        }
      } catch (error) {
        console.error('Erro ao carregar admin:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdmin()
  }, [])

  // Monitorar novos pedidos e clientes em tempo real
  useEffect(() => {
    if (!admin) return // Só monitora se admin estiver logado
    
    const checkForNewData = () => {
      try {
        const ordersDB = JSON.parse(localStorage.getItem('doma_crioula_orders_db') || '[]')
        const usersDB = JSON.parse(localStorage.getItem('doma_crioula_users_db') || '[]')
        
        const currentOrderCount = ordersDB.length
        const currentCustomerCount = usersDB.length
        
        // Na primeira carga, apenas salvar os valores
        if (isFirstLoadRef.current) {
          lastOrderCountRef.current = currentOrderCount
          lastCustomerCountRef.current = currentCustomerCount
          isFirstLoadRef.current = false
          return
        }
        
        // Verificar novos pedidos
        if (currentOrderCount > lastOrderCountRef.current) {
          const newOrdersCount = currentOrderCount - lastOrderCountRef.current
          const latestOrder = ordersDB[ordersDB.length - 1]
          
          setNotifications(prev => [...prev, {
            id: Date.now().toString(36) + '_sale',
            type: 'success',
            title: `🎉 Nova Venda!`,
            message: latestOrder?.customer?.name 
              ? `${latestOrder.customer.name} fez um pedido` 
              : `${newOrdersCount} novo(s) pedido(s) recebido(s)`,
            timestamp: Date.now()
          }])
          
          playNotificationSound('sale')
          lastOrderCountRef.current = currentOrderCount
          
          // Auto-remover após 8 segundos
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => !n.id.endsWith('_sale') || Date.now() - n.timestamp > 7000))
          }, 8000)
        }
        
        // Verificar novos clientes
        if (currentCustomerCount > lastCustomerCountRef.current) {
          const newCustomersCount = currentCustomerCount - lastCustomerCountRef.current
          const latestCustomer = usersDB[usersDB.length - 1]
          
          setNotifications(prev => [...prev, {
            id: Date.now().toString(36) + '_customer',
            type: 'info',
            title: `👤 Novo Cliente!`,
            message: latestCustomer?.name 
              ? `${latestCustomer.name} se cadastrou` 
              : `${newCustomersCount} novo(s) cliente(s) cadastrado(s)`,
            timestamp: Date.now()
          }])
          
          playNotificationSound('customer')
          lastCustomerCountRef.current = currentCustomerCount
          
          // Auto-remover após 8 segundos
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => !n.id.endsWith('_customer') || Date.now() - n.timestamp > 7000))
          }, 8000)
        }
      } catch (error) {
        console.error('Erro ao verificar novos dados:', error)
      }
    }
    
    // Verificar a cada 10 segundos
    const interval = setInterval(checkForNewData, 10000)
    
    // Verificar imediatamente na primeira vez
    checkForNewData()
    
    return () => clearInterval(interval)
  }, [admin])

  // Login do admin
  const loginAdmin = useCallback(async (email, password) => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))

    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const adminData = {
        id: DEFAULT_ADMIN.id,
        email: DEFAULT_ADMIN.email,
        name: DEFAULT_ADMIN.name,
        role: DEFAULT_ADMIN.role,
        avatar: DEFAULT_ADMIN.avatar,
        lastLogin: new Date().toISOString()
      }
      
      const token = generateAdminToken(adminData.id)
      
      localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN, token)
      localStorage.setItem(ADMIN_STORAGE_KEYS.ADMIN_USER, JSON.stringify(adminData))
      
      setAdmin(adminData)
      
      // Adicionar notificação de boas-vindas
      addNotification({
        type: 'success',
        title: 'Bem-vindo!',
        message: `Login realizado com sucesso`
      })
      
      return { success: true }
    }

    throw new Error('Credenciais inválidas')
  }, [])

  // Logout do admin
  const logoutAdmin = useCallback(() => {
    localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
    localStorage.removeItem(ADMIN_STORAGE_KEYS.ADMIN_USER)
    setAdmin(null)
  }, [])

  // Adicionar notificação
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString(36)
    setNotifications(prev => [...prev, { ...notification, id, timestamp: Date.now() }])
    
    // Tocar som de notificação baseado no tipo
    if (notification.sound !== false) {
      playNotificationSound(notification.soundType || 'default')
    }
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }, [])

  // Remover notificação
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Obter estatísticas do sistema
  const getStats = useCallback(() => {
    try {
      const usersDB = JSON.parse(localStorage.getItem('doma_crioula_users_db') || '[]')
      const ordersDB = JSON.parse(localStorage.getItem('doma_crioula_orders_db') || '[]')
      const productsDB = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEYS.PRODUCTS_DB) || '[]')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const ordersToday = ordersDB.filter(o => new Date(o.createdAt) >= today)
      const revenueToday = ordersToday.reduce((sum, o) => sum + (o.total || 0), 0)
      const totalRevenue = ordersDB.reduce((sum, o) => sum + (o.total || 0), 0)

      const pendingOrders = ordersDB.filter(o => o.status === 'pending' || o.status === 'waiting_payment')
      const processingOrders = ordersDB.filter(o => o.status === 'processing' || o.status === 'paid')
      const completedOrders = ordersDB.filter(o => o.status === 'delivered' || o.status === 'completed')

      return {
        totalUsers: usersDB.length,
        totalOrders: ordersDB.length,
        totalProducts: productsDB.length,
        ordersToday: ordersToday.length,
        revenueToday,
        totalRevenue,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        completedOrders: completedOrders.length,
        conversionRate: usersDB.length > 0 ? ((ordersDB.length / usersDB.length) * 100).toFixed(1) : 0,
        averageTicket: ordersDB.length > 0 ? totalRevenue / ordersDB.length : 0
      }
    } catch {
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalProducts: 0,
        ordersToday: 0,
        revenueToday: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        conversionRate: 0,
        averageTicket: 0
      }
    }
  }, [])

  // Obter pedidos
  const getOrders = useCallback((filters = {}) => {
    try {
      let orders = JSON.parse(localStorage.getItem('doma_crioula_orders_db') || '[]')
      
      if (filters.status && filters.status !== 'all') {
        orders = orders.filter(o => o.status === filters.status)
      }
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        orders = orders.filter(o => 
          o.id?.toLowerCase().includes(search) ||
          o.customer?.name?.toLowerCase().includes(search) ||
          o.customer?.email?.toLowerCase().includes(search)
        )
      }
      
      if (filters.dateFrom) {
        orders = orders.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom))
      }
      
      if (filters.dateTo) {
        orders = orders.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo))
      }

      // Ordenar por data (mais recente primeiro)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return orders
    } catch {
      return []
    }
  }, [])

  // Atualizar status do pedido
  const updateOrderStatus = useCallback((orderId, newStatus) => {
    try {
      const orders = JSON.parse(localStorage.getItem('doma_crioula_orders_db') || '[]')
      const index = orders.findIndex(o => o.id === orderId)
      
      if (index !== -1) {
        orders[index].status = newStatus
        orders[index].updatedAt = new Date().toISOString()
        orders[index].statusHistory = orders[index].statusHistory || []
        orders[index].statusHistory.push({
          status: newStatus,
          timestamp: new Date().toISOString(),
          updatedBy: admin?.name || 'Admin'
        })
        
        localStorage.setItem('doma_crioula_orders_db', JSON.stringify(orders))
        
        addNotification({
          type: 'success',
          title: 'Status atualizado',
          message: `Pedido ${orderId} atualizado para ${newStatus}`
        })
        
        return true
      }
      return false
    } catch {
      return false
    }
  }, [admin, addNotification])

  // Obter clientes do servidor
  const getCustomers = useCallback(async (filters = {}) => {
    try {
      const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
      if (!token) return []

      const params = new URLSearchParams()
      if (filters.search) {
        params.append('search', filters.search)
      }

      const response = await fetch(`/api/auth/customers?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        console.error('Erro ao buscar clientes')
        return []
      }

      const data = await response.json()
      return data.customers || []
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      return []
    }
  }, [])

  // Deletar cliente do servidor
  const deleteCustomer = useCallback(async (customerId) => {
    try {
      const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
      if (!token) return false

      const response = await fetch(`/api/auth/customers?id=${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        addNotification({
          type: 'error',
          title: 'Erro ao deletar',
          message: error.error || 'Erro ao deletar cliente'
        })
        return false
      }

      addNotification({
        type: 'success',
        title: 'Cliente deletado',
        message: 'Cliente foi removido com sucesso'
      })
      
      return true
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      return false
    }
  }, [addNotification])

  // Obter produtos do servidor
  const getProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products')
      
      if (!response.ok) {
        console.error('Erro ao buscar produtos')
        return []
      }

      const data = await response.json()
      return data.products || []
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      return []
    }
  }, [])

  // Salvar produto no servidor
  const saveProduct = useCallback(async (product) => {
    try {
      const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
      if (!token) return false

      const method = product.id ? 'PUT' : 'POST'
      const response = await fetch('/api/products', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      })

      if (!response.ok) {
        const error = await response.json()
        addNotification({
          type: 'error',
          title: 'Erro ao salvar',
          message: error.error || 'Erro ao salvar produto'
        })
        return false
      }
      
      addNotification({
        type: 'success',
        title: 'Produto salvo',
        message: `Produto "${product.name}" foi salvo com sucesso`
      })
      
      return true
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      return false
    }
  }, [addNotification])

  // Excluir produto no servidor
  const deleteProduct = useCallback(async (productId) => {
    try {
      const token = localStorage.getItem(ADMIN_STORAGE_KEYS.ADMIN_TOKEN)
      if (!token) return false

      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        addNotification({
          type: 'error',
          title: 'Erro ao excluir',
          message: error.error || 'Erro ao excluir produto'
        })
        return false
      }
      
      addNotification({
        type: 'success',
        title: 'Produto excluído',
        message: 'Produto foi removido com sucesso'
      })
      
      return true
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      return false
    }
  }, [getProducts, addNotification])

  // Obter configurações
  const getSettings = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEYS.SETTINGS_DB) || JSON.stringify({
        siteName: 'Doma Crioula',
        siteDescription: 'Tradição em Churrasco',
        email: 'contato@domacrioula.com.br',
        phone: '(51) 99813-7009',
        whatsapp: '5199813-7009',
        address: {
          street: '',
          number: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        },
        social: {
          facebook: '',
          instagram: '',
          youtube: ''
        },
        shipping: {
          freeShippingMinValue: 299,
          defaultShippingCost: 15
        },
        payment: {
          pixEnabled: true,
          pixDiscount: 5,
          boletoEnabled: false,
          cardEnabled: false
        },
        notifications: {
          emailOnNewOrder: true,
          whatsappOnNewOrder: true
        }
      }))
    } catch {
      return {}
    }
  }, [])

  // Salvar configurações
  const saveSettings = useCallback((settings) => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEYS.SETTINGS_DB, JSON.stringify(settings))
      
      addNotification({
        type: 'success',
        title: 'Configurações salvas',
        message: 'As configurações foram atualizadas com sucesso'
      })
      
      return true
    } catch {
      return false
    }
  }, [addNotification])

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    sidebarCollapsed,
    notifications,
    loginAdmin,
    logoutAdmin,
    toggleSidebar,
    addNotification,
    removeNotification,
    getStats,
    getOrders,
    updateOrderStatus,
    getCustomers,
    deleteCustomer,
    getProducts,
    saveProduct,
    deleteProduct,
    getSettings,
    saveSettings
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de um AdminProvider')
  }
  return context
}

export default AdminContext
