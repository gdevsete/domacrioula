import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  User, Mail, Phone, FileText, MapPin, Package, Truck, CheckCircle, 
  Clock, AlertCircle, LogOut, Edit2, Save, X, Loader2, Eye, 
  ShoppingBag, Copy, ExternalLink, ChevronRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './UserPanel.css'

// Formatar telefone
const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

// Formatar CEP
const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 5) return numbers
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

// Formatar data
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatar moeda
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

// Status do pedido
const ORDER_STATUS = {
  processing: { label: 'Em Processamento', color: 'warning', icon: Clock },
  shipped: { label: 'Enviado', color: 'info', icon: Truck },
  delivered: { label: 'Entregue', color: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'error', icon: AlertCircle }
}

// Status do pagamento
const PAYMENT_STATUS = {
  pending: { label: 'Aguardando Pagamento', color: 'warning' },
  paid: { label: 'Pago', color: 'success' },
  approved: { label: 'Aprovado', color: 'success' },
  failed: { label: 'Falhou', color: 'error' },
  refunded: { label: 'Reembolsado', color: 'info' }
}

// Buscar CEP via ViaCEP API
const fetchAddressByCEP = async (cep) => {
  const cleanCEP = cep.replace(/\D/g, '')
  if (cleanCEP.length !== 8) return null
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data = await response.json()
    
    if (data.erro) return null
    
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || ''
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

const UserPanel = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading, logout, updateProfile, getUserOrders } = useAuth()
  
  const [activeTab, setActiveTab] = useState('orders') // orders, profile
  const [orders, setOrders] = useState([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    zipCode: '',
    street: '',
    streetNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  })

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/minha-conta' } } })
    }
  }, [isAuthenticated, authLoading, navigate])

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        document: user.document || '',
        zipCode: user.address?.zipCode || '',
        street: user.address?.street || '',
        streetNumber: user.address?.streetNumber || '',
        complement: user.address?.complement || '',
        neighborhood: user.address?.neighborhood || '',
        city: user.address?.city || '',
        state: user.address?.state || ''
      })
    }
  }, [user])

  // Carregar pedidos
  useEffect(() => {
    if (isAuthenticated) {
      const userOrders = getUserOrders()
      setOrders(userOrders)
    }
  }, [isAuthenticated, getUserOrders])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'phone') {
      formattedValue = formatPhone(value)
    } else if (name === 'zipCode') {
      formattedValue = formatCEP(value)
    }

    setProfileData(prev => ({ ...prev, [name]: formattedValue }))
  }

  // Buscar endereço pelo CEP
  const handleCEPBlur = useCallback(async () => {
    const cleanCEP = profileData.zipCode.replace(/\D/g, '')
    
    if (cleanCEP.length === 8) {
      setLoadingCEP(true)
      const address = await fetchAddressByCEP(cleanCEP)
      setLoadingCEP(false)
      
      if (address) {
        setProfileData(prev => ({
          ...prev,
          street: address.street || prev.street,
          neighborhood: address.neighborhood || prev.neighborhood,
          city: address.city || prev.city,
          state: address.state || prev.state
        }))
      }
    }
  }, [profileData.zipCode])

  const handleSaveProfile = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    
    try {
      await updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        address: {
          zipCode: profileData.zipCode,
          street: profileData.street,
          streetNumber: profileData.streetNumber,
          complement: profileData.complement,
          neighborhood: profileData.neighborhood,
          city: profileData.city,
          state: profileData.state
        }
      })
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setEditingProfile(false)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar perfil' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingProfile(false)
    // Restaurar dados originais
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        document: user.document || '',
        zipCode: user.address?.zipCode || '',
        street: user.address?.street || '',
        streetNumber: user.address?.streetNumber || '',
        complement: user.address?.complement || '',
        neighborhood: user.address?.neighborhood || '',
        city: user.address?.city || '',
        state: user.address?.state || ''
      })
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const copyTrackingCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  if (authLoading) {
    return (
      <div className="user-panel">
        <div className="user-panel-loading">
          <Loader2 className="user-panel-loading-icon" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="user-panel">
      <div className="user-panel-container">
        {/* Sidebar */}
        <aside className="user-panel-sidebar">
          <div className="user-panel-user-info">
            <div className="user-panel-avatar">
              <User size={32} />
            </div>
            <div className="user-panel-user-details">
              <h3>{user?.name?.split(' ')[0]}</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <nav className="user-panel-nav">
            <button 
              className={`user-panel-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={20} />
              <span>Meus Pedidos</span>
              {orders.length > 0 && (
                <span className="user-panel-badge">{orders.length}</span>
              )}
            </button>
            <button 
              className={`user-panel-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              <span>Meus Dados</span>
            </button>
            <Link to="/rastrear" className="user-panel-nav-item">
              <Package size={20} />
              <span>Rastrear Pedido</span>
            </Link>
          </nav>

          <button className="user-panel-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sair da Conta</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="user-panel-main">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="user-panel-section">
              <div className="user-panel-header">
                <h2>
                  <ShoppingBag size={24} />
                  Meus Pedidos
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="user-panel-empty">
                  <ShoppingBag size={48} />
                  <h3>Nenhum pedido encontrado</h3>
                  <p>Você ainda não realizou nenhuma compra.</p>
                  <Link to="/" className="user-panel-empty-btn">
                    Ver Produtos
                  </Link>
                </div>
              ) : (
                <div className="user-panel-orders">
                  {orders.map(order => {
                    const status = ORDER_STATUS[order.status] || ORDER_STATUS.processing
                    const paymentStatus = PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending
                    const StatusIcon = status.icon
                    
                    return (
                      <div 
                        key={order.id} 
                        className={`user-panel-order ${selectedOrder === order.id ? 'expanded' : ''}`}
                      >
                        <div 
                          className="user-panel-order-header"
                          onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                        >
                          <div className="user-panel-order-info">
                            <div className="user-panel-order-number">
                              <span className="label">Pedido</span>
                              <span className="value">#{order.orderNumber}</span>
                            </div>
                            <div className="user-panel-order-date">
                              <Clock size={14} />
                              <span>{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                          
                          <div className="user-panel-order-status-wrapper">
                            <span className={`user-panel-payment-badge ${paymentStatus.color}`}>
                              {paymentStatus.label}
                            </span>
                            <span className={`user-panel-status-badge ${status.color}`}>
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </div>
                          
                          <div className="user-panel-order-total">
                            <span className="label">Total</span>
                            <span className="value">{formatCurrency(order.total)}</span>
                          </div>
                          
                          <ChevronRight 
                            size={20} 
                            className={`user-panel-order-chevron ${selectedOrder === order.id ? 'rotated' : ''}`} 
                          />
                        </div>

                        {selectedOrder === order.id && (
                          <div className="user-panel-order-details">
                            {/* Itens do pedido */}
                            <div className="user-panel-order-items">
                              <h4>Itens do Pedido</h4>
                              {order.items?.map((item, index) => (
                                <div key={index} className="user-panel-order-item">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} />
                                  )}
                                  <div className="user-panel-order-item-info">
                                    <span className="name">{item.name}</span>
                                    <span className="qty">Qtd: {item.quantity}</span>
                                  </div>
                                  <span className="price">{formatCurrency(item.price * item.quantity)}</span>
                                </div>
                              ))}
                              
                              {order.discount > 0 && (
                                <div className="user-panel-order-discount">
                                  <span>Desconto aplicado:</span>
                                  <span>-{formatCurrency(order.discount)}</span>
                                </div>
                              )}
                            </div>

                            {/* Rastreamento */}
                            {order.trackingCode && (
                              <div className="user-panel-order-tracking">
                                <h4>
                                  <Truck size={18} />
                                  Rastreamento
                                </h4>
                                <div className="user-panel-tracking-code">
                                  <span className="code">{order.trackingCode}</span>
                                  <button 
                                    onClick={() => copyTrackingCode(order.trackingCode)}
                                    className="copy-btn"
                                    title="Copiar código"
                                  >
                                    {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                                  </button>
                                  {order.trackingUrl && (
                                    <a 
                                      href={order.trackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="track-btn"
                                    >
                                      <ExternalLink size={16} />
                                      Rastrear
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {!order.trackingCode && order.paymentStatus === 'paid' && (
                              <div className="user-panel-order-tracking-pending">
                                <Clock size={18} />
                                <span>Código de rastreio será informado em breve</span>
                              </div>
                            )}

                            {/* Endereço de entrega */}
                            {order.shippingAddress && (
                              <div className="user-panel-order-address">
                                <h4>
                                  <MapPin size={18} />
                                  Endereço de Entrega
                                </h4>
                                <p>
                                  {order.shippingAddress.street}, {order.shippingAddress.streetNumber}
                                  {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
                                  <br />
                                  {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state}
                                  <br />
                                  CEP: {order.shippingAddress.zipCode}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="user-panel-section">
              <div className="user-panel-header">
                <h2>
                  <User size={24} />
                  Meus Dados
                </h2>
                {!editingProfile ? (
                  <button 
                    className="user-panel-edit-btn"
                    onClick={() => setEditingProfile(true)}
                  >
                    <Edit2 size={18} />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="user-panel-edit-actions">
                    <button 
                      className="user-panel-cancel-btn"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X size={18} />
                      <span>Cancelar</span>
                    </button>
                    <button 
                      className="user-panel-save-btn"
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 size={18} className="spinning" />
                      ) : (
                        <Save size={18} />
                      )}
                      <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                  </div>
                )}
              </div>

              {message.text && (
                <div className={`user-panel-message ${message.type}`}>
                  {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="user-panel-profile">
                <div className="user-panel-profile-section">
                  <h3>Informações Pessoais</h3>
                  
                  <div className="user-panel-field">
                    <label>
                      <User size={16} />
                      Nome Completo
                    </label>
                    {editingProfile ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        disabled={saving}
                      />
                    ) : (
                      <p>{profileData.name || '-'}</p>
                    )}
                  </div>

                  <div className="user-panel-field">
                    <label>
                      <Mail size={16} />
                      E-mail
                    </label>
                    <p className="readonly">{profileData.email}</p>
                    <span className="user-panel-field-hint">O e-mail não pode ser alterado</span>
                  </div>

                  <div className="user-panel-row">
                    <div className="user-panel-field">
                      <label>
                        <Phone size={16} />
                        Telefone
                      </label>
                      {editingProfile ? (
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          placeholder="(00) 00000-0000"
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.phone || '-'}</p>
                      )}
                    </div>

                    <div className="user-panel-field">
                      <label>
                        <FileText size={16} />
                        {user?.documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                      </label>
                      <p className="readonly">{profileData.document || '-'}</p>
                      <span className="user-panel-field-hint">O documento não pode ser alterado</span>
                    </div>
                  </div>
                </div>

                <div className="user-panel-profile-section">
                  <h3>Endereço de Entrega</h3>
                  
                  <div className="user-panel-field">
                    <label>
                      <MapPin size={16} />
                      CEP
                    </label>
                    {editingProfile ? (
                      <div className="user-panel-input-wrapper">
                        <input
                          type="text"
                          name="zipCode"
                          value={profileData.zipCode}
                          onChange={handleProfileChange}
                          onBlur={handleCEPBlur}
                          placeholder="00000-000"
                          maxLength={9}
                          disabled={saving}
                        />
                        {loadingCEP && <Loader2 size={16} className="spinning" />}
                      </div>
                    ) : (
                      <p>{profileData.zipCode || '-'}</p>
                    )}
                  </div>

                  <div className="user-panel-row">
                    <div className="user-panel-field user-panel-field--large">
                      <label>Endereço</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="street"
                          value={profileData.street}
                          onChange={handleProfileChange}
                          placeholder="Rua, Avenida..."
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.street || '-'}</p>
                      )}
                    </div>

                    <div className="user-panel-field user-panel-field--small">
                      <label>Número</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="streetNumber"
                          value={profileData.streetNumber}
                          onChange={handleProfileChange}
                          placeholder="Nº"
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.streetNumber || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="user-panel-row">
                    <div className="user-panel-field">
                      <label>Complemento</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="complement"
                          value={profileData.complement}
                          onChange={handleProfileChange}
                          placeholder="Apto, Bloco..."
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.complement || '-'}</p>
                      )}
                    </div>

                    <div className="user-panel-field">
                      <label>Bairro</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="neighborhood"
                          value={profileData.neighborhood}
                          onChange={handleProfileChange}
                          placeholder="Seu bairro"
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.neighborhood || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="user-panel-row">
                    <div className="user-panel-field user-panel-field--large">
                      <label>Cidade</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          placeholder="Sua cidade"
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.city || '-'}</p>
                      )}
                    </div>

                    <div className="user-panel-field user-panel-field--small">
                      <label>Estado</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          placeholder="UF"
                          maxLength={2}
                          disabled={saving}
                        />
                      ) : (
                        <p>{profileData.state || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default UserPanel
