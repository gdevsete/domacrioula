import { useState, useRef } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './QuoteGenerator.css'

const QuoteGenerator = () => {
  const { addNotification } = useAdmin()
  const quoteRef = useRef(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerCpf: '',
    customerPhone: '',
    customerEmail: '',
    date: new Date().toISOString().split('T')[0],
    validityDays: '15',
    paymentConditions: 'À vista ou em até 3x sem juros',
    observations: ''
  })

  const [items, setItems] = useState([
    { id: 1, description: '', quantity: 1, unitValue: '' }
  ])

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    }
    return value.slice(0, 14)
  }

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      if (numbers.length <= 10) {
        return numbers
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
      }
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
    return value.slice(0, 15)
  }

  const formatCurrency = (value) => {
    const numbers = String(value).replace(/\D/g, '')
    const amount = parseInt(numbers || 0) / 100
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatCurrencyInput = (value) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'customerCpf') {
      setFormData(prev => ({ ...prev, [name]: formatCPF(value) }))
    } else if (name === 'customerPhone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'unitValue') {
          return { ...item, [field]: formatCurrencyInput(value) }
        }
        if (field === 'quantity') {
          return { ...item, [field]: Math.max(1, parseInt(value) || 1) }
        }
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id)) + 1
    setItems(prev => [...prev, { id: newId, description: '', quantity: 1, unitValue: '' }])
  }

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const calculateItemTotal = (item) => {
    const unitValue = parseInt(item.unitValue || 0) / 100
    return unitValue * item.quantity
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const formatDateBR = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const formatDateForFilename = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}-${month}-${year}`
  }

  const calculateValidityDate = () => {
    const date = new Date(formData.date)
    date.setDate(date.getDate() + parseInt(formData.validityDays || 15))
    return date.toISOString().split('T')[0]
  }

  const generateQuoteNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0')
    return `ORC${year}${month}${random}`
  }

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      addNotification('error', 'Erro', 'Nome do cliente é obrigatório')
      return false
    }
    if (!formData.date) {
      addNotification('error', 'Erro', 'Data é obrigatória')
      return false
    }
    
    const hasValidItem = items.some(item => 
      item.description.trim() && parseInt(item.unitValue || 0) > 0
    )
    
    if (!hasValidItem) {
      addNotification('error', 'Erro', 'Adicione pelo menos um item com descrição e valor')
      return false
    }
    
    return true
  }

  const handleGeneratePDF = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const html2pdf = (await import('html2pdf.js')).default
      
      const element = quoteRef.current
      
      // Remove scale transform for PDF generation
      const originalTransform = element.style.transform
      const originalMarginBottom = element.style.marginBottom
      element.style.transform = 'none'
      element.style.marginBottom = '0'
      
      const sanitizedName = formData.customerName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
      
      const filename = `orcamento_${sanitizedName}_${formatDateForFilename(formData.date)}.pdf`
      
      const opt = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      }
      
      await html2pdf().set(opt).from(element).save()
      
      // Restore original transform
      element.style.transform = originalTransform
      element.style.marginBottom = originalMarginBottom
      
      addNotification('success', 'Sucesso', `Orçamento gerado: ${filename}`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      addNotification('error', 'Erro', 'Falha ao gerar o PDF')
    } finally {
      setLoading(false)
    }
  }

  const quoteNumber = generateQuoteNumber()
  const total = calculateTotal()

  return (
    <div className="quote-generator-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 7h6m-6 4h6m-6 4h4"/>
              <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            </svg>
            Gerador de Orçamentos
          </h1>
          <p>Crie orçamentos e cotações profissionais para seus clientes</p>
        </div>
      </div>

      <div className="quote-content">
        {/* Form Section */}
        <div className="quote-form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                </svg>
                Dados do Cliente
              </h2>
            </div>

            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="customerName">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Nome completo do cliente"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerCpf">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M6 8h.01M10 8h.01M14 8h.01"/>
                  </svg>
                  CPF/CNPJ
                </label>
                <input
                  type="text"
                  id="customerCpf"
                  name="customerCpf"
                  value={formData.customerCpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerPhone">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Telefone
                </label>
                <input
                  type="text"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerEmail">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  E-mail
                </label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Data *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="form-card">
            <div className="form-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Itens do Orçamento
              </h2>
              <button type="button" className="btn-add-item" onClick={addItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar Item
              </button>
            </div>

            <div className="items-list">
              {items.map((item, index) => (
                <div key={item.id} className="item-row">
                  <div className="item-number">{index + 1}</div>
                  <div className="item-fields">
                    <div className="item-description">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        placeholder="Descrição do produto/serviço"
                      />
                    </div>
                    <div className="item-quantity">
                      <label>Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="item-value">
                      <label>Valor Unit.</label>
                      <input
                        type="text"
                        value={formatCurrency(item.unitValue)}
                        onChange={(e) => handleItemChange(item.id, 'unitValue', e.target.value)}
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div className="item-total">
                      <label>Total</label>
                      <span>{formatCurrency((calculateItemTotal(item) * 100).toString())}</span>
                    </div>
                    <button 
                      type="button" 
                      className="btn-remove-item"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="items-total">
              <span className="total-label">TOTAL DO ORÇAMENTO:</span>
              <span className="total-value">{formatCurrency((total * 100).toString())}</span>
            </div>
          </div>

          {/* Conditions Section */}
          <div className="form-card">
            <div className="form-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Condições
              </h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="validityDays">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                  Validade (dias)
                </label>
                <select
                  id="validityDays"
                  name="validityDays"
                  value={formData.validityDays}
                  onChange={handleChange}
                >
                  <option value="7">7 dias</option>
                  <option value="15">15 dias</option>
                  <option value="30">30 dias</option>
                  <option value="45">45 dias</option>
                  <option value="60">60 dias</option>
                  <option value="90">90 dias</option>
                </select>
              </div>

              <div className="form-group full">
                <label htmlFor="paymentConditions">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Condições de Pagamento
                </label>
                <input
                  type="text"
                  id="paymentConditions"
                  name="paymentConditions"
                  value={formData.paymentConditions}
                  onChange={handleChange}
                  placeholder="Ex: À vista ou em até 3x sem juros"
                />
              </div>

              <div className="form-group full">
                <label htmlFor="observations">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Observações
                </label>
                <textarea
                  id="observations"
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Informações adicionais sobre o orçamento..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-generate"
              onClick={handleGeneratePDF}
              disabled={loading}
            >
              {loading ? (
                <span className="btn-spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              )}
              {loading ? 'Gerando...' : 'Gerar PDF'}
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="quote-preview-section">
          <div className="preview-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              Pré-visualização do Orçamento
            </h2>
          </div>
          
          <div className="preview-container">
            <div className="quote-document" ref={quoteRef}>
              {/* Quote Header */}
              <div className="quote-doc-header">
                <div className="quote-logo-section">
                  <img 
                    src="/images/logo/logo.png" 
                    alt="Doma Crioula" 
                    className="quote-logo"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="quote-company-info">
                  <h1>DOMA CRIOULA</h1>
                  <p>Caixas Térmicas & Produtos Personalizados</p>
                  <p className="small">CNPJ: 18.701.908/0001-98</p>
                  <p className="small">Sapiranga - RS | contato@domacrioula.com.br</p>
                </div>
              </div>

              {/* Quote Title */}
              <div className="quote-title">
                <h2>ORÇAMENTO</h2>
                <div className="quote-number">Nº {quoteNumber}</div>
              </div>

              {/* Customer Info */}
              <div className="quote-customer-box">
                <h3>DADOS DO CLIENTE</h3>
                <div className="customer-grid">
                  <div className="customer-item">
                    <span className="label">Nome:</span>
                    <span className="value">{formData.customerName || '_______________'}</span>
                  </div>
                  {formData.customerCpf && (
                    <div className="customer-item">
                      <span className="label">CPF/CNPJ:</span>
                      <span className="value">{formData.customerCpf}</span>
                    </div>
                  )}
                  {formData.customerPhone && (
                    <div className="customer-item">
                      <span className="label">Telefone:</span>
                      <span className="value">{formData.customerPhone}</span>
                    </div>
                  )}
                  {formData.customerEmail && (
                    <div className="customer-item">
                      <span className="label">E-mail:</span>
                      <span className="value">{formData.customerEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="quote-items-table">
                <table>
                  <thead>
                    <tr>
                      <th className="col-item">Item</th>
                      <th className="col-desc">Descrição</th>
                      <th className="col-qty">Qtd</th>
                      <th className="col-unit">Valor Unit.</th>
                      <th className="col-total">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter(item => item.description.trim()).map((item, index) => (
                      <tr key={item.id}>
                        <td className="col-item">{index + 1}</td>
                        <td className="col-desc">{item.description}</td>
                        <td className="col-qty">{item.quantity}</td>
                        <td className="col-unit">{formatCurrency(item.unitValue)}</td>
                        <td className="col-total">{formatCurrency((calculateItemTotal(item) * 100).toString())}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4" className="total-label">VALOR TOTAL</td>
                      <td className="total-value">{formatCurrency((total * 100).toString())}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Conditions */}
              <div className="quote-conditions">
                <div className="condition-item">
                  <span className="label">Data do Orçamento:</span>
                  <span className="value">{formatDateBR(formData.date)}</span>
                </div>
                <div className="condition-item">
                  <span className="label">Válido até:</span>
                  <span className="value">{formatDateBR(calculateValidityDate())}</span>
                </div>
                <div className="condition-item">
                  <span className="label">Condições de Pagamento:</span>
                  <span className="value">{formData.paymentConditions}</span>
                </div>
              </div>

              {formData.observations && (
                <div className="quote-observations">
                  <strong>Observações:</strong>
                  <p>{formData.observations}</p>
                </div>
              )}

              {/* Quote Footer */}
              <div className="quote-footer">
                <p className="quote-message">
                  Agradecemos a preferência! Estamos à disposição para quaisquer esclarecimentos.
                </p>
                
                <div className="quote-signature">
                  <div className="signature-line"></div>
                  <p className="signature-name">DOMA CRIOULA</p>
                  <p className="signature-role">Atendimento ao Cliente</p>
                </div>

                <div className="quote-footer-info">
                  <p>Este orçamento não tem valor de nota fiscal.</p>
                  <p>Doma Crioula - Qualidade e Tradição</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteGenerator
