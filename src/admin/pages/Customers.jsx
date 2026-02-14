import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Customers.css'

const Customers = () => {
  const { getCustomers, getOrders } = useAdmin()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])

  useEffect(() => {
    loadCustomers()
  }, [searchTerm])

  const loadCustomers = () => {
    setLoading(true)
    const data = getCustomers({ search: searchTerm })
    setCustomers(data)
    setLoading(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    // Carregar pedidos do cliente
    const allOrders = getOrders()
    const orders = allOrders.filter(o => 
      o.customer?.email?.toLowerCase() === customer.email?.toLowerCase()
    )
    setCustomerOrders(orders)
  }

  const getCustomerStats = (customer) => {
    const allOrders = getOrders()
    const orders = allOrders.filter(o => 
      o.customer?.email?.toLowerCase() === customer.email?.toLowerCase()
    )
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    return {
      totalOrders: orders.length,
      totalSpent
    }
  }

  const formatPhone = (phone) => {
    if (!phone) return 'N/A'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  const formatDocument = (doc, type) => {
    if (!doc) return 'N/A'
    const cleaned = doc.replace(/\D/g, '')
    if (type === 'cpf' && cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`
    }
    if (type === 'cnpj' && cleaned.length === 14) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`
    }
    return doc
  }

  return (
    <div className="customers-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>Clientes</h1>
          <p>Gerencie os clientes cadastrados na sua loja</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{customers.length}</span>
            <span className="stat-text">Total de clientes</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="customers-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Carregando clientes...</span>
          </div>
        ) : customers.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contato</th>
                <th>Documento</th>
                <th>Pedidos</th>
                <th>Total Gasto</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => {
                const stats = getCustomerStats(customer)
                return (
                  <tr key={customer.id}>
                    <td className="customer-cell">
                      <div className="customer-avatar">
                        {customer.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="customer-info">
                        <span className="customer-name">{customer.name || 'N/A'}</span>
                        <span className="customer-email">{customer.email}</span>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <span className="phone">{formatPhone(customer.phone)}</span>
                    </td>
                    <td className="document-cell">
                      <span className="document">
                        {formatDocument(customer.document, customer.documentType)}
                      </span>
                      {customer.documentType && (
                        <span className="document-type">{customer.documentType.toUpperCase()}</span>
                      )}
                    </td>
                    <td className="orders-cell">
                      <span className={`orders-badge ${stats.totalOrders > 0 ? 'has-orders' : ''}`}>
                        {stats.totalOrders}
                      </span>
                    </td>
                    <td className="spent-cell">
                      <span className="total-spent">{formatCurrency(stats.totalSpent)}</span>
                    </td>
                    <td className="date-cell">
                      <span>{formatDate(customer.createdAt)}</span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-view"
                        onClick={() => handleViewCustomer(customer)}
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <h3>Nenhum cliente encontrado</h3>
            <p>
              {searchTerm
                ? 'Tente buscar com outros termos'
                : 'Os clientes cadastrados aparecerão aqui'}
            </p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-content customer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="customer-header-info">
                <div className="large-avatar">
                  {selectedCustomer.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2>{selectedCustomer.name}</h2>
                  <span className="customer-since">
                    Cliente desde {formatDate(selectedCustomer.createdAt)}
                  </span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Stats */}
              <div className="customer-stats-grid">
                <div className="stat-box">
                  <span className="stat-value">{customerOrders.length}</span>
                  <span className="stat-label">Pedidos</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {formatCurrency(customerOrders.reduce((sum, o) => sum + (o.total || 0), 0))}
                  </span>
                  <span className="stat-label">Total Gasto</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {customerOrders.length > 0 
                      ? formatCurrency(customerOrders.reduce((sum, o) => sum + (o.total || 0), 0) / customerOrders.length)
                      : 'R$ 0,00'
                    }
                  </span>
                  <span className="stat-label">Ticket Médio</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="detail-section">
                <h3>Informações de Contato</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <div>
                      <label>E-mail</label>
                      <span>{selectedCustomer.email}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <div>
                      <label>Telefone</label>
                      <span>{formatPhone(selectedCustomer.phone)}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div>
                      <label>Documento ({selectedCustomer.documentType?.toUpperCase() || 'CPF'})</label>
                      <span>{formatDocument(selectedCustomer.document, selectedCustomer.documentType)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedCustomer.address && (
                <div className="detail-section">
                  <h3>Endereço</h3>
                  <div className="address-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <p>
                        {selectedCustomer.address.street}, {selectedCustomer.address.number}
                        {selectedCustomer.address.complement && ` - ${selectedCustomer.address.complement}`}
                      </p>
                      <p>{selectedCustomer.address.neighborhood}</p>
                      <p>
                        {selectedCustomer.address.city} - {selectedCustomer.address.state}, 
                        CEP: {selectedCustomer.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders History */}
              <div className="detail-section">
                <h3>Histórico de Pedidos</h3>
                {customerOrders.length > 0 ? (
                  <div className="orders-list">
                    {customerOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="order-item">
                        <div className="order-info">
                          <span className="order-id">#{order.id?.slice(-6).toUpperCase()}</span>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-details">
                          <span className="items-count">
                            {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'item' : 'itens'}
                          </span>
                          <span className="order-total">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    ))}
                    {customerOrders.length > 5 && (
                      <p className="more-orders">
                        + {customerOrders.length - 5} pedidos anteriores
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="no-orders">Nenhum pedido realizado ainda</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
