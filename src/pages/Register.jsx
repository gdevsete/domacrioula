import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, User, Phone, FileText, MapPin, ArrowRight, ArrowLeft, CheckCircle, Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Register.css'

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

// Formatar telefone
const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

// Formatar CPF
const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
}

// Formatar CNPJ
const formatCNPJ = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
  if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
  if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
}

// Formatar CEP
const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 5) return numbers
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
}

const Register = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated, loading: authLoading } = useAuth()
  
  const [step, setStep] = useState(1) // 1: dados pessoais, 2: endereço
  const [docType, setDocType] = useState('cpf')
  const [loadingCEP, setLoadingCEP] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    zipCode: '',
    street: '',
    streetNumber: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/minha-conta', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Aplicar formatação
    if (name === 'phone') {
      formattedValue = formatPhone(value)
    } else if (name === 'document') {
      formattedValue = docType === 'cpf' ? formatCPF(value) : formatCNPJ(value)
    } else if (name === 'zipCode') {
      formattedValue = formatCEP(value)
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }))
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Buscar endereço pelo CEP
  const handleCEPBlur = useCallback(async () => {
    const cleanCEP = formData.zipCode.replace(/\D/g, '')
    
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
      } else {
        setErrors(prev => ({ ...prev, zipCode: 'CEP não encontrado' }))
      }
    }
  }, [formData.zipCode])

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite seu nome completo'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido'
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido'
    }
    
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
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.zipCode.trim()) newErrors.zipCode = 'CEP é obrigatório'
    else if (formData.zipCode.replace(/\D/g, '').length !== 8) newErrors.zipCode = 'CEP inválido'
    
    if (!formData.street.trim()) newErrors.street = 'Endereço é obrigatório'
    if (!formData.streetNumber.trim()) newErrors.streetNumber = 'Número é obrigatório'
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'Bairro é obrigatório'
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória'
    if (!formData.state.trim()) newErrors.state = 'Estado é obrigatório'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) return
    
    setLoading(true)
    
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        document: formData.document,
        documentType: docType,
        zipCode: formData.zipCode,
        street: formData.street,
        streetNumber: formData.streetNumber,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state
      })
      
      navigate('/minha-conta', { 
        state: { message: 'Conta criada com sucesso!' },
        replace: true 
      })
    } catch (err) {
      const errorMsg = err.message || 'Erro ao criar conta'
      
      // Verificar se é erro de CPF/email duplicado
      if (errorMsg.includes('CPF') || errorMsg.includes('CNPJ') || errorMsg.includes('documento')) {
        setErrors({ 
          general: errorMsg,
          type: 'DOCUMENT_EXISTS'
        })
      } else if (errorMsg.includes('Email') || errorMsg.includes('email')) {
        setErrors({ 
          general: errorMsg,
          type: 'EMAIL_EXISTS'
        })
        setStep(1)
      } else {
        setErrors({ general: errorMsg })
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="register-page">
        <div className="register-loading">
          <Loader2 className="register-loading-icon" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Lado esquerdo - Branding */}
        <div className="register-branding">
          <div className="register-branding-content">
            <img 
              src="/images/logo/logodoma.png" 
              alt="Doma Crioula" 
              className="register-logo"
            />
            <h1>Crie sua conta</h1>
            <p>
              Junte-se a milhares de clientes satisfeitos e aproveite 
              todos os benefícios de ser um cliente Doma Crioula.
            </p>
            <div className="register-features">
              <div className="register-feature">
                <CheckCircle size={20} />
                <span>Acompanhe seus pedidos em tempo real</span>
              </div>
              <div className="register-feature">
                <CheckCircle size={20} />
                <span>Checkout mais rápido e prático</span>
              </div>
              <div className="register-feature">
                <CheckCircle size={20} />
                <span>Histórico completo de compras</span>
              </div>
              <div className="register-feature">
                <CheckCircle size={20} />
                <span>Rastreamento de entregas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="register-form-container">
          <div className="register-form-wrapper">
            {/* Progress Steps */}
            <div className="register-steps">
              <div className={`register-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="register-step-number">
                  {step > 1 ? <CheckCircle size={16} /> : '1'}
                </div>
                <span>Dados Pessoais</span>
              </div>
              <div className="register-step-line"></div>
              <div className={`register-step ${step >= 2 ? 'active' : ''}`}>
                <div className="register-step-number">2</div>
                <span>Endereço</span>
              </div>
            </div>

            {errors.general && (
              <div className="register-alert register-alert--error">
                <AlertCircle size={18} />
                <div className="register-alert-content">
                  <span>{errors.general}</span>
                  {(errors.type === 'DOCUMENT_EXISTS' || errors.type === 'EMAIL_EXISTS') && (
                    <div className="register-alert-actions">
                      <Link to="/entrar" className="register-alert-link">
                        Fazer Login
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              {/* Step 1: Dados Pessoais */}
              {step === 1 && (
                <div className="register-step-content">
                  <h2>Informações Pessoais</h2>
                  
                  <div className="register-field">
                    <label htmlFor="name">Nome Completo</label>
                    <div className="register-input-wrapper">
                      <User size={18} className="register-input-icon" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        autoComplete="name"
                        className={errors.name ? 'error' : ''}
                      />
                    </div>
                    {errors.name && <span className="register-error">{errors.name}</span>}
                  </div>

                  <div className="register-field">
                    <label htmlFor="email">E-mail</label>
                    <div className="register-input-wrapper">
                      <Mail size={18} className="register-input-icon" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        autoComplete="email"
                        className={errors.email ? 'error' : ''}
                      />
                    </div>
                    {errors.email && <span className="register-error">{errors.email}</span>}
                  </div>

                  <div className="register-row">
                    <div className="register-field">
                      <label htmlFor="password">Senha</label>
                      <div className="register-input-wrapper">
                        <Lock size={18} className="register-input-icon" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Mínimo 6 caracteres"
                          autoComplete="new-password"
                          className={errors.password ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="register-password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <span className="register-error">{errors.password}</span>}
                    </div>

                    <div className="register-field">
                      <label htmlFor="confirmPassword">Confirmar Senha</label>
                      <div className="register-input-wrapper">
                        <Lock size={18} className="register-input-icon" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repita a senha"
                          autoComplete="new-password"
                          className={errors.confirmPassword ? 'error' : ''}
                        />
                        <button
                          type="button"
                          className="register-password-toggle"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <span className="register-error">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="register-field">
                    <label htmlFor="phone">Telefone / WhatsApp</label>
                    <div className="register-input-wrapper">
                      <Phone size={18} className="register-input-icon" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        autoComplete="tel"
                        className={errors.phone ? 'error' : ''}
                      />
                    </div>
                    {errors.phone && <span className="register-error">{errors.phone}</span>}
                  </div>

                  <div className="register-field">
                    <label>Tipo de Documento</label>
                    <div className="register-doc-toggle">
                      <button
                        type="button"
                        className={`register-doc-btn ${docType === 'cpf' ? 'active' : ''}`}
                        onClick={() => {
                          setDocType('cpf')
                          setFormData(prev => ({ ...prev, document: '' }))
                        }}
                      >
                        <User size={16} />
                        <span>Pessoa Física (CPF)</span>
                      </button>
                      <button
                        type="button"
                        className={`register-doc-btn ${docType === 'cnpj' ? 'active' : ''}`}
                        onClick={() => {
                          setDocType('cnpj')
                          setFormData(prev => ({ ...prev, document: '' }))
                        }}
                      >
                        <Building2 size={16} />
                        <span>Pessoa Jurídica (CNPJ)</span>
                      </button>
                    </div>
                  </div>

                  <div className="register-field">
                    <label htmlFor="document">{docType === 'cpf' ? 'CPF' : 'CNPJ'}</label>
                    <div className="register-input-wrapper">
                      <FileText size={18} className="register-input-icon" />
                      <input
                        type="text"
                        id="document"
                        name="document"
                        value={formData.document}
                        onChange={handleChange}
                        placeholder={docType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                        className={errors.document ? 'error' : ''}
                        maxLength={docType === 'cpf' ? 14 : 18}
                      />
                    </div>
                    {errors.document && <span className="register-error">{errors.document}</span>}
                  </div>

                  <button 
                    type="button" 
                    className="register-next-btn"
                    onClick={handleNextStep}
                  >
                    <span>Continuar</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {/* Step 2: Endereço */}
              {step === 2 && (
                <div className="register-step-content">
                  <button 
                    type="button" 
                    className="register-back-btn"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft size={18} />
                    <span>Voltar</span>
                  </button>

                  <h2>Endereço de Entrega</h2>
                  
                  <div className="register-field">
                    <label htmlFor="zipCode">CEP</label>
                    <div className="register-input-wrapper">
                      <MapPin size={18} className="register-input-icon" />
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        onBlur={handleCEPBlur}
                        placeholder="00000-000"
                        maxLength={9}
                        className={errors.zipCode ? 'error' : ''}
                      />
                      {loadingCEP && <Loader2 size={18} className="register-cep-loading" />}
                    </div>
                    {errors.zipCode && <span className="register-error">{errors.zipCode}</span>}
                    <a 
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="register-cep-link"
                    >
                      Não sei meu CEP
                    </a>
                  </div>

                  <div className="register-row">
                    <div className="register-field register-field--large">
                      <label htmlFor="street">Endereço</label>
                      <input
                        type="text"
                        id="street"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Rua, Avenida..."
                        className={errors.street ? 'error' : ''}
                      />
                      {errors.street && <span className="register-error">{errors.street}</span>}
                    </div>

                    <div className="register-field register-field--small">
                      <label htmlFor="streetNumber">Número</label>
                      <input
                        type="text"
                        id="streetNumber"
                        name="streetNumber"
                        value={formData.streetNumber}
                        onChange={handleChange}
                        placeholder="Nº"
                        className={errors.streetNumber ? 'error' : ''}
                      />
                      {errors.streetNumber && <span className="register-error">{errors.streetNumber}</span>}
                    </div>
                  </div>

                  <div className="register-row">
                    <div className="register-field">
                      <label htmlFor="complement">Complemento</label>
                      <input
                        type="text"
                        id="complement"
                        name="complement"
                        value={formData.complement}
                        onChange={handleChange}
                        placeholder="Apto, Bloco... (opcional)"
                      />
                    </div>

                    <div className="register-field">
                      <label htmlFor="neighborhood">Bairro</label>
                      <input
                        type="text"
                        id="neighborhood"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleChange}
                        placeholder="Seu bairro"
                        className={errors.neighborhood ? 'error' : ''}
                      />
                      {errors.neighborhood && <span className="register-error">{errors.neighborhood}</span>}
                    </div>
                  </div>

                  <div className="register-row">
                    <div className="register-field register-field--large">
                      <label htmlFor="city">Cidade</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                        className={errors.city ? 'error' : ''}
                      />
                      {errors.city && <span className="register-error">{errors.city}</span>}
                    </div>

                    <div className="register-field register-field--small">
                      <label htmlFor="state">Estado</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="UF"
                        maxLength={2}
                        className={errors.state ? 'error' : ''}
                      />
                      {errors.state && <span className="register-error">{errors.state}</span>}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="register-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="register-submit-loading" />
                        <span>Criando conta...</span>
                      </>
                    ) : (
                      <>
                        <span>Criar minha conta</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>

            <div className="register-footer">
              <span>Já tem uma conta?</span>
              <Link to="/login">Fazer login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
