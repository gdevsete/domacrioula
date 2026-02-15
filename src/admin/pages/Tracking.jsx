import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Tracking.css'

// Status disponíveis para rastreamento
const TRACKING_STATUSES = [
  { value: 'posted', label: 'Objeto Postado', icon: '📦' },
  { value: 'in_transit', label: 'Em Trânsito', icon: '🚚' },
  { value: 'hub', label: 'Em Centro de Distribuição', icon: '🏢' },
  { value: 'out_for_delivery', label: 'Saiu para Entrega', icon: '📍' },
  { value: 'delivery_attempt', label: 'Tentativa de Entrega', icon: '🔔' },
  { value: 'awaiting_pickup', label: 'Aguardando Retirada', icon: '⏳' },
  { value: 'delivered', label: 'Entregue', icon: '✅' },
  { value: 'returned', label: 'Devolvido', icon: '↩️' }
]

// Estados brasileiros
const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

const Tracking = () => {
  const { addNotification } = useAdmin()
  
  // Estados
  const [trackings, setTrackings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedTracking, setSelectedTracking] = useState(null)
  
  // Form de criação
  const [createForm, setCreateForm] = useState({
    order_number: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    destination_city: '',
    destination_state: 'RS',
    destination_cep: ''
  })
  
  // Form de atualização
  const [updateForm, setUpdateForm] = useState({
    new_status: '',
    status_description: '',
    status_location: '',
    status_details: ''
  })

  // Carregar rastreios
  const loadTrackings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tracking?all=true', {
        headers: {
          'X-Admin-Token': localStorage.getItem('doma_crioula_admin_token') || ''
        }
      })
      
      if (!res.ok) throw new Error('Erro ao carregar rastreios')
      
      const data = await res.json()
      setTrackings(data.trackings || [])
    } catch (error) {
      console.error('Erro:', error)
      addNotification('error', 'Erro', 'Não foi possível carregar os rastreios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrackings()
  }, [])

  // Criar novo rastreio
  const handleCreateTracking = async (e) => {
    e.preventDefault()
    
    if (!createForm.order_number || !createForm.customer_name || !createForm.destination_city) {
      addNotification('error', 'Erro', 'Preencha todos os campos obrigatórios')
      return
    }

    try {
      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('doma_crioula_admin_token') || ''
        },
        body: JSON.stringify(createForm)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      addNotification('success', 'Sucesso', `Rastreio ${data.tracking.tracking_code} criado!`)
      setShowCreateModal(false)
      setCreateForm({
        order_number: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        destination_city: '',
        destination_state: 'RS',
        destination_cep: ''
      })
      loadTrackings()
    } catch (error) {
      addNotification('error', 'Erro', error.message)
    }
  }

  // Atualizar status do rastreio
  const handleUpdateStatus = async (e) => {
    e.preventDefault()
    
    if (!updateForm.new_status || !updateForm.status_description) {
      addNotification('error', 'Erro', 'Selecione um status e digite a descrição')
      return
    }

    try {
      const res = await fetch('/api/tracking', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': localStorage.getItem('doma_crioula_admin_token') || ''
        },
        body: JSON.stringify({
          id: selectedTracking.id,
          ...updateForm
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error)

      addNotification('success', 'Sucesso', 'Status atualizado com sucesso!')
      setShowUpdateModal(false)
      setUpdateForm({
        new_status: '',
        status_description: '',
        status_location: '',
        status_details: ''
      })
      loadTrackings()
    } catch (error) {
      addNotification('error', 'Erro', error.message)
    }
  }

  // Deletar rastreio
  const handleDeleteTracking = async (tracking) => {
    if (!confirm(`Tem certeza que deseja excluir o rastreio ${tracking.tracking_code}?`)) {
      return
    }

    try {
      const res = await fetch(`/api/tracking?id=${tracking.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Token': localStorage.getItem('doma_crioula_admin_token') || ''
        }
      })

      if (!res.ok) throw new Error('Erro ao deletar')

      addNotification('success', 'Sucesso', 'Rastreio deletado com sucesso!')
      loadTrackings()
    } catch (error) {
      addNotification('error', 'Erro', error.message)
    }
  }

  // Copiar código
  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    addNotification('success', 'Copiado', `Código ${code} copiado!`)
  }

  // Filtrar rastreios
  const filteredTrackings = trackings.filter(t => {
    const matchesSearch = 
      t.tracking_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || t.current_status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // Formatar data
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obter label do status
  const getStatusLabel = (status) => {
    const found = TRACKING_STATUSES.find(s => s.value === status)
    return found ? found.label : status
  }

  // Obter ícone do status
  const getStatusIcon = (status) => {
    const found = TRACKING_STATUSES.find(s => s.value === status)
    return found ? found.icon : '📦'
  }

  // Obter classe do status
  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered'
      case 'out_for_delivery': return 'status-out'
      case 'in_transit': 
      case 'hub': return 'status-transit'
      case 'returned': return 'status-returned'
      default: return 'status-default'
    }
  }

  return (
    <div className="tracking-admin">
      {/* Header */}
      <div className="tracking-header">
        <div className="tracking-header__left">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Rastreamento de Pedidos
          </h1>
          <p>Gerencie códigos de rastreio e atualize status de entrega</p>
        </div>
        
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Gerar Código de Rastreio
        </button>
      </div>

      {/* Stats */}
      <div className="tracking-stats">
        <div className="stat-card">
          <div className="stat-icon stat-icon--total">📦</div>
          <div className="stat-info">
            <span className="stat-value">{trackings.length}</span>
            <span className="stat-label">Total de Rastreios</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--transit">🚚</div>
          <div className="stat-info">
            <span className="stat-value">
              {trackings.filter(t => ['in_transit', 'hub', 'out_for_delivery'].includes(t.current_status)).length}
            </span>
            <span className="stat-label">Em Trânsito</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--delivered">✅</div>
          <div className="stat-info">
            <span className="stat-value">
              {trackings.filter(t => t.current_status === 'delivered').length}
            </span>
            <span className="stat-label">Entregues</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon--pending">⏳</div>
          <div className="stat-info">
            <span className="stat-value">
              {trackings.filter(t => t.current_status === 'posted').length}
            </span>
            <span className="stat-label">Aguardando</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="tracking-filters">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por código, pedido, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos os Status</option>
          {TRACKING_STATUSES.map(s => (
            <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="tracking-table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando rastreios...</p>
          </div>
        ) : filteredTrackings.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <h3>Nenhum rastreio encontrado</h3>
            <p>Clique em "Gerar Código de Rastreio" para criar um novo</p>
          </div>
        ) : (
          <table className="tracking-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Destino</th>
                <th>Status</th>
                <th>Última Atualização</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrackings.map(tracking => (
                <tr key={tracking.id}>
                  <td>
                    <div className="code-cell">
                      <span className="tracking-code">{tracking.tracking_code}</span>
                      <button 
                        className="btn-copy" 
                        onClick={() => copyCode(tracking.tracking_code)}
                        title="Copiar código"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="order-number">#{tracking.order_number}</span>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-name">{tracking.customer_name}</span>
                      {tracking.customer_email && (
                        <span className="customer-email">{tracking.customer_email}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="destination">
                      {tracking.destination_city} - {tracking.destination_state}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tracking.current_status)}`}>
                      <span className="status-icon">{getStatusIcon(tracking.current_status)}</span>
                      {getStatusLabel(tracking.current_status)}
                    </span>
                  </td>
                  <td>
                    <span className="update-date">{formatDate(tracking.updated_at)}</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="btn-action btn-history"
                        onClick={() => {
                          setSelectedTracking(tracking)
                          setShowHistoryModal(true)
                        }}
                        title="Ver histórico"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </button>
                      <button 
                        className="btn-action btn-update"
                        onClick={() => {
                          setSelectedTracking(tracking)
                          setUpdateForm({
                            ...updateForm,
                            status_location: `${tracking.destination_city} - ${tracking.destination_state}`
                          })
                          setShowUpdateModal(true)
                        }}
                        title="Atualizar status"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={() => handleDeleteTracking(tracking)}
                        title="Excluir"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: Criar Rastreio */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Gerar Código de Rastreio
              </h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateTracking} className="modal-body">
              <div className="form-section">
                <h3>Informações do Pedido</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Número do Pedido *</label>
                    <input
                      type="text"
                      value={createForm.order_number}
                      onChange={(e) => setCreateForm({...createForm, order_number: e.target.value.toUpperCase()})}
                      placeholder="Ex: 12345"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Dados do Cliente</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome do Cliente *</label>
                    <input
                      type="text"
                      value={createForm.customer_name}
                      onChange={(e) => setCreateForm({...createForm, customer_name: e.target.value})}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row form-row--2">
                  <div className="form-group">
                    <label>E-mail</label>
                    <input
                      type="email"
                      value={createForm.customer_email}
                      onChange={(e) => setCreateForm({...createForm, customer_email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={createForm.customer_phone}
                      onChange={(e) => setCreateForm({...createForm, customer_phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Endereço de Destino</h3>
                
                <div className="form-row form-row--2">
                  <div className="form-group">
                    <label>Cidade *</label>
                    <input
                      type="text"
                      value={createForm.destination_city}
                      onChange={(e) => setCreateForm({...createForm, destination_city: e.target.value})}
                      placeholder="Cidade de destino"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado *</label>
                    <select
                      value={createForm.destination_state}
                      onChange={(e) => setCreateForm({...createForm, destination_state: e.target.value})}
                      required
                    >
                      {BRAZILIAN_STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>CEP</label>
                    <input
                      type="text"
                      value={createForm.destination_cep}
                      onChange={(e) => setCreateForm({...createForm, destination_cep: e.target.value})}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>
                  O código será gerado automaticamente e o status inicial será "Objeto Postado" 
                  com origem em Sapiranga - RS.
                </p>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Gerar Código
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Atualizar Status */}
      {showUpdateModal && selectedTracking && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar Atualização
              </h2>
              <button className="modal-close" onClick={() => setShowUpdateModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="modal-body">
              <div className="tracking-info-card">
                <div className="info-row">
                  <span className="info-label">Código:</span>
                  <span className="info-value tracking-code">{selectedTracking.tracking_code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cliente:</span>
                  <span className="info-value">{selectedTracking.customer_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Destino:</span>
                  <span className="info-value">{selectedTracking.destination_city} - {selectedTracking.destination_state}</span>
                </div>
              </div>
              
              <div className="form-section">
                <h3>Nova Atualização</h3>
                
                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={updateForm.new_status}
                    onChange={(e) => setUpdateForm({...updateForm, new_status: e.target.value})}
                    required
                  >
                    <option value="">Selecione o status</option>
                    {TRACKING_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Descrição *</label>
                  <input
                    type="text"
                    value={updateForm.status_description}
                    onChange={(e) => setUpdateForm({...updateForm, status_description: e.target.value})}
                    placeholder="Ex: Objeto saiu para entrega ao destinatário"
                    required
                  />
                </div>
                
                <div className="form-row form-row--2">
                  <div className="form-group">
                    <label>Local</label>
                    <input
                      type="text"
                      value={updateForm.status_location}
                      onChange={(e) => setUpdateForm({...updateForm, status_location: e.target.value})}
                      placeholder="Ex: Porto Alegre - RS"
                    />
                  </div>
                  <div className="form-group">
                    <label>Detalhes Adicionais</label>
                    <input
                      type="text"
                      value={updateForm.status_details}
                      onChange={(e) => setUpdateForm({...updateForm, status_details: e.target.value})}
                      placeholder="Ex: Previsão de entrega até 18h"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowUpdateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  Adicionar Atualização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Histórico */}
      {showHistoryModal && selectedTracking && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
                Histórico de Rastreamento
              </h2>
              <button className="modal-close" onClick={() => setShowHistoryModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="tracking-info-card">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Código de Rastreio</span>
                    <span className="info-value tracking-code">{selectedTracking.tracking_code}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nº do Pedido</span>
                    <span className="info-value">#{selectedTracking.order_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Cliente</span>
                    <span className="info-value">{selectedTracking.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Origem</span>
                    <span className="info-value">Sapiranga - RS</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Destino</span>
                    <span className="info-value">{selectedTracking.destination_city} - {selectedTracking.destination_state}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status Atual</span>
                    <span className={`status-badge ${getStatusClass(selectedTracking.current_status)}`}>
                      {getStatusIcon(selectedTracking.current_status)} {getStatusLabel(selectedTracking.current_status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className="history-title">Movimentações</h3>
              
              <div className="history-timeline">
                {(selectedTracking.history || []).slice().reverse().map((entry, index) => (
                  <div key={entry.id} className={`timeline-item ${index === 0 ? 'timeline-item--current' : ''}`}>
                    <div className="timeline-marker">
                      <span className="timeline-icon">{getStatusIcon(entry.status)}</span>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-status">{entry.description}</span>
                        <span className="timeline-date">{formatDate(entry.date)}</span>
                      </div>
                      <span className="timeline-location">{entry.location}</span>
                      {entry.details && <span className="timeline-details">{entry.details}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-submit"
                onClick={() => {
                  setShowHistoryModal(false)
                  setUpdateForm({
                    ...updateForm,
                    status_location: `${selectedTracking.destination_city} - ${selectedTracking.destination_state}`
                  })
                  setShowUpdateModal(true)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar Atualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tracking
