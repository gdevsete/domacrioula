import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Settings.css'

const Settings = () => {
  const { getSettings, saveSettings, addNotification } = useAdmin()
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    const data = getSettings()
    setSettings(data)
    setLoading(false)
  }

  const handleChange = (section, field, value) => {
    setSettings(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleSave = async () => {
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    const success = saveSettings(settings)
    setSaving(false)
    
    if (!success) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar as configurações'
      })
    }
  }

  const tabs = [
    { id: 'general', label: 'Geral', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
    { id: 'shipping', label: 'Frete', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    )},
    { id: 'payment', label: 'Pagamento', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
    { id: 'notifications', label: 'Notificações', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    )}
  ]

  if (loading || !settings) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Carregando configurações...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>Configurações</h1>
          <p>Gerencie as configurações da sua loja</p>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <div className="btn-spinner"></div>
              Salvando...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      <div className="settings-container">
        {/* Sidebar Tabs */}
        <aside className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="settings-panel">
              <h2>Configurações Gerais</h2>
              <p className="panel-description">Informações básicas da sua loja</p>

              <div className="form-section">
                <h3>Informações da Loja</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Nome da Loja</label>
                    <input
                      type="text"
                      value={settings.siteName || ''}
                      onChange={(e) => handleChange(null, 'siteName', e.target.value)}
                      placeholder="Nome da sua loja"
                    />
                  </div>
                  <div className="form-group">
                    <label>Slogan</label>
                    <input
                      type="text"
                      value={settings.siteDescription || ''}
                      onChange={(e) => handleChange(null, 'siteDescription', e.target.value)}
                      placeholder="Descrição curta"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Contato</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => handleChange(null, 'email', e.target.value)}
                      placeholder="contato@suaoja.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => handleChange(null, 'phone', e.target.value)}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp</label>
                    <input
                      type="text"
                      value={settings.whatsapp || ''}
                      onChange={(e) => handleChange(null, 'whatsapp', e.target.value)}
                      placeholder="5500000000000"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Redes Sociais</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={settings.social?.facebook || ''}
                      onChange={(e) => handleChange('social', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={settings.social?.instagram || ''}
                      onChange={(e) => handleChange('social', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube</label>
                    <input
                      type="url"
                      value={settings.social?.youtube || ''}
                      onChange={(e) => handleChange('social', 'youtube', e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Settings */}
          {activeTab === 'shipping' && (
            <div className="settings-panel">
              <h2>Configurações de Frete</h2>
              <p className="panel-description">Configure as opções de entrega</p>

              <div className="form-section">
                <h3>Frete Grátis</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Valor Mínimo para Frete Grátis (R$)</label>
                    <input
                      type="number"
                      value={settings.shipping?.freeShippingMinValue || ''}
                      onChange={(e) => handleChange('shipping', 'freeShippingMinValue', parseFloat(e.target.value) || 0)}
                      placeholder="299.00"
                      min="0"
                      step="0.01"
                    />
                    <span className="help-text">
                      Clientes com compras acima deste valor terão frete grátis
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Frete Padrão</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Custo Padrão do Frete (R$)</label>
                    <input
                      type="number"
                      value={settings.shipping?.defaultShippingCost || ''}
                      onChange={(e) => handleChange('shipping', 'defaultShippingCost', parseFloat(e.target.value) || 0)}
                      placeholder="15.00"
                      min="0"
                      step="0.01"
                    />
                    <span className="help-text">
                      Valor cobrado quando não há frete grátis
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="settings-panel">
              <h2>Configurações de Pagamento</h2>
              <p className="panel-description">Configure os métodos de pagamento</p>

              <div className="form-section">
                <h3>PIX</h3>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Pagamento via PIX</span>
                    <span className="toggle-description">Permite pagamento instantâneo via PIX</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.payment?.pixEnabled ?? true}
                      onChange={(e) => handleChange('payment', 'pixEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {settings.payment?.pixEnabled && (
                  <div className="form-group">
                    <label>Desconto para PIX (%)</label>
                    <input
                      type="number"
                      value={settings.payment?.pixDiscount || ''}
                      onChange={(e) => handleChange('payment', 'pixDiscount', parseFloat(e.target.value) || 0)}
                      placeholder="5"
                      min="0"
                      max="100"
                    />
                    <span className="help-text">
                      Desconto aplicado em pagamentos via PIX
                    </span>
                  </div>
                )}
              </div>

              <div className="form-section">
                <h3>Boleto Bancário</h3>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Pagamento via Boleto</span>
                    <span className="toggle-description">Permite pagamento por boleto bancário</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.payment?.boletoEnabled ?? false}
                      onChange={(e) => handleChange('payment', 'boletoEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <h3>Cartão de Crédito</h3>
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Pagamento via Cartão</span>
                    <span className="toggle-description">Permite pagamento com cartão de crédito</span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.payment?.cardEnabled ?? false}
                      onChange={(e) => handleChange('payment', 'cardEnabled', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="settings-panel">
              <h2>Configurações de Notificações</h2>
              <p className="panel-description">Configure como você será notificado</p>

              <div className="form-section">
                <h3>Novos Pedidos</h3>
                
                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Notificação por E-mail</span>
                    <span className="toggle-description">
                      Receba um e-mail quando um novo pedido for feito
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.emailOnNewOrder ?? true}
                      onChange={(e) => handleChange('notifications', 'emailOnNewOrder', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-label">Notificação por WhatsApp</span>
                    <span className="toggle-description">
                      Receba uma mensagem no WhatsApp quando um novo pedido for feito
                    </span>
                  </div>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={settings.notifications?.whatsappOnNewOrder ?? true}
                      onChange={(e) => handleChange('notifications', 'whatsappOnNewOrder', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Settings
