import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Key, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, KeyRound } from 'lucide-react'
import './ForgotPassword.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const ForgotPassword = () => {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: email, 2: código, 3: sucesso
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  // Step 1: Enviar código por email
  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email.trim()) {
      setError('Digite seu e-mail')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Código enviado! Verifique seu email.')
        setStep(2)
      } else {
        setError(data.error || 'Erro ao enviar código')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verificar código e definir nova senha
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.code.trim()) {
      setError('Digite o código recebido')
      return
    }
    
    if (formData.code.length !== 6) {
      setError('O código deve ter 6 dígitos')
      return
    }
    
    if (!formData.newPassword) {
      setError('Digite a nova senha')
      return
    }
    
    if (formData.newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          code: formData.code.trim(),
          newPassword: formData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setStep(3)
      } else {
        setError(data.error || 'Erro ao redefinir senha')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Sucesso
  if (step === 3) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          {/* Branding Side */}
          <div className="forgot-password-branding">
            <div className="forgot-password-branding-content">
              <h1>Doma Crioula</h1>
              <p className="tagline">Tradição em Churrasco</p>
              
              <div className="forgot-password-steps">
                <div className="forgot-password-step completed">
                  <span className="forgot-password-step-number">
                    <CheckCircle size={16} />
                  </span>
                  <span>Informar email</span>
                </div>
                <div className="forgot-password-step completed">
                  <span className="forgot-password-step-number">
                    <CheckCircle size={16} />
                  </span>
                  <span>Confirmar código</span>
                </div>
                <div className="forgot-password-step completed">
                  <span className="forgot-password-step-number">
                    <CheckCircle size={16} />
                  </span>
                  <span>Nova senha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="forgot-password-form-container">
            <div className="forgot-password-form-wrapper">
              <div className="forgot-password-success">
                <div className="forgot-password-success-icon">
                  <CheckCircle size={40} />
                </div>
                <h2>Senha Alterada!</h2>
                <p>Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.</p>
                
                <button 
                  className="forgot-password-submit"
                  onClick={() => navigate('/login')}
                >
                  Ir para Login
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Branding Side */}
        <div className="forgot-password-branding">
          <div className="forgot-password-branding-content">
            <h1>Doma Crioula</h1>
            <p className="tagline">Tradição em Churrasco</p>
            
            <div className="forgot-password-steps">
              <div className={`forgot-password-step ${step >= 1 ? (step > 1 ? 'completed' : 'active') : ''}`}>
                <span className="forgot-password-step-number">
                  {step > 1 ? <CheckCircle size={16} /> : '1'}
                </span>
                <span>Informar email</span>
              </div>
              <div className={`forgot-password-step ${step >= 2 ? (step > 2 ? 'completed' : 'active') : ''}`}>
                <span className="forgot-password-step-number">
                  {step > 2 ? <CheckCircle size={16} /> : '2'}
                </span>
                <span>Confirmar código</span>
              </div>
              <div className={`forgot-password-step ${step >= 3 ? 'completed' : ''}`}>
                <span className="forgot-password-step-number">3</span>
                <span>Nova senha</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="forgot-password-form-container">
          <div className="forgot-password-form-wrapper">
            <div className="forgot-password-form-header">
              <div className="forgot-password-icon">
                <KeyRound size={28} />
              </div>
              <h2>Recuperar Senha</h2>
              <p>
                {step === 1 
                  ? 'Digite seu e-mail para receber o código'
                  : 'Digite o código e sua nova senha'}
              </p>
            </div>
            
            {error && (
              <div className="forgot-password-alert forgot-password-alert--error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}
            
            {success && step === 2 && (
              <div className="forgot-password-alert forgot-password-alert--success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}
            
            {step === 1 ? (
              <form onSubmit={handleSendCode} className="forgot-password-form">
                <div className="forgot-password-field">
                  <label htmlFor="email">E-mail</label>
                  <div className="forgot-password-input-wrapper">
                    <Mail className="forgot-password-input-icon" size={18} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="forgot-password-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="forgot-password-submit-loading" size={20} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Código
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="forgot-password-form">
                <div className="forgot-password-field">
                  <label htmlFor="code">Código de Verificação</label>
                  <div className="forgot-password-input-wrapper">
                    <Key className="forgot-password-input-icon" size={18} />
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="000000"
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                      className="forgot-password-code-input"
                    />
                  </div>
                  <span className="forgot-password-hint">
                    Verifique sua caixa de entrada e spam
                  </span>
                </div>
                
                <div className="forgot-password-field">
                  <label htmlFor="newPassword">Nova Senha</label>
                  <div className="forgot-password-input-wrapper">
                    <Lock className="forgot-password-input-icon" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="forgot-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="forgot-password-field">
                  <label htmlFor="confirmPassword">Confirmar Senha</label>
                  <div className="forgot-password-input-wrapper">
                    <Lock className="forgot-password-input-icon" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Digite novamente"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="forgot-password-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="forgot-password-submit-loading" size={20} />
                      Redefinindo...
                    </>
                  ) : (
                    <>
                      Redefinir Senha
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
                
                <button 
                  type="button"
                  className="forgot-password-back"
                  onClick={() => {
                    setStep(1)
                    setError('')
                    setSuccess('')
                  }}
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>
              </form>
            )}
            
            <div className="forgot-password-footer">
              <p>
                Lembrou a senha?{' '}
                <Link to="/login">Fazer login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
