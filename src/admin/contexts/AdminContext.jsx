import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState([])

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

  // Obter clientes
  const getCustomers = useCallback((filters = {}) => {
    try {
      let users = JSON.parse(localStorage.getItem('doma_crioula_users_db') || '[]')
      
      if (filters.search) {
        const search = filters.search.toLowerCase()
        users = users.filter(u => 
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.phone?.includes(search)
        )
      }

      // Ordenar por data de cadastro (mais recente primeiro)
      users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return users.map(u => ({
        ...u,
        password: undefined // Não expor senha
      }))
    } catch {
      return []
    }
  }, [])

  // Obter produtos
  const getProducts = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEYS.PRODUCTS_DB) || '[]')
    } catch {
      return []
    }
  }, [])

  // Salvar produto
  const saveProduct = useCallback((product) => {
    try {
      const products = getProducts()
      
      if (product.id) {
        // Atualizar existente
        const index = products.findIndex(p => p.id === product.id)
        if (index !== -1) {
          products[index] = { ...products[index], ...product, updatedAt: new Date().toISOString() }
        }
      } else {
        // Criar novo
        products.push({
          ...product,
          id: 'prod_' + Date.now().toString(36),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }
      
      localStorage.setItem(ADMIN_STORAGE_KEYS.PRODUCTS_DB, JSON.stringify(products))
      
      addNotification({
        type: 'success',
        title: 'Produto salvo',
        message: `Produto "${product.name}" foi salvo com sucesso`
      })
      
      return true
    } catch {
      return false
    }
  }, [getProducts, addNotification])

  // Excluir produto
  const deleteProduct = useCallback((productId) => {
    try {
      let products = getProducts()
      products = products.filter(p => p.id !== productId)
      localStorage.setItem(ADMIN_STORAGE_KEYS.PRODUCTS_DB, JSON.stringify(products))
      
      addNotification({
        type: 'success',
        title: 'Produto excluído',
        message: 'Produto foi removido com sucesso'
      })
      
      return true
    } catch {
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
