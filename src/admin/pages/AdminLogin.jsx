import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import './AdminLogin.css'

// Constantes de segurança
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutos em ms
const LOCKOUT_STORAGE_KEY = 'admin_login_lockout'

const AdminLogin = () => {
  const { loginAdmin, isAuthenticated, loading } = useAdmin()
  const navigate = useNavigate()
  const attemptCountRef = useRef(0)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutTime, setLockoutTime] = useState(0)

  // Verificar lockout no carregamento
  useEffect(() => {
    const checkLockout = () => {
      const lockoutData = localStorage.getItem(LOCKOUT_STORAGE_KEY)
      if (lockoutData) {
        const { until, attempts } = JSON.parse(lockoutData)
        attemptCountRef.current = attempts || 0
        if (until && Date.now() < until) {
          setIsLocked(true)
          setLockoutTime(Math.ceil((until - Date.now()) / 1000))
        } else if (until && Date.now() >= until) {
          // Lockout expirou, resetar
          localStorage.removeItem(LOCKOUT_STORAGE_KEY)
          attemptCountRef.current = 0
        }
      }
    }
    checkLockout()
  }, [])

  // Contador regressivo do lockout
  useEffect(() => {
    if (isLocked && lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false)
            localStorage.removeItem(LOCKOUT_STORAGE_KEY)
            attemptCountRef.current = 0
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isLocked, lockoutTime])

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin')
    }
  }, [isAuthenticated, loading, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Verificar se está bloqueado
    if (isLocked) {
      setError(`Muitas tentativas. Aguarde ${lockoutTime} segundos.`)
      return
    }
    
    setError('')
    setSubmitting(true)

    // Validação básica de segurança
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('E-mail inválido')
      setSubmitting(false)
      return
    }

    // Sanitização básica (prevenir injection)
    const sanitizedEmail = formData.email.trim().toLowerCase()
    const sanitizedPassword = formData.password

    try {
      await loginAdmin(sanitizedEmail, sanitizedPassword)
      // Limpar tentativas após login bem-sucedido
      localStorage.removeItem(LOCKOUT_STORAGE_KEY)
      attemptCountRef.current = 0
      // Limpar dados sensíveis da memória
      setFormData({ email: '', password: '' })
      navigate('/admin')
    } catch (err) {
      // Incrementar tentativas
      attemptCountRef.current += 1
      
      if (attemptCountRef.current >= MAX_LOGIN_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION
        localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ 
          until, 
          attempts: attemptCountRef.current 
        }))
        setIsLocked(true)
        setLockoutTime(Math.ceil(LOCKOUT_DURATION / 1000))
        setError(`Conta bloqueada temporariamente. Aguarde 5 minutos.`)
      } else {
        const remaining = MAX_LOGIN_ATTEMPTS - attemptCountRef.current
        localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify({ 
          attempts: attemptCountRef.current 
        }))
        setError(`Credenciais inválidas. ${remaining} tentativa(s) restante(s).`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-login-page">
        <div className="login-loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="branding-content">
            <div className="logo">
              <span className="logo-icon">DC</span>
              <span className="logo-text">Admin</span>
            </div>
            <h1>Painel Administrativo</h1>
            <p>Gerencie sua loja de forma simples e eficiente</p>
            
            <div className="features">
              <div className="feature">
                <span className="check-icon">✓</span>
                <span>Gestão completa de pedidos</span>
              </div>
              <div className="feature">
                <span className="check-icon">✓</span>
                <span>Controle de estoque e produtos</span>
              </div>
              <div className="feature">
                <span className="check-icon">✓</span>
                <span>Relatórios e análises</span>
              </div>
              <div className="feature">
                <span className="check-icon">✓</span>
                <span>Gestão de clientes</span>
              </div>
            </div>
          </div>
          
          <div className="branding-footer">
            <span>© 2026 Doma Crioula. Todos os direitos reservados.</span>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2>Entrar</h2>
              <p>Acesse o painel administrativo</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <div className="input-wrapper">
                  {!formData.email && <span className="input-icon">✉</span>}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    disabled={isLocked}
                    className={formData.email ? 'has-value' : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <div className="input-wrapper">
                  {!formData.password && <span className="input-icon">🔒</span>}
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    disabled={isLocked}
                    className={formData.password ? 'has-value' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    disabled={isLocked}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={submitting || isLocked}>
                {isLocked ? (
                  <>
                    🔒 Bloqueado ({lockoutTime}s)
                  </>
                ) : submitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <a href="/">
                <span>←</span> Voltar para a loja
              </a>
            </div>

            {/* Indicador de segurança */}
            <div className="security-badge">
              <span className="lock-icon">🔐</span>
              <span>Conexão segura • Dados criptografados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
