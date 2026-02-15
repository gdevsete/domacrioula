import { useState, useRef } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './ReceiptGenerator.css'

const ReceiptGenerator = () => {
  const { addNotification } = useAdmin()
  const receiptRef = useRef(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerCpf: '',
    product: '',
    value: '',
    paymentMethod: 'pix',
    date: new Date().toISOString().split('T')[0],
    observations: ''
  })

  const [showPreview, setShowPreview] = useState(false)

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

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, '')
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
    } else if (name === 'value') {
      setFormData(prev => ({ ...prev, [name]: formatCurrencyInput(value) }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      cartao_credito: 'Cartão de Crédito',
      cartao_debito: 'Cartão de Débito',
      boleto: 'Boleto Bancário',
      transferencia: 'Transferência Bancária'
    }
    return methods[method] || method
  }

  const formatDateBR = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const formatDateForFilename = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}-${month}-${year}`
  }

  const generateReceiptNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    return `DC${year}${random}`
  }

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      addNotification('error', 'Erro', 'Nome do cliente é obrigatório')
      return false
    }
    if (!formData.customerCpf.trim() || formData.customerCpf.replace(/\D/g, '').length < 11) {
      addNotification('error', 'Erro', 'CPF inválido')
      return false
    }
    if (!formData.product.trim()) {
      addNotification('error', 'Erro', 'Produto é obrigatório')
      return false
    }
    if (!formData.value || parseInt(formData.value) === 0) {
      addNotification('error', 'Erro', 'Valor é obrigatório')
      return false
    }
    if (!formData.date) {
      addNotification('error', 'Erro', 'Data é obrigatória')
      return false
    }
    return true
  }

  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true)
    }
  }

  const handleGeneratePDF = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Dynamically import html2pdf
      const html2pdf = (await import('html2pdf.js')).default
      
      const element = receiptRef.current
      const receiptNumber = generateReceiptNumber()
      
      // Remove scale transform for PDF generation
      const originalTransform = element.style.transform
      const originalMarginBottom = element.style.marginBottom
      element.style.transform = 'none'
      element.style.marginBottom = '0'
      
      // Sanitize filename
      const sanitizedName = formData.customerName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
      
      const filename = `recibo_${sanitizedName}_${formatDateForFilename(formData.date)}.pdf`
      
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
      
      addNotification('success', 'Sucesso', `Recibo gerado: ${filename}`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      addNotification('error', 'Erro', 'Falha ao gerar o PDF')
    } finally {
      setLoading(false)
    }
  }

  const receiptNumber = generateReceiptNumber()
  const valueNumber = parseInt(formData.value || 0) / 100

  return (
    <div className="receipt-generator-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Gerador de Recibos
          </h1>
          <p>Crie recibos profissionais para seus clientes</p>
        </div>
      </div>

      <div className="receipt-content">
        {/* Form Section */}
        <div className="receipt-form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Dados do Recibo
              </h2>
            </div>
            
            <div className="form-body">
              <div className="form-group">
                <label>Nome Completo do Cliente *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="Ex: João da Silva Santos"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>CPF *</label>
                  <input
                    type="text"
                    name="customerCpf"
                    value={formData.customerCpf}
                    onChange={handleChange}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Data *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Produto / Descrição *</label>
                <textarea
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  placeholder="Ex: Caixa Térmica 150L Personalizada com Gravação"
                  rows={3}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor *</label>
                  <div className="input-with-prefix">
                    <span className="input-prefix">R$</span>
                    <input
                      type="text"
                      name="value"
                      value={formData.value ? formatCurrency(formData.value).replace('R$', '').trim() : ''}
                      onChange={handleChange}
                      placeholder="0,00"
                      className="form-input with-prefix"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Forma de Pagamento *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="transferencia">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleChange}
                  placeholder="Informações adicionais..."
                  rows={2}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-preview"
                  onClick={handlePreview}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Visualizar
                </button>
                <button 
                  type="button" 
                  className="btn-generate"
                  onClick={handleGeneratePDF}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="btn-spinner"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7,10 12,15 17,10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Gerar PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="receipt-preview-section">
          <div className="preview-header">
            <h2>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              Pré-visualização do Recibo
            </h2>
          </div>
          
          <div className="preview-container">
            {/* Actual Receipt - This will be converted to PDF */}
            <div className="receipt-document" ref={receiptRef}>
              {/* Carimbo PAGO */}
              <div className="receipt-stamp">
                <div className="stamp-company">DOMA CRIOULA</div>
                <div className="stamp-pago">PAGO</div>
                <div className="stamp-cnpj">CNPJ: 18.701.908/0001-98</div>
              </div>

              {/* Receipt Header */}
              <div className="receipt-doc-header">
                <div className="receipt-logo-section">
                  <img 
                    src="/images/logo/logo.png" 
                    alt="Doma Crioula" 
                    className="receipt-logo"
                    crossOrigin="anonymous"
                  />
                </div>
                <div className="receipt-company-info">
                  <h1>DOMA CRIOULA</h1>
                  <p>Caixas Térmicas & Produtos Personalizados</p>
                  <p className="small">CNPJ: 18.701.908/0001-98</p>
                  <p className="small">Sapiranga - RS | contato@domacrioula.com.br</p>
                </div>
              </div>

              {/* Receipt Title */}
              <div className="receipt-title">
                <h2>RECIBO DE PAGAMENTO</h2>
                <div className="receipt-number">Nº {receiptNumber}</div>
              </div>

              {/* Receipt Value Highlight */}
              <div className="receipt-value-box">
                <span className="value-label">VALOR RECEBIDO</span>
                <span className="value-amount">
                  {formatCurrency(formData.value || '0')}
                </span>
              </div>

              {/* Receipt Body */}
              <div className="receipt-body">
                <p className="receipt-text">
                  Recebi de <strong>{formData.customerName || '_______________'}</strong>, 
                  inscrito(a) no CPF sob o nº <strong>{formData.customerCpf || '___.___.___-__'}</strong>, 
                  a importância de <strong>{formatCurrency(formData.value || '0')}</strong>{' '}
                  ({valueNumber > 0 ? numberToWords(valueNumber) : 'zero reais'}), 
                  referente à:
                </p>
                
                <div className="receipt-product-box">
                  <p>{formData.product || 'Descrição do produto/serviço'}</p>
                </div>

                {formData.observations && (
                  <div className="receipt-observations">
                    <strong>Observações:</strong>
                    <p>{formData.observations}</p>
                  </div>
                )}

                <div className="receipt-payment-info">
                  <div className="info-item">
                    <span className="info-label">Forma de Pagamento:</span>
                    <span className="info-value">{getPaymentMethodLabel(formData.paymentMethod)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Data:</span>
                    <span className="info-value">{formatDateBR(formData.date)}</span>
                  </div>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="receipt-footer">
                <p className="receipt-declaration">
                  Para maior clareza, firmo o presente recibo para que produza os efeitos legais.
                </p>
                
                <div className="receipt-location-date">
                  <p>Sapiranga - RS, {formatDateBR(formData.date)}</p>
                </div>

                <div className="receipt-signature">
                  <div className="signature-line"></div>
                  <p className="signature-name">DOMA CRIOULA</p>
                  <p className="signature-role">Responsável pelo Recebimento</p>
                </div>

                <div className="receipt-footer-info">
                  <p>Este documento é válido como comprovante de pagamento.</p>
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

// Helper function to convert number to words in Portuguese
function numberToWords(value) {
  if (value === 0) return 'zero reais'
  
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  
  const intPart = Math.floor(value)
  const decPart = Math.round((value - intPart) * 100)
  
  let result = ''
  
  // Handle thousands
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000)
    if (thousands === 1) {
      result += 'mil'
    } else {
      result += convertHundreds(thousands, units, teens, tens, hundreds) + ' mil'
    }
  }
  
  // Handle hundreds
  const remainder = intPart % 1000
  if (remainder > 0) {
    if (intPart >= 1000) result += ' '
    if (remainder === 100) {
      result += 'cem'
    } else {
      result += convertHundreds(remainder, units, teens, tens, hundreds)
    }
  }
  
  // Add currency
  if (intPart === 1) {
    result += ' real'
  } else if (intPart > 0) {
    result += ' reais'
  }
  
  // Handle cents
  if (decPart > 0) {
    if (intPart > 0) result += ' e '
    if (decPart < 10) {
      result += units[decPart]
    } else if (decPart < 20) {
      result += teens[decPart - 10]
    } else {
      const ten = Math.floor(decPart / 10)
      const unit = decPart % 10
      result += tens[ten]
      if (unit > 0) result += ' e ' + units[unit]
    }
    result += decPart === 1 ? ' centavo' : ' centavos'
  }
  
  return result.trim()
}

function convertHundreds(num, units, teens, tens, hundreds) {
  let result = ''
  
  if (num >= 100) {
    result += hundreds[Math.floor(num / 100)]
    num %= 100
    if (num > 0) result += ' e '
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)]
    num %= 10
    if (num > 0) result += ' e '
  }
  
  if (num >= 10) {
    result += teens[num - 10]
  } else if (num > 0) {
    result += units[num]
  }
  
  return result
}

export default ReceiptGenerator
