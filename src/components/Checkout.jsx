import { useState, useEffect, useCallback } from 'react'
import { X, User, Mail, Phone, FileText, MapPin, Copy, Check, Loader2, AlertCircle, RefreshCw, Tag, Package, Shield, Truck, Star, MessageCircle, Receipt, Building2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { createPixTransaction, getTransaction, formatCurrency } from '../services/podpayService'
import { useAuth } from '../contexts/AuthContext'
import './Checkout.css'

// Validador de CPF
const validateCPF = (cpf) => {
  cpf = cpf.replace(/\D/g, '')
  if (cpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf[9])) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cpf[10])
}

// Validador de CNPJ
const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/\D/g, '')
  if (cnpj.length !== 14) return false
  if (/^(\d)\1+$/.test(cnpj)) return false
  
  let size = cnpj.length - 2
  let numbers = cnpj.substring(0, size)
  let digits = cnpj.substring(size)
  let sum = 0
  let pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--
    if (pos < 2) pos = 9
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11
  if (result !== parseInt(digits.charAt(0))) return false
  
  size = size + 1
  numbers = cnpj.substring(0, size)
  sum = 0
  pos = size - 7
  
  for (let i = size; i >= 1; i--) {
    sum += numbers.charAt(size - i) * pos--
    if (pos < 2) pos = 9
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11
  return result === parseInt(digits.charAt(1))
}

// Buscar CEP via ViaCEP API
const fetchAddressByCEP = async (cep) => {
  const cleanCEP = cep.replace(/\D/g, '')
  if (cleanCEP.length !== 8) return null
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
    const data = await response.json()
    
    if (data.erro) return null
    
    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      complement: data.complemento || ''
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error)
    return null
  }
}

// Depoimentos de clientes de todas as regiões do Brasil
const TESTIMONIALS = [
  // Região Sul
  {
    name: 'Ricardo Martins',
    location: 'Porto Alegre, RS',
    rating: 5,
    text: 'Comprei a caixa térmica de 90L e superou todas as expectativas! Manteve o gelo por mais de 4 dias no acampamento. Entrega super rápida pelos Correios.',
    product: 'Caixa Térmica 90L'
  },
  {
    name: 'Fernanda Souza',
    location: 'Florianópolis, SC',
    rating: 5,
    text: 'Levei a caixa de 50L pra praia e ficou perfeita! Qualidade sensacional, recomendo demais. Chegou antes do prazo.',
    product: 'Caixa Térmica 50L'
  },
  {
    name: 'Ana Paula Ferreira',
    location: 'Curitiba, PR',
    rating: 5,
    text: 'Presente perfeito pro meu marido! O kit churrasco Gold é lindo demais, a gravação ficou impecável. Nota fiscal chegou no WhatsApp.',
    product: 'Kit Churrasco Gold'
  },
  // Região Sudeste
  {
    name: 'Carlos Eduardo Silva',
    location: 'São Paulo, SP',
    rating: 5,
    text: 'Já é minha terceira compra. A qualidade é incomparável! Aproveitei o desconto de 20% comprando 3 caixas térmicas pro negócio.',
    product: 'Caixas Térmicas'
  },
  {
    name: 'Juliana Mendes',
    location: 'Rio de Janeiro, RJ',
    rating: 5,
    text: 'As facas são obras de arte! Personalizei com meu nome e ficou maravilhoso. Uso todos os dias nos churrascos da família.',
    product: 'Faca Personalizada'
  },
  {
    name: 'Roberto Almeida',
    location: 'Belo Horizonte, MG',
    rating: 5,
    text: 'Caixa térmica de 115L é um monstro! Perfeita pro meu açougue. Mantém a temperatura certinho. Muito satisfeito com a compra.',
    product: 'Caixa Térmica 115L'
  },
  {
    name: 'Marcos Oliveira',
    location: 'Vitória, ES',
    rating: 5,
    text: 'O avental de couro é sensacional, qualidade premium. Minha esposa amou o presente! Atendimento nota 10.',
    product: 'Avental Couro'
  },
  // Região Centro-Oeste
  {
    name: 'Lucas Pereira',
    location: 'Brasília, DF',
    rating: 5,
    text: 'Entrega rápida mesmo pra cá! A caixa térmica é robusta e bonita. Valeu cada centavo investido.',
    product: 'Caixa Térmica 75L'
  },
  {
    name: 'Amanda Costa',
    location: 'Goiânia, GO',
    rating: 5,
    text: 'Kit petisco elegance é perfeito pras reuniões em casa! Todo mundo elogia. Qualidade excelente.',
    product: 'Kit Petisco Elegance'
  },
  {
    name: 'Thiago Santos',
    location: 'Campo Grande, MS',
    rating: 5,
    text: 'Comprei 2 caixas térmicas grandes pro rancho. Aguentam o calor do pantanal tranquilo! Muito boas.',
    product: 'Caixa Térmica 250L'
  },
  // Região Nordeste
  {
    name: 'Maria Clara Ribeiro',
    location: 'Salvador, BA',
    rating: 5,
    text: 'Mesmo com o calor daqui, a caixa térmica aguenta firme! Uso pra vender água na praia. Melhor investimento.',
    product: 'Caixa Térmica 180L'
  },
  {
    name: 'Pedro Henrique Lima',
    location: 'Recife, PE',
    rating: 5,
    text: 'O abridor de garrafa bala .50 é o sucesso do churrasco! Todo mundo quer saber onde comprei.',
    product: 'Abridor Bala .50'
  },
  {
    name: 'Camila Rodrigues',
    location: 'Fortaleza, CE',
    rating: 5,
    text: 'Faca personalizada com meu nome ficou linda demais! Qualidade profissional, corta que é uma beleza.',
    product: 'Faca Personalizada'
  },
  {
    name: 'Bruno Nascimento',
    location: 'Natal, RN',
    rating: 5,
    text: 'A caixa de 40L é perfeita pro dia a dia. Compacta mas guarda bastante. Super recomendo!',
    product: 'Caixa Térmica 40L'
  },
  // Região Norte
  {
    name: 'Rafael Barbosa',
    location: 'Manaus, AM',
    rating: 5,
    text: 'Chegou perfeito mesmo vindo de longe! A caixa térmica é essencial aqui no Norte. Qualidade top.',
    product: 'Caixa Térmica 90L'
  },
  {
    name: 'Gabriela Moreira',
    location: 'Belém, PA',
    rating: 5,
    text: 'Kit churrasco Gold é presente de luxo! Meu pai amou no aniversário. Embalagem impecável.',
    product: 'Kit Churrasco Gold'
  },
  {
    name: 'Diego Cardoso',
    location: 'Porto Velho, RO',
    rating: 5,
    text: 'Comprei a maior caixa térmica e não me arrependo! Uso pra pescar, mantém tudo gelado por dias.',
    product: 'Caixa Térmica 500L'
  }
]

