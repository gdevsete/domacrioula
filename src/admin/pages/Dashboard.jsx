import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import './Dashboard.css'

const Dashboard = () => {
  const { getStats, getOrders } = useAdmin()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const statsData = getStats()
      const ordersData = getOrders().slice(0, 5)
      setStats(statsData)
      setRecentOrders(ordersData)
      setLoading(false)
    }

    loadData()
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [getStats, getOrders])

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
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Pendente', class: 'warning' },
      waiting_payment: { label: 'Aguardando', class: 'warning' },
      paid: { label: 'Pago', class: 'success' },
      processing: { label: 'Processando', class: 'info' },
      shipped: { label: 'Enviado', class: 'info' },
      delivered: { label: 'Entregue', class: 'success' },
      completed: { label: 'Concluído', class: 'success' },
      cancelled: { label: 'Cancelado', class: 'danger' },
      refunded: { label: 'Reembolsado', class: 'danger' }
    }
    return statusMap[status] || { label: status, class: 'default' }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <span>Carregando dados...</span>
      </div>
    )
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </h1>
          <p>Visão geral do seu negócio</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={() => window.location.reload()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Faturamento Total</span>
            <span className="stat-value">{formatCurrency(stats?.totalRevenue || 0)}</span>
            <span className="stat-change positive">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
              </svg>
              Ticket médio: {formatCurrency(stats?.averageTicket || 0)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Total de Pedidos</span>
            <span className="stat-value">{stats?.totalOrders || 0}</span>
            <span className="stat-change info">
              Hoje: {stats?.ordersToday || 0} pedidos
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Clientes</span>
            <span className="stat-value">{stats?.totalUsers || 0}</span>
            <span className="stat-change">
              Taxa de conversão: {stats?.conversionRate || 0}%
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon today">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Faturamento Hoje</span>
            <span className="stat-value">{formatCurrency(stats?.revenueToday || 0)}</span>
            <span className="stat-change positive">
              {stats?.ordersToday || 0} pedidos realizados
            </span>
          </div>
        </div>
      </div>

      {/* Order Status Summary */}
      <div className="status-summary">
        <div className="status-item pending">
          <div className="status-count">{stats?.pendingOrders || 0}</div>
          <div className="status-label">Aguardando</div>
        </div>
        <div className="status-item processing">
          <div className="status-count">{stats?.processingOrders || 0}</div>
          <div className="status-label">Processando</div>
        </div>
        <div className="status-item completed">
          <div className="status-count">{stats?.completedOrders || 0}</div>
          <div className="status-label">Concluídos</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-card orders-card">
          <div className="card-header">
            <h3>Pedidos Recentes</h3>
            <Link to="/admin/pedidos" className="view-all">
              Ver todos
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </Link>
          </div>
          <div className="card-content">
            {recentOrders.length > 0 ? (
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const status = getStatusBadge(order.status)
                    return (
                      <tr key={order.id}>
                        <td className="order-id">#{order.id?.slice(-6).toUpperCase()}</td>
                        <td className="customer-name">{order.customer?.name || 'N/A'}</td>
                        <td className="order-total">{formatCurrency(order.total)}</td>
                        <td>
                          <span className={`status-badge ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="order-date">{formatDate(order.createdAt)}</td>
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
                <p>Nenhum pedido ainda</p>
                <span>Os pedidos aparecerão aqui assim que forem realizados</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card">
          <div className="card-header">
            <h3>Ações Rápidas</h3>
          </div>
          <div className="card-content">
            <div className="quick-actions">
              <Link to="/admin/produtos" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <span>Novo Produto</span>
              </Link>
              <Link to="/admin/pedidos" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                  </svg>
                </div>
                <span>Ver Pedidos</span>
              </Link>
              <Link to="/admin/clientes" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                  </svg>
                </div>
                <span>Clientes</span>
              </Link>
              <Link to="/admin/configuracoes" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <span>Configurações</span>
              </Link>
              <Link to="/admin/relatorios" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10"/>
                    <line x1="12" y1="20" x2="12" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <span>Relatórios</span>
              </Link>
              <a href="/" target="_blank" rel="noopener noreferrer" className="quick-action">
                <div className="action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </div>
                <span>Ver Loja</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
