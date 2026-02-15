import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Verificar se tem mensagem de sucesso do registro
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message)
      // Limpar o state
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/minha-conta'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, location.state])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Validações básicas
    if (!formData.email.trim()) {
      setError('Digite seu e-mail')
      return
    }
    
    if (!formData.password) {
      setError('Digite sua senha')
      return
    }
    
    setLoading(true)
    
    try {
      await login(formData.email, formData.password)
      const from = location.state?.from?.pathname || '/minha-conta'
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="login-page">
        <div className="login-loading">
          <Loader2 className="login-loading-icon" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Lado esquerdo - Branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <img 
              src="/images/logo/logo.png" 
              alt="Doma Crioula" 
              className="login-logo"
            />
            <h1>Bem-vindo de volta!</h1>
            <p>
              Acesse sua conta para acompanhar seus pedidos, 
              rastrear entregas e muito mais.
            </p>
            <div className="login-features">
              <div className="login-feature">
                <CheckCircle size={20} />
                <span>Acompanhe seus pedidos</span>
              </div>
              <div className="login-feature">
                <CheckCircle size={20} />
                <span>Rastreie suas entregas</span>
              </div>
              <div className="login-feature">
                <CheckCircle size={20} />
                <span>Checkout mais rápido</span>
              </div>
              <div className="login-feature">
                <CheckCircle size={20} />
                <span>Histórico de compras</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <div className="login-icon">
                <User size={28} />
              </div>
              <h2>Entrar na sua conta</h2>
              <p>Digite suas credenciais para continuar</p>
            </div>

            {error && (
              <div className="login-alert login-alert--error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="login-alert login-alert--success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="email">E-mail</label>
                <div className="login-input-wrapper">
                  <Mail size={18} className="login-input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">Senha</label>
                <div className="login-input-wrapper">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Sua senha"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="login-forgot-password">
                  <Link to="/esqueci-senha">Esqueci minha senha</Link>
                </div>
              </div>

              <button 
                type="submit" 
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="login-submit-loading" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="login-divider">
              <span>Não tem uma conta?</span>
            </div>

            <Link to="/cadastro" className="login-register-link">
              <User size={18} />
              <span>Criar conta grátis</span>
            </Link>

            <div className="login-footer">
              <Link to="/rastrear" className="login-track-link">
                Rastrear pedido sem conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
