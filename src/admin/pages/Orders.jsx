import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Orders.css'

const Orders = () => {
  const { getOrders, updateOrderStatus } = useAdmin()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    loadOrders()
  }, [filters])

  const loadOrders = () => {
    setLoading(true)
    const data = getOrders(filters)
    setOrders(data)
    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const statusOptions = [
    { value: 'pending', label: 'Pendente', color: 'warning' },
    { value: 'waiting_payment', label: 'Aguardando Pagamento', color: 'warning' },
    { value: 'paid', label: 'Pago', color: 'success' },
    { value: 'processing', label: 'Processando', color: 'info' },
    { value: 'shipped', label: 'Enviado', color: 'info' },
    { value: 'delivered', label: 'Entregue', color: 'success' },
    { value: 'completed', label: 'Concluído', color: 'success' },
    { value: 'cancelled', label: 'Cancelado', color: 'danger' },
    { value: 'refunded', label: 'Reembolsado', color: 'danger' }
  ]

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || { label: status, color: 'default' }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    const success = updateOrderStatus(orderId, newStatus)
    if (success) {
      loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }))
      }
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      dateFrom: '',
      dateTo: ''
    })
  }

  return (
    <div className="orders-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>Pedidos</h1>
          <p>Gerencie todos os pedidos da sua loja</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-text">Total</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por ID, cliente ou e-mail..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        <div className="filters-group">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos os status</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="filter-date"
            placeholder="Data inicial"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="filter-date"
            placeholder="Data final"
          />

          {(filters.status !== 'all' || filters.search || filters.dateFrom || filters.dateTo) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Carregando pedidos...</span>
          </div>
        ) : orders.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Produtos</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                return (
                  <tr key={order.id}>
                    <td className="order-id-cell">
                      <span className="order-id">#{order.id?.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="customer-cell">
                      <div className="customer-info">
                        <span className="customer-name">{order.customer?.name || 'N/A'}</span>
                        <span className="customer-email">{order.customer?.email || ''}</span>
                      </div>
                    </td>
                    <td className="products-cell">
                      <span className="products-count">
                        {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'itens'}
                      </span>
                    </td>
                    <td className="total-cell">
                      <span className="order-total">{formatCurrency(order.total)}</span>
                    </td>
                    <td className="payment-cell">
                      <span className="payment-method">
                        {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod || 'N/A'}
                      </span>
                    </td>
                    <td className="status-cell">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`status-select ${statusInfo.color}`}
                      >
                        {statusOptions.map(status => (
                          <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="date-cell">
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-view"
                        onClick={() => setSelectedOrder(order)}
                        title="Ver detalhes"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
            <h3>Nenhum pedido encontrado</h3>
            <p>
              {filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo
                ? 'Tente ajustar os filtros para encontrar pedidos'
                : 'Os pedidos da sua loja aparecerão aqui'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pedido #{selectedOrder.id?.slice(-6).toUpperCase()}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Status Section */}
              <div className="detail-section">
                <h3>Status do Pedido</h3>
                <div className="status-row">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className={`status-select large ${getStatusInfo(selectedOrder.status).color}`}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <span className="order-datetime">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {/* Customer Section */}
              <div className="detail-section">
                <h3>Cliente</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nome</label>
                    <span>{selectedOrder.customer?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>E-mail</label>
                    <span>{selectedOrder.customer?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Telefone</label>
                    <span>{selectedOrder.customer?.phone || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Documento</label>
                    <span>{selectedOrder.customer?.document || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Section */}
              {selectedOrder.shipping && (
                <div className="detail-section">
                  <h3>Endereço de Entrega</h3>
                  <div className="address-info">
                    <p>
                      {selectedOrder.shipping.street}, {selectedOrder.shipping.number}
                      {selectedOrder.shipping.complement && ` - ${selectedOrder.shipping.complement}`}
                    </p>
                    <p>{selectedOrder.shipping.neighborhood}</p>
                    <p>
                      {selectedOrder.shipping.city} - {selectedOrder.shipping.state}, CEP: {selectedOrder.shipping.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div className="detail-section">
                <h3>Itens do Pedido</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="item-row">
                      <div className="item-info">
                        <span className="item-name">{item.name || item.title}</span>
                        <span className="item-qty">Qtd: {item.quantity}</span>
                      </div>
                      <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Section */}
              <div className="detail-section">
                <h3>Pagamento</h3>
                <div className="payment-summary">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedOrder.subtotal || selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.shipping?.cost > 0 && (
                    <div className="summary-row">
                      <span>Frete</span>
                      <span>{formatCurrency(selectedOrder.shipping.cost)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="summary-row discount">
                      <span>Desconto</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  <div className="payment-method-info">
                    <span className="method-label">Método:</span>
                    <span className="method-value">
                      {selectedOrder.paymentMethod === 'pix' ? 'PIX' : selectedOrder.paymentMethod || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory?.length > 0 && (
                <div className="detail-section">
                  <h3>Histórico</h3>
                  <div className="history-list">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="history-item">
                        <span className={`status-dot ${getStatusInfo(history.status).color}`}></span>
                        <div className="history-info">
                          <span className="history-status">{getStatusInfo(history.status).label}</span>
                          <span className="history-date">{formatDate(history.timestamp)}</span>
                          {history.updatedBy && (
                            <span className="history-by">por {history.updatedBy}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
