import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Key, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import './Login.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const ForgotPassword = () => {
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1) // 1: email, 2: código, 3: nova senha
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
        setSuccess('Se o email existir, você receberá um código de recuperação.')
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
      <div className="login-page">
        <div className="login-container">
          <div className="login-box">
            <div className="login-header">
              <h1>Senha Alterada!</h1>
              <p>Sua senha foi redefinida com sucesso</p>
            </div>
            
            <div className="success-message" style={{ marginBottom: '24px' }}>
              <CheckCircle size={20} />
              <span>Você já pode fazer login com sua nova senha.</span>
            </div>
            
            <button 
              className="login-submit"
              onClick={() => navigate('/login')}
            >
              Ir para Login
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>Recuperar Senha</h1>
            <p>
              {step === 1 
                ? 'Digite seu e-mail para receber o código'
                : 'Digite o código recebido e sua nova senha'}
            </p>
          </div>
          
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          {success && step === 2 && (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}
          
          {step === 1 ? (
            <form onSubmit={handleSendCode} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={20} />
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
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={20} />
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
            <form onSubmit={handleResetPassword} className="login-form">
              <div className="form-group">
                <label htmlFor="code">Código de Verificação</label>
                <div className="input-wrapper">
                  <Key className="input-icon" size={20} />
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
                    style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
                  />
                </div>
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Verifique sua caixa de entrada e spam
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
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
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={20} />
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
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spin" size={20} />
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
                className="login-submit"
                style={{ background: 'transparent', color: '#c45a3d', border: '1px solid #c45a3d', marginTop: '12px' }}
                onClick={() => {
                  setStep(1)
                  setError('')
                  setSuccess('')
                }}
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
            </form>
          )}
          
          <div className="login-footer">
            <p>
              Lembrou a senha?{' '}
              <Link to="/login">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
