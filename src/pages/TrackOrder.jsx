import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MapPin, Copy, ExternalLink, Loader2, ArrowRight
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './TrackOrder.css'

// Status do pedido
const ORDER_STATUS = {
  processing: { label: 'Em Processamento', color: 'warning', icon: Clock, step: 1 },
  shipped: { label: 'Enviado', color: 'info', icon: Truck, step: 2 },
  delivered: { label: 'Entregue', color: 'success', icon: CheckCircle, step: 3 },
  cancelled: { label: 'Cancelado', color: 'error', icon: AlertCircle, step: 0 }
}

// Status do pagamento
const PAYMENT_STATUS = {
  pending: { label: 'Aguardando Pagamento', color: 'warning' },
  paid: { label: 'Pago', color: 'success' },
  approved: { label: 'Aprovado', color: 'success' },
  failed: { label: 'Falhou', color: 'error' },
  refunded: { label: 'Reembolsado', color: 'info' }
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

const TrackOrder = () => {
  const { findOrder, isAuthenticated } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      setError('Digite o número do pedido ou código de rastreio')
      return
    }
    
    setLoading(true)
    setError('')
    setOrder(null)
    
    // Simular delay de busca
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const foundOrder = findOrder(searchTerm.trim())
    
    setLoading(false)
    setSearched(true)
    
    if (foundOrder) {
      setOrder(foundOrder)
    } else {
      setError('Pedido não encontrado. Verifique o número e tente novamente.')
    }
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

  const status = order ? ORDER_STATUS[order.status] || ORDER_STATUS.processing : null
  const paymentStatus = order ? PAYMENT_STATUS[order.paymentStatus] || PAYMENT_STATUS.pending : null

  return (
    <div className="track-order-page">
      <div className="track-order-container">
        {/* Header */}
        <div className="track-order-header">
          <div className="track-order-icon">
            <Package size={40} />
          </div>
          <h1>Rastrear Pedido</h1>
          <p>Digite o número do pedido ou código de rastreio para acompanhar sua entrega</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="track-order-form">
          <div className="track-order-input-wrapper">
            <Search size={20} className="track-order-input-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="Ex: DC12345678 ou código de rastreio"
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading} className="track-order-submit">
            {loading ? (
              <Loader2 size={20} className="spinning" />
            ) : (
              <>
                <span>Buscar</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="track-order-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="track-order-result">
            {/* Order Header */}
            <div className="track-order-result-header">
              <div className="track-order-result-info">
                <h2>Pedido #{order.orderNumber}</h2>
                <span className="track-order-date">
                  <Clock size={14} />
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className="track-order-badges">
                <span className={`track-order-payment-badge ${paymentStatus.color}`}>
                  {paymentStatus.label}
                </span>
                <span className={`track-order-status-badge ${status.color}`}>
                  <status.icon size={14} />
                  {status.label}
                </span>
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.status !== 'cancelled' && (
              <div className="track-order-timeline">
                <div className={`track-order-timeline-step ${status.step >= 1 ? 'active' : ''} ${status.step > 1 ? 'completed' : ''}`}>
                  <div className="track-order-timeline-icon">
                    <Package size={20} />
                  </div>
                  <div className="track-order-timeline-content">
                    <h4>Pedido Confirmado</h4>
                    <p>Seu pedido foi recebido e está sendo processado</p>
                  </div>
                </div>
                
                <div className="track-order-timeline-line"></div>
                
                <div className={`track-order-timeline-step ${status.step >= 2 ? 'active' : ''} ${status.step > 2 ? 'completed' : ''}`}>
                  <div className="track-order-timeline-icon">
                    <Truck size={20} />
                  </div>
                  <div className="track-order-timeline-content">
                    <h4>Enviado</h4>
                    <p>Produto enviado para transportadora</p>
                  </div>
                </div>
                
                <div className="track-order-timeline-line"></div>
                
                <div className={`track-order-timeline-step ${status.step >= 3 ? 'active' : ''}`}>
                  <div className="track-order-timeline-icon">
                    <CheckCircle size={20} />
                  </div>
                  <div className="track-order-timeline-content">
                    <h4>Entregue</h4>
                    <p>Pedido entregue com sucesso</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Code */}
            {order.trackingCode && (
              <div className="track-order-tracking">
                <h3>
                  <Truck size={18} />
                  Código de Rastreio
                </h3>
                <div className="track-order-tracking-code">
                  <span className="code">{order.trackingCode}</span>
                  <button 
                    onClick={() => copyTrackingCode(order.trackingCode)}
                    className="copy-btn"
                    title="Copiar código"
                  >
                    {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copiedCode ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <a 
                  href={`https://www.linkcorreios.com.br/?id=${order.trackingCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="track-order-correios-link"
                >
                  <img 
                    src="/images/logo/logoCorreios.png" 
                    alt="Correios" 
                    className="track-order-correios-logo"
                  />
                  <span>Rastrear nos Correios</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            )}

            {!order.trackingCode && order.paymentStatus === 'paid' && order.status === 'processing' && (
              <div className="track-order-tracking-pending">
                <Clock size={20} />
                <div>
                  <h4>Aguardando Envio</h4>
                  <p>O código de rastreio será informado assim que o pedido for despachado.</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="track-order-items">
              <h3>
                <Package size={18} />
                Itens do Pedido
              </h3>
              <div className="track-order-items-list">
                {order.items?.map((item, index) => (
                  <div key={index} className="track-order-item">
                    {item.image && (
                      <img src={item.image} alt={item.name} />
                    )}
                    <div className="track-order-item-info">
                      <span className="name">{item.name}</span>
                      <span className="qty">Quantidade: {item.quantity}</span>
                    </div>
                    <span className="price">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              {order.discount > 0 && (
                <div className="track-order-summary-row discount">
                  <span>Desconto</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}
              
              <div className="track-order-summary-row total">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="track-order-address">
                <h3>
                  <MapPin size={18} />
                  Endereço de Entrega
                </h3>
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

        {/* Not Found State */}
        {searched && !order && !error && (
          <div className="track-order-not-found">
            <Package size={48} />
            <h3>Pedido não encontrado</h3>
            <p>Verifique o número do pedido ou código de rastreio e tente novamente.</p>
          </div>
        )}

        {/* Footer Links */}
        <div className="track-order-footer">
          {isAuthenticated ? (
            <Link to="/minha-conta" className="track-order-link">
              Ver todos os meus pedidos
            </Link>
          ) : (
            <div className="track-order-footer-links">
              <Link to="/login" className="track-order-link">
                Fazer login para ver meus pedidos
              </Link>
              <span className="track-order-divider">ou</span>
              <Link to="/cadastro" className="track-order-link-secondary">
                Criar uma conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrackOrder
