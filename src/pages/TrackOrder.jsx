import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Package, Truck, CheckCircle, Clock, AlertCircle, 
  MapPin, Copy, ExternalLink, Loader2, ArrowRight, Box,
  ShoppingBag, Home, Phone, Mail, RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './TrackOrder.css'

// Status de rastreamento disponíveis
const TRACKING_STATUSES = {
  posted: { label: 'Objeto Postado', icon: '📦', color: 'default', step: 1 },
  in_transit: { label: 'Em Trânsito', icon: '🚚', color: 'transit', step: 2 },
  hub: { label: 'Centro de Distribuição', icon: '🏢', color: 'transit', step: 2 },
  out_for_delivery: { label: 'Saiu para Entrega', icon: '📍', color: 'out', step: 3 },
  delivery_attempt: { label: 'Tentativa de Entrega', icon: '🔔', color: 'warning', step: 3 },
  awaiting_pickup: { label: 'Aguardando Retirada', icon: '⏳', color: 'warning', step: 3 },
  delivered: { label: 'Entregue', icon: '✅', color: 'success', step: 4 },
  returned: { label: 'Devolvido', icon: '↩️', color: 'error', step: 0 }
}

// Formatar data
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const TrackOrder = () => {
  const { isAuthenticated } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [tracking, setTracking] = useState(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Buscar rastreamento na API
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchTerm.trim()) {
      setError('Digite o número do pedido ou código de rastreio')
      return
    }
    
    setLoading(true)
    setError('')
    setTracking(null)
    
    try {
      const res = await fetch(`/api/tracking?code=${encodeURIComponent(searchTerm.trim())}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Rastreio não encontrado')
      }
      
      setTracking(data.tracking)
      setSearched(true)
    } catch (err) {
      setError(err.message || 'Pedido não encontrado. Verifique o número e tente novamente.')
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  // Copiar código de rastreio
  const copyTrackingCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  // Atualizar rastreamento
  const refreshTracking = () => {
    if (tracking?.tracking_code) {
      setSearchTerm(tracking.tracking_code)
      handleSearch({ preventDefault: () => {} })
    }
  }

  // Obter informações do status
  const getStatusInfo = (status) => {
    return TRACKING_STATUSES[status] || TRACKING_STATUSES.posted
  }

  // Calcular progresso
  const getProgressStep = () => {
    if (!tracking) return 0
    const statusInfo = getStatusInfo(tracking.current_status)
    return statusInfo.step
  }

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
                placeholder="Ex: DC12345678 ou número do pedido"
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

      {/* Tracking Result */}
      {tracking && (
        <section className="track-result">
          <div className="track-result__container">
            {/* Header Card */}
            <div className="track-status-card">
              <div className="track-status-card__header">
                <div className="track-status-card__info">
                  <div className="track-status-card__code">
                    <span className="label">Código de Rastreio</span>
                    <div className="code-wrapper">
                      <span className="code">{tracking.tracking_code}</span>
                      <button 
                        onClick={() => copyTrackingCode(tracking.tracking_code)}
                        className={`copy-btn ${copiedCode ? 'copied' : ''}`}
                        title="Copiar código"
                      >
                        {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  {tracking.order_number && (
                    <div className="track-status-card__order">
                      <span className="label">Pedido</span>
                      <span className="value">#{tracking.order_number}</span>
                    </div>
                  )}
                </div>
                
                <div className="track-status-card__status">
                  <span className={`status-badge status-badge--${getStatusInfo(tracking.current_status).color}`}>
                    <span className="status-icon">{getStatusInfo(tracking.current_status).icon}</span>
                    {getStatusInfo(tracking.current_status).label}
                  </span>
                  <button onClick={refreshTracking} className="refresh-btn" title="Atualizar">
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>
              
              <div className="track-status-card__route">
                <div className="route-point">
                  <MapPin size={18} />
                  <div>
                    <span className="route-label">Origem</span>
                    <span className="route-value">Sapiranga - RS</span>
                  </div>
                </div>
                <div className="route-line">
                  <Truck size={20} />
                </div>
                <div className="route-point route-point--destination">
                  <MapPin size={18} />
                  <div>
                    <span className="route-label">Destino</span>
                    <span className="route-value">{tracking.destination_city} - {tracking.destination_state}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            {tracking.current_status !== 'returned' && (
              <div className="track-progress">
                <h2 className="track-section-title">
                  <Truck size={22} />
                  Progresso da Entrega
                </h2>
                
                <div className="progress-steps">
                  <div className={`progress-step ${getProgressStep() >= 1 ? 'active' : ''} ${getProgressStep() > 1 ? 'done' : ''}`}>
                    <div className="progress-step__icon">
                      <Box size={24} />
                    </div>
                    <div className="progress-step__line"></div>
                    <div className="progress-step__content">
                      <h4>Postado</h4>
                      <p>Objeto recebido</p>
                    </div>
                  </div>
                  
                  <div className={`progress-step ${getProgressStep() >= 2 ? 'active' : ''} ${getProgressStep() > 2 ? 'done' : ''}`}>
                    <div className="progress-step__icon">
                      <Truck size={24} />
                    </div>
                    <div className="progress-step__line"></div>
                    <div className="progress-step__content">
                      <h4>Em Trânsito</h4>
                      <p>A caminho do destino</p>
                    </div>
                  </div>
                  
                  <div className={`progress-step ${getProgressStep() >= 3 ? 'active' : ''} ${getProgressStep() > 3 ? 'done' : ''}`}>
                    <div className="progress-step__icon">
                      <MapPin size={24} />
                    </div>
                    <div className="progress-step__line"></div>
                    <div className="progress-step__content">
                      <h4>Saiu para Entrega</h4>
                      <p>Com o entregador</p>
                    </div>
                  </div>
                  
                  <div className={`progress-step ${getProgressStep() >= 4 ? 'active' : ''}`}>
                    <div className="progress-step__icon">
                      <Home size={24} />
                    </div>
                    <div className="progress-step__content">
                      <h4>Entregue</h4>
                      <p>Pedido finalizado</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking History */}
            <div className="track-history">
              <h2 className="track-section-title">
                <Clock size={22} />
                Histórico de Movimentações
              </h2>
              
              <div className="history-timeline">
                {(tracking.history || []).slice().reverse().map((entry, index) => (
                  <div key={entry.id} className={`history-item ${index === 0 ? 'history-item--current' : ''}`}>
                    <div className="history-marker">
                      <span className="history-icon">{getStatusInfo(entry.status).icon}</span>
                    </div>
                    <div className="history-content">
                      <div className="history-header">
                        <span className="history-status">{entry.description}</span>
                        <span className="history-date">{formatDateTime(entry.date)}</span>
                      </div>
                      <span className="history-location">
                        <MapPin size={14} />
                        {entry.location}
                      </span>
                      {entry.details && (
                        <span className="history-details">{entry.details}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipient Info */}
            {tracking.customer_name && (
              <div className="track-recipient">
                <h2 className="track-section-title">
                  <ShoppingBag size={22} />
                  Informações do Destinatário
                </h2>
                
                <div className="recipient-card">
                  <div className="recipient-info">
                    <div className="recipient-item">
                      <span className="recipient-label">Nome</span>
                      <span className="recipient-value">{tracking.customer_name}</span>
                    </div>
                    {tracking.destination_cep && (
                      <div className="recipient-item">
                        <span className="recipient-label">CEP</span>
                        <span className="recipient-value">{tracking.destination_cep}</span>
                      </div>
                    )}
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
      {searched && !tracking && !error && (
        <section className="track-not-found">
          <div className="track-not-found__container">
            <div className="track-not-found__icon">
              <Package size={64} strokeWidth={1} />
            </div>
            <h2>Pedido não encontrado</h2>
            <p>Não conseguimos localizar um pedido com esse código. Verifique se digitou corretamente.</p>
            <button onClick={() => { setSearched(false); setSearchTerm(''); }} className="track-not-found__btn">
              Tentar Novamente
            </button>
          </div>
        </section>
      )}

      {/* Initial State - Info Cards */}
      {!searched && !tracking && (
        <section className="track-info">
          <div className="track-info__container">
            <h2 className="track-info__title">Como rastrear seu pedido</h2>
            
            <div className="track-info__cards">
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <ShoppingBag size={28} />
                </div>
                <h3>1. Localize seu código</h3>
                <p>O código de rastreio foi enviado para seu e-mail após o envio. Também está disponível em "Minha Conta".</p>
              </div>
              
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <Search size={28} />
                </div>
                <h3>2. Digite no campo acima</h3>
                <p>Insira o código de rastreio (ex: DC12345678) ou o número do pedido.</p>
              </div>
              
              <div className="track-info__card">
                <div className="track-info__card-icon">
                  <Truck size={28} />
                </div>
                <h3>3. Acompanhe em tempo real</h3>
                <p>Veja o status atualizado e o histórico completo de movimentações até a entrega.</p>
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

      {tracking && (
        <section className="track-footer">
          <button 
            onClick={() => { setTracking(null); setSearched(false); setSearchTerm(''); }}
            className="track-footer__link"
          >
            <Search size={18} />
            Rastrear outro pedido
          </button>
        </section>
      )}
    </div>
  )
}

export default TrackOrder
