import { useState, useEffect, useMemo } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Reports.css'

const Reports = () => {
  const { getOrders, getCustomers, getStats } = useAdmin()
  const [period, setPeriod] = useState('30days')
  const [reportData, setReportData] = useState(null)

  useEffect(() => {
    generateReport()
  }, [period])

  const generateReport = () => {
    const orders = getOrders()
    const customers = getCustomers()
    const stats = getStats()

    // Determinar período
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Filtrar pedidos no período
    const periodOrders = orders.filter(o => new Date(o.createdAt) >= startDate)
    const periodCustomers = customers.filter(c => new Date(c.createdAt) >= startDate)

    // Calcular métricas
    const totalRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const averageTicket = periodOrders.length > 0 ? totalRevenue / periodOrders.length : 0

    // Pedidos por status
    const ordersByStatus = periodOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})

    // Receita por dia (últimos 7 dias)
    const revenueByDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayOrders = periodOrders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= date && orderDate < nextDate
      })
      
      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      
      revenueByDay.push({
        date: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }

    // Top produtos (simulado baseado em itens dos pedidos)
    const productSales = {}
    periodOrders.forEach(order => {
      order.items?.forEach(item => {
        const key = item.name || item.title || 'Produto'
        if (!productSales[key]) {
          productSales[key] = { name: key, quantity: 0, revenue: 0 }
        }
        productSales[key].quantity += item.quantity || 1
        productSales[key].revenue += (item.price || 0) * (item.quantity || 1)
      })
    })
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Métodos de pagamento
    const paymentMethods = periodOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'outro'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {})

    setReportData({
      totalOrders: periodOrders.length,
      totalRevenue,
      averageTicket,
      newCustomers: periodCustomers.length,
      ordersByStatus,
      revenueByDay,
      topProducts,
      paymentMethods,
      stats
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const maxRevenue = useMemo(() => {
    if (!reportData?.revenueByDay) return 0
    return Math.max(...reportData.revenueByDay.map(d => d.revenue), 1)
  }, [reportData])

  const statusLabels = {
    pending: 'Pendente',
    waiting_payment: 'Aguardando',
    paid: 'Pago',
    processing: 'Processando',
    shipped: 'Enviado',
    delivered: 'Entregue',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado'
  }

  const paymentLabels = {
    pix: 'PIX',
    credit_card: 'Cartão de Crédito',
    boleto: 'Boleto',
    outro: 'Outro'
  }

  if (!reportData) {
    return (
      <div className="reports-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Gerando relatório...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>Relatórios</h1>
          <p>Análise de desempenho da sua loja</p>
        </div>
        <div className="period-selector">
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
            <option value="year">Último ano</option>
            <option value="all">Todo período</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon revenue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-label">Faturamento</span>
            <span className="summary-value">{formatCurrency(reportData.totalRevenue)}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orders">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-label">Pedidos</span>
            <span className="summary-value">{reportData.totalOrders}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon ticket">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-label">Ticket Médio</span>
            <span className="summary-value">{formatCurrency(reportData.averageTicket)}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon customers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
          </div>
          <div className="summary-content">
            <span className="summary-label">Novos Clientes</span>
            <span className="summary-value">{reportData.newCustomers}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Chart */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>Faturamento por Dia</h3>
            <span className="chart-subtitle">Últimos 7 dias</span>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              {reportData.revenueByDay.map((day, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar" 
                      style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                      title={formatCurrency(day.revenue)}
                    />
                  </div>
                  <span className="bar-label">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Pedidos por Status</h3>
          </div>
          <div className="chart-content">
            <div className="status-list">
              {Object.entries(reportData.ordersByStatus).map(([status, count]) => (
                <div key={status} className="status-item">
                  <span className="status-name">{statusLabels[status] || status}</span>
                  <div className="status-bar-wrapper">
                    <div 
                      className={`status-bar ${status}`}
                      style={{ width: `${(count / reportData.totalOrders) * 100}%` }}
                    />
                  </div>
                  <span className="status-count">{count}</span>
                </div>
              ))}
              {Object.keys(reportData.ordersByStatus).length === 0 && (
                <p className="no-data">Nenhum pedido no período</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Métodos de Pagamento</h3>
          </div>
          <div className="chart-content">
            <div className="payment-list">
              {Object.entries(reportData.paymentMethods).map(([method, count]) => {
                const percentage = ((count / reportData.totalOrders) * 100).toFixed(1)
                return (
                  <div key={method} className="payment-item">
                    <div className="payment-info">
                      <span className="payment-name">{paymentLabels[method] || method}</span>
                      <span className="payment-percent">{percentage}%</span>
                    </div>
                    <div className="payment-bar-wrapper">
                      <div 
                        className="payment-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(reportData.paymentMethods).length === 0 && (
                <p className="no-data">Nenhum pagamento no período</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Produtos Mais Vendidos</h3>
          </div>
          <div className="chart-content">
            <div className="products-list">
              {reportData.topProducts.map((product, index) => (
                <div key={index} className="product-rank-item">
                  <span className="rank-number">{index + 1}</span>
                  <div className="product-info">
                    <span className="product-name">{product.name}</span>
                    <span className="product-stats">
                      {product.quantity} vendidos • {formatCurrency(product.revenue)}
                    </span>
                  </div>
                </div>
              ))}
              {reportData.topProducts.length === 0 && (
                <p className="no-data">Nenhum produto vendido no período</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
