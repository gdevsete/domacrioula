import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MapPin, Copy, ExternalLink, Loader2, ArrowRight, Box,
  ShoppingBag, CreditCard, Home, Phone, Mail, Calendar
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
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('pt-BR', {
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
    <div className="track-page">
      {/* Hero Section */}
      <section className="track-hero">
        <div className="track-hero__bg">
          <div className="track-hero__shape track-hero__shape--1"></div>
          <div className="track-hero__shape track-hero__shape--2"></div>
          <div className="track-hero__shape track-hero__shape--3"></div>
        </div>
        
        <div className="track-hero__content">
          <div className="track-hero__icon">
            <Package size={36} strokeWidth={1.5} />
          </div>
          <h1 className="track-hero__title">Rastrear Pedido</h1>
          <p className="track-hero__subtitle">
            Acompanhe sua entrega em tempo real. Digite o número do pedido ou código de rastreio.
          </p>
          
          <form onSubmit={handleSearch} className="track-search">
            <div className="track-search__field">
              <Search size={22} className="track-search__icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="Ex: DC12345678 ou código dos Correios"
                disabled={loading}
                className="track-search__input"
              />
            </div>
            <button type="submit" disabled={loading} className="track-search__btn">
              {loading ? (
                <Loader2 size={22} className="spinning" />
              ) : (
                <>
                  <span>Rastrear</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="track-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </section>

      {/* Order Result */}
      {order && (
        <section className="track-result">
          <div className="track-result__container">
            {/* Status Card */}
            <div className="track-status-card">
              <div className="track-status-card__header">
                <div className="track-status-card__order">
                  <span className="track-status-card__label">Pedido</span>
                  <span className="track-status-card__number">#{order.orderNumber}</span>
                </div>
                <div className="track-status-card__badges">
                  <span className={`track-badge track-badge--${paymentStatus.color}`}>
                    <CreditCard size={14} />
                    {paymentStatus.label}
                  </span>
                  <span className={`track-badge track-badge--${status.color} track-badge--lg`}>
                    <status.icon size={16} />
                    {status.label}
                  </span>
                </div>
              </div>
              
              <div className="track-status-card__date">
                <Calendar size={16} />
                <span>Pedido realizado em {formatDate(order.createdAt)} às {formatTime(order.createdAt)}</span>
              </div>
            </div>

            {/* Timeline */}
            {order.status !== 'cancelled' && (
              <div className="track-timeline">
                <h2 className="track-section-title">
                  <Truck size={22} />
                  Status da Entrega
                </h2>
                
                <div className="track-timeline__steps">
                  <div className={`track-timeline__step ${status.step >= 1 ? 'track-timeline__step--active' : ''} ${status.step > 1 ? 'track-timeline__step--done' : ''}`}>
                    <div className="track-timeline__step-icon">
                      <Box size={24} />
                    </div>
                    <div className="track-timeline__step-line"></div>
                    <div className="track-timeline__step-content">
                      <h4>Pedido Confirmado</h4>
                      <p>Recebemos seu pedido e estamos preparando</p>
                    </div>
                  </div>
                  
                  <div className={`track-timeline__step ${status.step >= 2 ? 'track-timeline__step--active' : ''} ${status.step > 2 ? 'track-timeline__step--done' : ''}`}>
                    <div className="track-timeline__step-icon">
                      <Truck size={24} />
                    </div>
                    <div className="track-timeline__step-line"></div>
                    <div className="track-timeline__step-content">
                      <h4>Em Trânsito</h4>
                      <p>Seu pedido está a caminho</p>
                    </div>
                  </div>
                  
                  <div className={`track-timeline__step ${status.step >= 3 ? 'track-timeline__step--active' : ''}`}>
                    <div className="track-timeline__step-icon">
                      <Home size={24} />
                    </div>
                    <div className="track-timeline__step-content">
                      <h4>Entregue</h4>
                      <p>Pedido entregue com sucesso</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="track-cancelled">
                <AlertCircle size={48} />
                <h3>Pedido Cancelado</h3>
                <p>Este pedido foi cancelado. Entre em contato conosco se precisar de ajuda.</p>
              </div>
            )}

            {/* Tracking Code */}
            {order.trackingCode && (
              <div className="track-tracking">
                <h2 className="track-section-title">
                  <Package size={22} />
                  Código de Rastreio
                </h2>
                
                <div className="track-tracking__box">
                  <div className="track-tracking__code-wrapper">
                    <span className="track-tracking__label">Código:</span>
                    <span className="track-tracking__code">{order.trackingCode}</span>
                    <button 
                      onClick={() => copyTrackingCode(order.trackingCode)}
                      className={`track-tracking__copy ${copiedCode ? 'track-tracking__copy--success' : ''}`}
                    >
                      {copiedCode ? <CheckCircle size={18} /> : <Copy size={18} />}
                      {copiedCode ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                  
                  <a 
                    href={`https://www.linkcorreios.com.br/?id=${order.trackingCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="track-tracking__correios"
                  >
                    <img 
                      src="/images/logo/logoCorreios.png" 
                      alt="Correios" 
                      className="track-tracking__correios-logo"
                    />
                    <span>Rastrear nos Correios</span>
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            )}

            {!order.trackingCode && order.paymentStatus === 'paid' && order.status === 'processing' && (
              <div className="track-pending">
                <div className="track-pending__icon">
                  <Clock size={28} />
                </div>
                <div className="track-pending__content">
                  <h4>Aguardando Envio</h4>
                  <p>O código de rastreio será informado assim que o pedido for despachado para a transportadora.</p>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="track-items">
              <h2 className="track-section-title">
                <ShoppingBag size={22} />
                Itens do Pedido
              </h2>
              
              <div className="track-items__list">
                {order.items?.map((item, index) => (
                  <div key={index} className="track-item">
                    <div className="track-item__image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <Package size={28} />
                      )}
                    </div>
                    <div className="track-item__details">
                      <h4 className="track-item__name">{item.name}</h4>
                      <span className="track-item__qty">Quantidade: {item.quantity}</span>
                    </div>
                    <span className="track-item__price">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="track-items__summary">
                {order.discount > 0 && (
                  <div className="track-items__row track-items__row--discount">
                    <span>Desconto aplicado</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="track-items__row track-items__row--total">
                  <span>Total do Pedido</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="track-address">
                <h2 className="track-section-title">
                  <MapPin size={22} />
                  Endereço de Entrega
                </h2>
                
                <div className="track-address__card">
                  <div className="track-address__icon">
                    <Home size={24} />
                  </div>
                  <div className="track-address__info">
                    <p className="track-address__line">
                      {order.shippingAddress.street}, {order.shippingAddress.streetNumber}
                      {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`}
                    </p>
                    <p className="track-address__line">{order.shippingAddress.neighborhood}</p>
                    <p className="track-address__line">{order.shippingAddress.city} - {order.shippingAddress.state}</p>
                    <p className="track-address__cep">CEP: {order.shippingAddress.zipCode}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="track-help">
              <h3>Precisa de ajuda?</h3>
              <p>Nossa equipe está pronta para ajudar você com qualquer dúvida sobre seu pedido.</p>
              <div className="track-help__buttons">
                <a href="https://wa.me/5551998137009" target="_blank" rel="noopener noreferrer" className="track-help__btn track-help__btn--whatsapp">
                  <Phone size={18} />
                  WhatsApp
                </a>
                <a href="mailto:contato@domacrioula.com.br" className="track-help__btn track-help__btn--email">
                  <Mail size={18} />
                  E-mail
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Not Found State */}
      {searched && !order && !error && (
        <section className="track-not-found">
          <div className="track-not-found__container">
            <div className="track-not-found__icon">
              <Package size={64} strokeWidth={1} />
            </div>
            <h2>Pedido não encontrado</h2>
            <p>Não conseguimos localizar um pedido com esse número. Verifique se digitou corretamente.</p>
            <button onClick={() => { setSearched(false); setSearchTerm(''); }} className="track-not-found__btn">
              Tentar Novamente
            </button>
          </div>
        </section>
      )}

      {/* Initial State - Info Cards */}
      {!searched && !order && (
        <section className="track-info">
          <div className="track-info__container">
            <h2 className="track-info__title">Como rastrear seu pedido</h2>
            
            <div className="track-info__cards">
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <ShoppingBag size={28} />
                </div>
                <h3>1. Localize seu código</h3>
                <p>O número do pedido foi enviado para seu e-mail após a compra. Também está disponível em "Minha Conta".</p>
              </div>
              
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <Search size={28} />
                </div>
                <h3>2. Digite no campo acima</h3>
                <p>Insira o número do pedido (ex: DC12345678) ou o código de rastreio dos Correios.</p>
              </div>
              
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <Truck size={28} />
                </div>
                <h3>3. Acompanhe a entrega</h3>
                <p>Veja o status atualizado do seu pedido e acompanhe cada etapa até a entrega.</p>
              </div>
            </div>

            <div className="track-info__cta">
              {isAuthenticated ? (
                <Link to="/minha-conta" className="track-info__cta-btn">
                  <Package size={20} />
                  Ver meus pedidos
                </Link>
              ) : (
                <>
                  <p>Tem uma conta? Acesse para ver todos os seus pedidos automaticamente.</p>
                  <div className="track-info__cta-buttons">
                    <Link to="/login" className="track-info__cta-btn track-info__cta-btn--primary">
                      Fazer Login
                    </Link>
                    <Link to="/cadastro" className="track-info__cta-btn track-info__cta-btn--secondary">
                      Criar Conta
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {order && (
        <section className="track-footer">
          {isAuthenticated ? (
            <Link to="/minha-conta" className="track-footer__link">
              <ArrowRight size={18} />
              Ver todos os meus pedidos
            </Link>
          ) : (
            <Link to="/login" className="track-footer__link">
              Fazer login para ver todos os pedidos
            </Link>
          )}
        </section>
      )}
    </div>
  )
}

export default TrackOrder