const Checkout = ({ isOpen, onClose, product, quantity = 1, onSuccess }) => {
  const { user, isAuthenticated, addOrder } = useAuth()
  const [step, setStep] = useState('form') // form, processing, pix, success, error
  const [docType, setDocType] = useState('cpf') // cpf ou cnpj
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    street: '',
    streetNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  })
  const [errors, setErrors] = useState({})
  const [transaction, setTransaction] = useState(null)
  const [copied, setCopied] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [orderSaved, setOrderSaved] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('form')
      setTransaction(null)
      setCopied(false)
      setErrorMessage('')
      setOrderSaved(false)
      setTestimonialIndex(Math.floor(Math.random() * TESTIMONIALS.length))
      
      // Preencher dados do usuário logado
      if (isAuthenticated && user) {
        setDocType(user.documentType || 'cpf')
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          document: user.document || '',
          street: user.address?.street || '',
          streetNumber: user.address?.streetNumber || '',
          complement: user.address?.complement || '',
          neighborhood: user.address?.neighborhood || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        })
      } else {
        setDocType('cpf')
        setFormData({
          name: '',
          email: '',
          phone: '',
          document: '',
          street: '',
          streetNumber: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        })
      }
    }
  }, [isOpen, isAuthenticated, user])

  // Rotação automática dos depoimentos
  useEffect(() => {
    if (isOpen && step === 'form') {
      const interval = setInterval(() => {
        setTestimonialIndex(prev => (prev + 1) % TESTIMONIALS.length)
      }, 5000) // Muda a cada 5 segundos
      return () => clearInterval(interval)
    }
  }, [isOpen, step])

  // Buscar endereço pelo CEP
  const handleCEPChange = useCallback(async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '')
    setFormData(prev => ({ ...prev, zipCode: cleanCEP }))
    
    if (cleanCEP.length === 8) {
      setLoadingCEP(true)
      const address = await fetchAddressByCEP(cleanCEP)
      setLoadingCEP(false)
      
      if (address) {
        setFormData(prev => ({
          ...prev,
          street: address.street,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          complement: address.complement || prev.complement
        }))
        setErrors(prev => ({
          ...prev,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        }))
      }
    }
  }, [])

  // Polling para verificar status do pagamento
  useEffect(() => {
    let interval
    if (step === 'pix' && transaction?.transactionId) {
      interval = setInterval(async () => {
        try {
          setCheckingPayment(true)
          const updatedTransaction = await getTransaction(transaction.transactionId)
          if (updatedTransaction.status === 'paid' || updatedTransaction.status === 'approved') {
            // Salvar pedido no sistema
            if (!orderSaved) {
              try {
                const discount = quantity >= 3 ? (product.price * quantity * 0.20) : 0
                addOrder({
                  customerEmail: formData.email,
                  customerName: formData.name,
                  customerPhone: formData.phone,
                  customerDocument: formData.document,
                  items: [{
                    id: product.id,
                    name: product.title || product.name,
                    price: product.price,
                    quantity: quantity,
                    image: product.image
                  }],
                  subtotal: product.price * quantity,
                  discount: discount,
                  total: (product.price * quantity) - discount,
                  paymentStatus: 'paid',
                  paymentMethod: 'pix',
                  transactionId: transaction.transactionId,
                  shippingAddress: {
                    street: formData.street,
                    streetNumber: formData.streetNumber,
                    complement: formData.complement,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode
                  }
                })
                setOrderSaved(true)
              } catch (err) {
                console.error('Erro ao salvar pedido:', err)
              }
            }
            setStep('success')
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error)
        } finally {
          setCheckingPayment(false)
        }
      }, 5000) // Verifica a cada 5 segundos
    }
    return () => clearInterval(interval)
  }, [step, transaction, orderSaved, addOrder, formData, product, quantity])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido'
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    else if (formData.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Telefone inválido'
    
    // Validação CPF/CNPJ
    if (!formData.document.trim()) {
      newErrors.document = docType === 'cpf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório'
    } else {
      const cleanDoc = formData.document.replace(/\D/g, '')
      if (docType === 'cpf') {
        if (!validateCPF(cleanDoc)) newErrors.document = 'CPF inválido'
      } else {
        if (!validateCNPJ(cleanDoc)) newErrors.document = 'CNPJ inválido'
      }
    }
    
    if (!formData.street.trim()) newErrors.street = 'Endereço é obrigatório'
    if (!formData.streetNumber.trim()) newErrors.streetNumber = 'Número é obrigatório'
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório'
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória'
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório'
    if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório'
    else if (!/^\d{8}$/.test(formData.zipCode.replace(/\D/g, ''))) newErrors.zipCode = 'CEP inválido'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const formatDocument = (value) => {
    const clean = value.replace(/\D/g, '')
    if (docType === 'cpf') {
      return clean.slice(0, 11)
    }
    return clean.slice(0, 14)
  }

  const formatPhone = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 11)
    // Formata (XX) XXXXX-XXXX
    if (clean.length >= 7) {
      return `(${clean.slice(0,2)}) ${clean.slice(2,7)}-${clean.slice(7)}`
    } else if (clean.length >= 2) {
      return `(${clean.slice(0,2)}) ${clean.slice(2)}`
    }
    return clean
  }

  const formatCEPDisplay = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 8)
    if (clean.length > 5) {
      return `${clean.slice(0,5)}-${clean.slice(5)}`
    }
    return clean
  }

  const formatDocumentDisplay = (value) => {
    const clean = value.replace(/\D/g, '')
    if (docType === 'cpf' && clean.length === 11) {
      return `${clean.slice(0,3)}.${clean.slice(3,6)}.${clean.slice(6,9)}-${clean.slice(9)}`
    }
    if (docType === 'cnpj' && clean.length === 14) {
      return `${clean.slice(0,2)}.${clean.slice(2,5)}.${clean.slice(5,8)}/${clean.slice(8,12)}-${clean.slice(12)}`
    }
    return clean
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setStep('processing')
    setErrorMessage('')

    try {
      // Calcular valor total
      const amount = product?.total || (product?.price * quantity)
      const isCartCheckout = product?.items && product.items.length > 0

      // Preparar items
      const items = isCartCheckout 
        ? product.items.map(item => ({
            title: item.name,
            unitPrice: item.price,
            quantity: item.quantity
          }))
        : [{
            title: product.name,
            unitPrice: product.price,
            quantity: quantity
          }]

      const transactionData = {
        amount,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          document: formData.document.replace(/\D/g, '')
        },
        items
      }

      const response = await createPixTransaction(transactionData)
      setTransaction(response)
      setStep('pix')
    } catch (error) {
      console.error('Erro ao criar transação:', error)
      setErrorMessage(error.message || 'Erro ao processar pagamento. Tente novamente.')
      setStep('error')
    }
  }

  const copyPixCode = () => {
    const code = transaction?.pix?.copyPaste || transaction?.pix?.qrCode || ''
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  const handleRetry = () => {
    setStep('form')
    setErrorMessage('')
  }

  if (!isOpen) return null

  const totalAmount = product?.total || (product?.price * quantity) || 0
  const isCartCheckout = product?.items && product.items.length > 0

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={e => e.stopPropagation()}>
        <button className="checkout-close" onClick={onClose}>
          <X size={24} />
        </button>

        {/* Header com selos de confiança */}
        <div className="checkout-header">
          <img src="/images/logo/logo.png" alt="Doma Crioula" className="checkout-logo" />
          <h2>Checkout Seguro</h2>
          <div className="checkout-trust-badges">
            <span className="trust-badge"><Shield size={14} /> SSL 256-bit</span>
            <span className="trust-badge"><Check size={14} /> Compra Segura</span>
          </div>
        </div>

        {/* Selo de entrega Correios */}
        <div className="checkout-delivery-badge">
          <img src="/images/logo/logoCorreios.png" alt="Correios" className="correios-logo" />
          <div className="delivery-info">
            <strong><Truck size={16} /> Entrega Garantida</strong>
            <span>Enviamos para todo Brasil via Correios com rastreamento</span>
          </div>
        </div>

        {/* Cart Summary - quando é checkout do carrinho */}
        {isCartCheckout ? (
          <div className="checkout-cart-summary">
            <h3><Package size={18} /> Itens do Pedido</h3>
            <div className="checkout-cart-items">
              {product.items.map((item, index) => (
                <div key={index} className="checkout-cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="checkout-cart-item__info">
                    <span className="checkout-cart-item__name">{item.name}</span>
                    <span className="checkout-cart-item__qty">{item.quantity}x {formatCurrency(item.price)}</span>
                  </div>
                  <span className="checkout-cart-item__total">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            {product.hasDiscount && (
              <div className="checkout-cart-discount">
                <Tag size={16} />
                <span>Desconto 20% (3+ caixas):</span>
                <strong>-{formatCurrency(product.discountAmount)}</strong>
              </div>
            )}
            <div className="checkout-cart-total">
              <span>Total:</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>
        ) : (
          /* Product Summary - produto único */
          product && (
            <div className="checkout-product">
              <div className="checkout-product__image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="checkout-product__info">
                <h3>{product.name}</h3>
                <p className="checkout-product__quantity">Quantidade: {quantity}</p>
                <p className="checkout-product__price">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          )
        )}

        {/* Step: Form */}
        {step === 'form' && (
          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* Info Nota Fiscal */}
            <div className="checkout-nf-info">
              <Receipt size={18} />
              <div>
                <strong>Nota Fiscal Automática</strong>
                <span>Enviada via WhatsApp e E-mail após confirmação</span>
              </div>
            </div>

            <h3>Dados do Comprador</h3>
            
            <div className="checkout-form__row">
              <div className={`checkout-form__field ${errors.name ? 'error' : ''}`}>
                <label><User size={16} /> Nome Completo / Razão Social</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo ou razão social"
                />
                {errors.name && <span className="checkout-form__error">{errors.name}</span>}
              </div>
            </div>

            <div className="checkout-form__row checkout-form__row--2col">
              <div className={`checkout-form__field ${errors.email ? 'error' : ''}`}>
                <label><Mail size={16} /> E-mail</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                />
                {errors.email && <span className="checkout-form__error">{errors.email}</span>}
              </div>
              <div className={`checkout-form__field ${errors.phone ? 'error' : ''}`}>
                <label><Phone size={16} /> WhatsApp</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={e => handleInputChange({ target: { name: 'phone', value: formatPhone(e.target.value) } })}
                  placeholder="(51) 99999-9999"
                />
                {errors.phone && <span className="checkout-form__error">{errors.phone}</span>}
              </div>
            </div>

            {/* CPF/CNPJ Toggle */}
            <div className="checkout-form__row">
              <div className={`checkout-form__field ${errors.document ? 'error' : ''}`}>
                <label>
                  {docType === 'cpf' ? <FileText size={16} /> : <Building2 size={16} />}
                  {docType === 'cpf' ? ' CPF' : ' CNPJ'}
                </label>
                <div className="checkout-doc-toggle">
                  <button 
                    type="button" 
                    className={docType === 'cpf' ? 'active' : ''} 
                    onClick={() => { setDocType('cpf'); setFormData(prev => ({ ...prev, document: '' })) }}
                  >
                    Pessoa Física
                  </button>
                  <button 
                    type="button" 
                    className={docType === 'cnpj' ? 'active' : ''} 
                    onClick={() => { setDocType('cnpj'); setFormData(prev => ({ ...prev, document: '' })) }}
                  >
                    Pessoa Jurídica
                  </button>
                </div>
                <input
                  type="text"
                  name="document"
                  value={formatDocumentDisplay(formData.document)}
                  onChange={e => handleInputChange({ target: { name: 'document', value: formatDocument(e.target.value) } })}
                  placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                />
                {errors.document && <span className="checkout-form__error">{errors.document}</span>}
              </div>
            </div>

            <h3><Truck size={18} /> Endereço de Entrega</h3>

            {/* CEP primeiro para buscar endereço */}
            <div className="checkout-form__row">
              <div className={`checkout-form__field checkout-form__field--cep ${errors.zipCode ? 'error' : ''}`}>
                <label><MapPin size={16} /> CEP</label>
                <div className="checkout-cep-input">
                  <input
                    type="text"
                    name="zipCode"
                    value={formatCEPDisplay(formData.zipCode)}
                    onChange={e => handleCEPChange(e.target.value)}
                    placeholder="00000-000"
                  />
                  {loadingCEP && <Loader2 size={18} className="cep-loading" />}
                </div>
                {errors.zipCode && <span className="checkout-form__error">{errors.zipCode}</span>}
                <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="cep-link">
                  Não sei meu CEP
                </a>
              </div>
            </div>

            <div className="checkout-form__row checkout-form__row--2col">
              <div className={`checkout-form__field checkout-form__field--large ${errors.street ? 'error' : ''}`}>
                <label>Rua / Avenida</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Nome da rua"
                />
                {errors.street && <span className="checkout-form__error">{errors.street}</span>}
              </div>
              <div className={`checkout-form__field checkout-form__field--small ${errors.streetNumber ? 'error' : ''}`}>
                <label>Número</label>
                <input
                  type="text"
                  name="streetNumber"
                  value={formData.streetNumber}
                  onChange={handleInputChange}
                  placeholder="Nº"
                />
                {errors.streetNumber && <span className="checkout-form__error">{errors.streetNumber}</span>}
              </div>
            </div>

            <div className="checkout-form__row checkout-form__row--2col">
              <div className="checkout-form__field">
                <label>Complemento</label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  placeholder="Apto, Bloco, etc."
                />
              </div>
              <div className={`checkout-form__field ${errors.neighborhood ? 'error' : ''}`}>
                <label>Bairro</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Bairro"
                />
                {errors.neighborhood && <span className="checkout-form__error">{errors.neighborhood}</span>}
              </div>
            </div>

            <div className="checkout-form__row checkout-form__row--3col">
              <div className={`checkout-form__field ${errors.city ? 'error' : ''}`}>
                <label>Cidade</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Cidade"
                />
                {errors.city && <span className="checkout-form__error">{errors.city}</span>}
              </div>
              <div className={`checkout-form__field ${errors.state ? 'error' : ''}`}>
                <label>Estado</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="">UF</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
                {errors.state && <span className="checkout-form__error">{errors.state}</span>}
              </div>
            </div>

            {/* Depoimento de cliente - rotação automática */}
            <div className="checkout-testimonial" key={testimonialIndex}>
              <div className="testimonial-stars">
                {[...Array(TESTIMONIALS[testimonialIndex].rating)].map((_, i) => <Star key={i} size={14} fill="#FFD700" color="#FFD700" />)}
              </div>
              <p>"{TESTIMONIALS[testimonialIndex].text}"</p>
              <span>— {TESTIMONIALS[testimonialIndex].name}, {TESTIMONIALS[testimonialIndex].location}</span>
            </div>

            <div className="checkout-form__total">
              <span>Total a pagar:</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button type="submit" className="checkout-form__submit">
              <Shield size={20} />
              Pagar com PIX
            </button>

            {/* Selos de segurança */}
            <div className="checkout-security-badges">
              <div className="security-badge">
                <Shield size={16} />
                <span>Pagamento 100% Seguro</span>
              </div>
              <div className="security-badge">
                <MessageCircle size={16} />
                <span>Suporte via WhatsApp</span>
              </div>
            </div>
          </form>
        )}

        {/* Step: Processing */}
        {step === 'processing' && (
          <div className="checkout-processing">
            <Loader2 size={48} className="checkout-processing__spinner" />
            <p>Gerando seu pagamento PIX...</p>
            <span>Aguarde um momento</span>
          </div>
        )}

        {/* Step: PIX */}
        {step === 'pix' && transaction && (
          <div className="checkout-pix">
            <div className="checkout-pix__header">
              <h3><Check size={20} /> PIX Gerado com Sucesso!</h3>
            </div>

            <div className="checkout-pix__qrcode">
              <QRCodeSVG 
                value={transaction.pix?.copyPaste || transaction.pix?.qrCode || ''} 
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="checkout-pix__info">
              <p>Escaneie o QR Code com o app do seu banco ou copie o código PIX abaixo</p>
            </div>

            <div className="checkout-pix__code">
              <input 
                type="text" 
                value={transaction.pix?.copyPaste || transaction.pix?.qrCode || ''} 
                readOnly 
              />
              <button onClick={copyPixCode} className={copied ? 'copied' : ''}>
                {copied ? <Check size={20} /> : <Copy size={20} />}
                {copied ? 'Copiado!' : 'Copiar Código'}
              </button>
            </div>

            <div className="checkout-pix__value">
              <span>Valor a pagar:</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            {transaction.pix?.expiresAt && (
              <p className="checkout-pix__expiration">
                ⏱️ Válido até: {new Date(transaction.pix.expiresAt).toLocaleString('pt-BR')}
              </p>
            )}

            <div className="checkout-pix__status">
              {checkingPayment ? (
                <span className="checking">
                  <Loader2 size={16} className="checkout-processing__spinner" />
                  Verificando pagamento...
                </span>
              ) : (
                <span className="waiting">
                  <Loader2 size={16} className="checkout-processing__spinner" />
                  Aguardando confirmação do pagamento...
                </span>
              )}
            </div>

            <div className="checkout-pix__tips">
              <p>💡 Após o pagamento, a confirmação é automática (pode levar alguns segundos)</p>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="checkout-success">
            <div className="checkout-success__icon">
              <Check size={64} />
            </div>
            <h3>🎉 Pagamento Confirmado!</h3>
            <p>Seu pedido foi processado com sucesso.</p>
            
            <div className="checkout-success__nf-info">
              <div className="nf-item">
                <Mail size={20} />
                <span>Nota Fiscal enviada para seu e-mail</span>
              </div>
              <div className="nf-item">
                <MessageCircle size={20} />
                <span>Nota Fiscal enviada para seu WhatsApp</span>
              </div>
              <div className="nf-item">
                <Truck size={20} />
                <span>Código de rastreio em até 24h úteis</span>
              </div>
            </div>

            <button onClick={() => { onSuccess?.(); onClose(); }} className="checkout-success__btn">
              Concluir
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="checkout-error">
            <div className="checkout-error__icon">
              <AlertCircle size={48} />
            </div>
            <h3>Erro no Pagamento</h3>
            <p>{errorMessage}</p>
            <button onClick={handleRetry} className="checkout-error__btn">
              <RefreshCw size={20} />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="checkout-footer">
          <div className="checkout-footer__contact">
            <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" className="checkout-footer__icon" />
            <span>Dúvidas? <strong>(51) 99813-7009</strong></span>
          </div>
          <div className="checkout-footer__badges">
            <span className="footer-badge"><Shield size={12} /> Compra Segura</span>
            <span className="footer-badge"><Truck size={12} /> Enviamos para todo Brasil</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
