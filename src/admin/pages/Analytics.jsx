import { useState, useEffect, useCallback } from 'react'
import { useAnalytics } from '../../contexts/AnalyticsContext'
import './Analytics.css'

const Analytics = () => {
  const { getAnalyticsSummary, getAdRecommendations, getVisits, getPixels, savePixels } = useAnalytics()
  
  const [period, setPeriod] = useState(7)
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [pixelConfig, setPixelConfig] = useState({
    facebookPixelId: '',
    googleAnalyticsId: '',
    tiktokPixelId: ''
  })
  const [pixelSaved, setPixelSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  // Carregar dados
  const loadData = useCallback(() => {
    setLoading(true)
    const data = getAnalyticsSummary(period)
    setSummary(data)
    const recs = getAdRecommendations()
    setRecommendations(recs)
    const pixels = getPixels()
    setPixelConfig(prev => ({ ...prev, ...pixels }))
    setLoading(false)
  }, [period, getAnalyticsSummary, getAdRecommendations, getPixels])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Salvar configuração de pixels
  const handleSavePixels = () => {
    savePixels(pixelConfig)
    setPixelSaved(true)
    setTimeout(() => setPixelSaved(false), 3000)
  }

  // Formatar número
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num?.toString() || '0'
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Nomes dos dias
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

  // Cores para gráficos
  const colors = ['#c45c2c', '#2563eb', '#16a34a', '#eab308', '#8b5cf6', '#ec4899']

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="spinner"></div>
          <p>Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>📊 Analytics & Anúncios</h1>
          <p>Acompanhe suas visitas, conversões e otimize seus anúncios</p>
        </div>
        <div className="header-right">
          <select value={period} onChange={(e) => setPeriod(parseInt(e.target.value))}>
            <option value={1}>Hoje</option>
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 14 dias</option>
            <option value={30}>Últimos 30 dias</option>
          </select>
          <button className="btn-refresh" onClick={loadData}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Visão Geral
        </button>
        <button 
          className={`tab ${activeTab === 'traffic' ? 'active' : ''}`}
          onClick={() => setActiveTab('traffic')}
        >
          🚀 Tráfego
        </button>
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights
        </button>
        <button 
          className={`tab ${activeTab === 'pixels' ? 'active' : ''}`}
          onClick={() => setActiveTab('pixels')}
        >
          🎯 Pixels
        </button>
        <button 
          className={`tab ${activeTab === 'visitors' ? 'active' : ''}`}
          onClick={() => setActiveTab('visitors')}
        >
          👥 Visitantes
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">👁</div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(summary?.totalPageviews || 0)}</span>
                <span className="stat-label">Visualizações</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">👤</div>
              <div className="stat-info">
                <span className="stat-value">{formatNumber(summary?.uniqueVisitors || 0)}</span>
                <span className="stat-label">Visitantes Únicos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">📱</div>
              <div className="stat-info">
                <span className="stat-value">{summary?.pagesPerSession || '0'}</span>
                <span className="stat-label">Páginas/Sessão</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">💰</div>
              <div className="stat-info">
                <span className="stat-value">{summary?.conversionRate || '0'}%</span>
                <span className="stat-label">Tx. Conversão</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Visitas por Dia */}
            <div className="chart-card">
              <h3>📈 Visitas por Dia</h3>
              <div className="bar-chart">
                {Object.entries(summary?.visitsByDay || {})
                  .sort((a, b) => a[0].localeCompare(b[0]))
                  .slice(-7)
                  .map(([date, count], index) => {
                    const maxCount = Math.max(...Object.values(summary?.visitsByDay || { a: 1 }))
                    const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                    const dayLabel = new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })
                    return (
                      <div key={date} className="bar-item">
                        <div className="bar-wrapper">
                          <div 
                            className="bar" 
                            style={{ height: `${height}%`, background: colors[index % colors.length] }}
                          >
                            <span className="bar-value">{count}</span>
                          </div>
                        </div>
                        <span className="bar-label">{dayLabel}</span>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* Por Dispositivo */}
            <div className="chart-card">
              <h3>📱 Por Dispositivo</h3>
              <div className="pie-chart-container">
                {Object.entries(summary?.byDevice || {}).map(([device, count], index) => {
                  const total = Object.values(summary?.byDevice || {}).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0
                  const deviceLabels = { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet' }
                  const deviceIcons = { mobile: '📱', desktop: '💻', tablet: '📲' }
                  return (
                    <div key={device} className="pie-item">
                      <div className="pie-bar" style={{ 
                        width: `${percentage}%`,
                        background: colors[index % colors.length]
                      }}></div>
                      <div className="pie-info">
                        <span>{deviceIcons[device]} {deviceLabels[device] || device}</span>
                        <span>{percentage}% ({count})</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="chart-card full-width">
            <h3>🏆 Páginas Mais Visitadas</h3>
            <div className="top-pages-list">
              {(summary?.topPages || []).map((page, index) => {
                const maxCount = summary?.topPages[0]?.count || 1
                const width = (page.count / maxCount) * 100
                return (
                  <div key={page.page} className="top-page-item">
                    <span className="page-rank">#{index + 1}</span>
                    <span className="page-name">{page.page}</span>
                    <div className="page-bar-container">
                      <div className="page-bar" style={{ width: `${width}%` }}></div>
                    </div>
                    <span className="page-count">{page.count}</span>
                  </div>
                )
              })}
              {(!summary?.topPages || summary.topPages.length === 0) && (
                <p className="no-data">Nenhum dado disponível ainda</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === 'traffic' && (
        <div className="tab-content">
          <div className="charts-row">
            {/* Por Fonte de Tráfego */}
            <div className="chart-card">
              <h3>🚀 Fontes de Tráfego</h3>
              <div className="source-list">
                {Object.entries(summary?.bySource || {})
                  .sort((a, b) => b[1] - a[1])
                  .map(([source, count], index) => {
                    const total = Object.values(summary?.bySource || {}).reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
                    const sourceIcons = {
                      direct: '🔗',
                      google: '🔍',
                      facebook: '📘',
                      instagram: '📸',
                      tiktok: '🎵',
                      youtube: '▶️',
                      twitter: '🐦',
                      whatsapp: '💬'
                    }
                    return (
                      <div key={source} className="source-item">
                        <span className="source-icon">{sourceIcons[source] || '🌐'}</span>
                        <span className="source-name">{source}</span>
                        <div className="source-bar-container">
                          <div 
                            className="source-bar" 
                            style={{ width: `${percentage}%`, background: colors[index % colors.length] }}
                          ></div>
                        </div>
                        <span className="source-percentage">{percentage}%</span>
                        <span className="source-count">{count}</span>
                      </div>
                    )
                  })}
                {Object.keys(summary?.bySource || {}).length === 0 && (
                  <p className="no-data">Nenhum dado de tráfego ainda</p>
                )}
              </div>
            </div>

            {/* Por Cidade */}
            <div className="chart-card">
              <h3>📍 Top Cidades</h3>
              <div className="city-list">
                {Object.entries(summary?.byCity || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([city, count], index) => (
                    <div key={city} className="city-item">
                      <span className="city-rank">#{index + 1}</span>
                      <span className="city-name">{city}</span>
                      <span className="city-count">{count} visitas</span>
                    </div>
                  ))}
                {Object.keys(summary?.byCity || {}).length === 0 && (
                  <p className="no-data">Nenhum dado de localização ainda</p>
                )}
              </div>
            </div>
          </div>

          <div className="charts-row">
            {/* Por Hora do Dia */}
            <div className="chart-card">
              <h3>⏰ Horários de Pico</h3>
              <div className="hour-chart">
                {Array.from({ length: 24 }, (_, hour) => {
                  const count = summary?.byHour?.[hour] || 0
                  const maxCount = Math.max(...Object.values(summary?.byHour || { 0: 1 }))
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0
                  const isActive = count > 0
                  return (
                    <div key={hour} className={`hour-bar ${isActive ? 'active' : ''}`}>
                      <div 
                        className="hour-fill" 
                        style={{ height: `${height}%` }}
                        title={`${hour}h: ${count} visitas`}
                      ></div>
                      {hour % 3 === 0 && <span className="hour-label">{hour}h</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Por Dia da Semana */}
            <div className="chart-card">
              <h3>📅 Por Dia da Semana</h3>
              <div className="weekday-chart">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const count = summary?.byDayOfWeek?.[day] || 0
                  const maxCount = Math.max(...Object.values(summary?.byDayOfWeek || { 0: 1 }))
                  const width = maxCount > 0 ? (count / maxCount) * 100 : 0
                  return (
                    <div key={day} className="weekday-item">
                      <span className="weekday-name">{dayNames[day].slice(0, 3)}</span>
                      <div className="weekday-bar-container">
                        <div className="weekday-bar" style={{ width: `${width}%` }}>
                          {count > 0 && <span className="weekday-count">{count}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="tab-content">
          <div className="insights-header">
            <h2>💡 Recomendações para seus Anúncios</h2>
            <p>Baseadas nos dados de visitantes dos últimos 30 dias</p>
          </div>

          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card priority-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-icon">{rec.icon}</span>
                  <span className={`rec-priority ${rec.priority}`}>
                    {rec.priority === 'high' ? '🔴 Alta' : rec.priority === 'medium' ? '🟡 Média' : '🟢 Baixa'}
                  </span>
                </div>
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
                <span className="rec-type">{rec.type}</span>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="no-recommendations">
                <span className="big-icon">📊</span>
                <h3>Coletando dados...</h3>
                <p>Continue gerando tráfego para receber recomendações personalizadas.</p>
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="quick-tips">
            <h3>🎯 Dicas Rápidas para Anúncios</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-icon">📘</span>
                <h4>Facebook/Meta</h4>
                <ul>
                  <li>Use Lookalike Audience de compradores</li>
                  <li>Retargeting de visitantes do carrinho</li>
                  <li>Exclusão de quem já comprou</li>
                </ul>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🔍</span>
                <h4>Google Ads</h4>
                <ul>
                  <li>Keywords de marca + produto</li>
                  <li>Remarketing de visitantes</li>
                  <li>Shopping Ads com feed</li>
                </ul>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🎵</span>
                <h4>TikTok</h4>
                <ul>
                  <li>Vídeos nativos (não parecer anúncio)</li>
                  <li>Primeira pessoa e unboxing</li>
                  <li>Trends e sons populares</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pixels Tab */}
      {activeTab === 'pixels' && (
        <div className="tab-content">
          <div className="pixels-header">
            <h2>🎯 Configuração de Pixels</h2>
            <p>Configure seus pixels de rastreamento para otimizar campanhas</p>
          </div>

          {pixelSaved && (
            <div className="pixel-saved-alert">
              ✅ Configurações salvas com sucesso!
            </div>
          )}

          <div className="pixels-grid">
            {/* Meta Pixel (Facebook + Instagram) */}
            <div className="pixel-card">
              <div className="pixel-header">
                <span className="pixel-icon">📘</span>
                <div>
                  <h3>Meta Pixel (Facebook + Instagram)</h3>
                  <p>Um único pixel para Facebook e Instagram Ads</p>
                </div>
              </div>
              <div className="pixel-input-group">
                <label>ID do Pixel</label>
                <input
                  type="text"
                  placeholder="Ex: 1234567890123456"
                  value={pixelConfig.facebookPixelId}
                  onChange={(e) => setPixelConfig(prev => ({
                    ...prev,
                    facebookPixelId: e.target.value
                  }))}
                />
                <small>Meta Business Suite → Gerenciador de Eventos → Fontes de Dados</small>
              </div>
              <div className="pixel-events">
                <h4>Eventos rastreados automaticamente:</h4>
                <div className="event-tags">
                  <span>PageView</span>
                  <span>ViewContent</span>
                  <span>AddToCart</span>
                  <span>InitiateCheckout</span>
                  <span>Purchase</span>
                  <span>Lead</span>
                </div>
              </div>
            </div>

            {/* Google Analytics 4 */}
            <div className="pixel-card">
              <div className="pixel-header">
                <span className="pixel-icon">🔍</span>
                <div>
                  <h3>Google Analytics 4</h3>
                  <p>Análise completa de comportamento</p>
                </div>
              </div>
              <div className="pixel-input-group">
                <label>ID de Medição (GA4)</label>
                <input
                  type="text"
                  placeholder="Ex: G-XXXXXXXXXX"
                  value={pixelConfig.googleAnalyticsId}
                  onChange={(e) => setPixelConfig(prev => ({
                    ...prev,
                    googleAnalyticsId: e.target.value
                  }))}
                />
                <small>Encontre em: Admin → Fluxos de Dados → Detalhes do Fluxo</small>
              </div>
              <div className="pixel-events">
                <h4>Eventos rastreados automaticamente:</h4>
                <div className="event-tags">
                  <span>page_view</span>
                  <span>view_item</span>
                  <span>add_to_cart</span>
                  <span>begin_checkout</span>
                  <span>purchase</span>
                </div>
              </div>
            </div>

            {/* TikTok Pixel */}
            <div className="pixel-card">
              <div className="pixel-header">
                <span className="pixel-icon">🎵</span>
                <div>
                  <h3>TikTok Pixel</h3>
                  <p>Otimize campanhas no TikTok</p>
                </div>
              </div>
              <div className="pixel-input-group">
                <label>ID do Pixel</label>
                <input
                  type="text"
                  placeholder="Ex: CXXXXXXXXXX"
                  value={pixelConfig.tiktokPixelId}
                  onChange={(e) => setPixelConfig(prev => ({
                    ...prev,
                    tiktokPixelId: e.target.value
                  }))}
                />
                <small>Encontre em: TikTok Ads Manager → Assets → Events</small>
              </div>
              <div className="pixel-events">
                <h4>Eventos rastreados automaticamente:</h4>
                <div className="event-tags">
                  <span>PageView</span>
                  <span>ViewContent</span>
                  <span>AddToCart</span>
                  <span>CompletePayment</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pixel-actions">
            <button className="btn-save-pixels" onClick={handleSavePixels}>
              💾 Salvar Configurações de Pixels
            </button>
          </div>

          {/* UTM Builder */}
          <div className="utm-builder">
            <h3>🔗 Construtor de UTMs</h3>
            <p>Use UTMs para rastrear a origem exata de cada visitante</p>
            <div className="utm-example">
              <code>
                {`${window.location.origin}/?utm_source=facebook&utm_medium=paid&utm_campaign=promo_verao`}
              </code>
              <button onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?utm_source=facebook&utm_medium=paid&utm_campaign=promo_verao`)
              }}>
                📋 Copiar
              </button>
            </div>
            <div className="utm-params">
              <div className="utm-param">
                <strong>utm_source</strong>
                <span>De onde vem (facebook, google, tiktok)</span>
              </div>
              <div className="utm-param">
                <strong>utm_medium</strong>
                <span>Tipo (paid, organic, social, email)</span>
              </div>
              <div className="utm-param">
                <strong>utm_campaign</strong>
                <span>Nome da campanha</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitors Tab */}
      {activeTab === 'visitors' && (
        <div className="tab-content">
          <div className="visitors-header">
            <h2>👥 Visitantes Recentes</h2>
            <p>Últimos visitantes do seu site</p>
          </div>

          <div className="visitors-table">
            <div className="table-header">
              <span>Data/Hora</span>
              <span>Cidade</span>
              <span>Dispositivo</span>
              <span>Origem</span>
              <span>Página</span>
            </div>
            <div className="table-body">
              {(summary?.recentVisits || []).map((visit) => (
                <div key={visit.id} className="table-row">
                  <span className="visit-time">
                    {new Date(visit.timestamp).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="visit-city">
                    📍 {visit.city || 'Desconhecida'}
                  </span>
                  <span className="visit-device">
                    {visit.device === 'mobile' ? '📱' : visit.device === 'tablet' ? '📲' : '💻'}
                    {visit.browser}
                  </span>
                  <span className="visit-source">
                    {visit.source === 'direct' ? '🔗' : 
                     visit.source === 'google' ? '🔍' :
                     visit.source === 'facebook' ? '📘' :
                     visit.source === 'instagram' ? '📸' :
                     visit.source === 'tiktok' ? '🎵' : '🌐'}
                    {visit.source}
                    {visit.medium !== 'none' && ` / ${visit.medium}`}
                  </span>
                  <span className="visit-page">{visit.page}</span>
                </div>
              ))}
              {(!summary?.recentVisits || summary.recentVisits.length === 0) && (
                <div className="no-visitors">
                  <p>Nenhum visitante registrado ainda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
