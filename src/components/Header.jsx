import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, X, ChevronDown, ChevronRight,
  Home, Users, Package, Award, MessageCircle,
  Thermometer, Utensils, ChefHat,
  Instagram, Facebook, MapPin, Clock, User, LogIn, LogOut, Truck
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import './Header.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false)
  const [activeItemIndex, setActiveItemIndex] = useState(-1)
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      // Animate items in sequence
      const timer = setTimeout(() => setActiveItemIndex(0), 100)
      return () => clearTimeout(timer)
    } else {
      document.body.style.overflow = ''
      setActiveItemIndex(-1)
    }
  }, [isMenuOpen])

  // Animate menu items sequentially
  useEffect(() => {
    if (activeItemIndex >= 0 && activeItemIndex < 6) {
      const timer = setTimeout(() => setActiveItemIndex(prev => prev + 1), 80)
      return () => clearTimeout(timer)
    }
  }, [activeItemIndex])

  // Close menu on route change
  useEffect(() => {
    closeMenu()
  }, [location.pathname])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isMenuOpen])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false)
    setProductsDropdownOpen(false)
  }, [])

  const isActive = (path) => location.pathname === path
  
  // Header fica "scrollado" quando não é a home page OU quando scrollou mais de 50px
  const headerScrolled = !isHomePage || isScrolled

  const productLinks = [
    { to: '/caixas-termicas', label: 'Caixas Térmicas', icon: Thermometer },
    { to: '/facas-personalizadas', label: 'Facas Personalizadas', icon: Utensils },
    { to: '/kit-churrasco', label: 'Kit Churrasco', icon: ChefHat },
    { to: '/acessorios-churrasco', label: 'Acessórios Personalizados', icon: Package },
  ]

  const navItems = [
    { to: '/', label: 'Início', icon: Home, isLink: true },
    { to: '#sobre', label: 'Sobre', icon: Users, isLink: false },
    { to: 'products', label: 'Produtos', icon: Package, isDropdown: true },
    { to: '#diferenciais', label: 'Diferenciais', icon: Award, isLink: false },
    { to: '#contato', label: 'Contato', icon: MessageCircle, isLink: false },
  ]

  const getItemStyle = (index) => ({
    opacity: activeItemIndex >= index ? 1 : 0,
    transform: activeItemIndex >= index ? 'translateX(0)' : 'translateX(-30px)',
  })

  return (
    <>
      <header className={`header ${headerScrolled ? 'header--scrolled' : ''}`}>
        <div className="container header__container">
          <Link to="/" className="header__logo" onClick={closeMenu}>
            <img src="/images/logo/logo.png" alt="Doma Crioula" className="header__logo-img" />
            <div className="header__logo-text">
              <span className="header__logo-name">Doma Crioula</span>
              <span className="header__logo-tagline">Tradição em Churrasco</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav header__nav--desktop">
            <ul className="header__nav-list">
              <li>
                <Link to="/" className={`header__nav-link ${isActive('/') ? 'active' : ''}`}>
                  Início
                </Link>
              </li>
              <li>
                {isHomePage ? (
                  <a href="#sobre" className="header__nav-link">Sobre</a>
                ) : (
                  <Link to="/#sobre" className="header__nav-link">Sobre</Link>
                )}
              </li>
              <li className="header__nav-dropdown">
                <button 
                  className="header__nav-link header__nav-dropdown-trigger"
                  onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                >
                  Produtos
                  <ChevronDown size={16} className={productsDropdownOpen ? 'rotated' : ''} />
                </button>
                <ul className={`header__dropdown-menu ${productsDropdownOpen ? 'header__dropdown-menu--open' : ''}`}>
                  {productLinks.map((link) => (
                    <li key={link.to}>
                      <Link to={link.to} className="header__dropdown-link">
                        <link.icon size={16} />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                {isHomePage ? (
                  <a href="#diferenciais" className="header__nav-link">Diferenciais</a>
                ) : (
                  <Link to="/#diferenciais" className="header__nav-link">Diferenciais</Link>
                )}
              </li>
              <li>
                {isHomePage ? (
                  <a href="#contato" className="header__nav-link">Contato</a>
                ) : (
                  <Link to="/#contato" className="header__nav-link">Contato</Link>
                )}
              </li>
            </ul>
          </nav>

          {/* Header Actions - Login/User Button */}
          <div className="header__actions">
            {isAuthenticated ? (
              <Link 
                to="/minha-conta" 
                className="header__user-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: headerScrolled ? '#E65100' : '#FFFFFF',
                  border: `2px solid ${headerScrolled ? '#E65100' : '#FFFFFF'}`,
                  borderRadius: '8px',
                  color: headerScrolled ? '#FFFFFF' : '#E65100',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: headerScrolled ? '0 4px 12px rgba(230, 81, 0, 0.35)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <User size={20} style={{ color: headerScrolled ? '#FFFFFF' : '#E65100' }} />
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="header__login-btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: headerScrolled ? '#E65100' : '#FFFFFF',
                  border: `2px solid ${headerScrolled ? '#E65100' : '#FFFFFF'}`,
                  borderRadius: '8px',
                  color: headerScrolled ? '#FFFFFF' : '#E65100',
                  fontSize: '1rem',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: headerScrolled ? '0 4px 12px rgba(230, 81, 0, 0.35)' : '0 4px 16px rgba(0, 0, 0, 0.25)',
                  whiteSpace: 'nowrap'
                }}
              >
                <LogIn size={20} style={{ color: headerScrolled ? '#FFFFFF' : '#E65100' }} />
                <span>Entrar</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`header__menu-toggle ${isMenuOpen ? 'header__menu-toggle--active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="header__menu-toggle-bar"></span>
            <span className="header__menu-toggle-bar"></span>
            <span className="header__menu-toggle-bar"></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${isMenuOpen ? 'mobile-menu-overlay--active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav 
        className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}
        aria-label="Mobile navigation"
      >
        {/* Mobile Menu Header */}
        <div className="mobile-menu__header">
          <Link to="/" className="mobile-menu__logo" onClick={closeMenu}>
            <img src="/images/logo/logo.png" alt="Doma Crioula" />
            <div className="mobile-menu__logo-text">
              <span className="mobile-menu__logo-name">Doma Crioula</span>
              <span className="mobile-menu__logo-tagline">Tradição em Churrasco</span>
            </div>
          </Link>
          <button 
            className="mobile-menu__close" 
            onClick={closeMenu}
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="mobile-menu__content">
          <ul className="mobile-menu__list">
            {navItems.map((item, index) => (
              <li 
                key={item.to} 
                className="mobile-menu__item"
                style={getItemStyle(index)}
              >
                {item.isDropdown ? (
                  <>
                    <button 
                      className={`mobile-menu__link mobile-menu__link--dropdown ${productsDropdownOpen ? 'active' : ''}`}
                      onClick={() => setProductsDropdownOpen(!productsDropdownOpen)}
                    >
                      <span className="mobile-menu__link-icon">
                        <item.icon size={22} />
                      </span>
                      <span className="mobile-menu__link-text">{item.label}</span>
                      <ChevronDown 
                        size={20} 
                        className={`mobile-menu__link-arrow ${productsDropdownOpen ? 'rotated' : ''}`} 
                      />
                    </button>
                    <ul className={`mobile-menu__submenu ${productsDropdownOpen ? 'mobile-menu__submenu--open' : ''}`}>
                      {productLinks.map((link, subIndex) => (
                        <li 
                          key={link.to} 
                          className="mobile-menu__submenu-item"
                          style={{
                            transitionDelay: productsDropdownOpen ? `${subIndex * 50}ms` : '0ms'
                          }}
                        >
                          <Link 
                            to={link.to} 
                            className={`mobile-menu__submenu-link ${isActive(link.to) ? 'active' : ''}`}
                            onClick={closeMenu}
                          >
                            <link.icon size={18} />
                            <span>{link.label}</span>
                            <ChevronRight size={16} className="mobile-menu__submenu-arrow" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : item.isLink ? (
                  <Link 
                    to={item.to} 
                    className={`mobile-menu__link ${isActive(item.to) ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <span className="mobile-menu__link-icon">
                      <item.icon size={22} />
                    </span>
                    <span className="mobile-menu__link-text">{item.label}</span>
                    {isActive(item.to) && <span className="mobile-menu__active-indicator" />}
                  </Link>
                ) : (
                  isHomePage ? (
                    <a 
                      href={item.to} 
                      className="mobile-menu__link"
                      onClick={closeMenu}
                    >
                      <span className="mobile-menu__link-icon">
                        <item.icon size={22} />
                      </span>
                      <span className="mobile-menu__link-text">{item.label}</span>
                    </a>
                  ) : (
                    <Link 
                      to={`/${item.to}`} 
                      className="mobile-menu__link"
                      onClick={closeMenu}
                    >
                      <span className="mobile-menu__link-icon">
                        <item.icon size={22} />
                      </span>
                      <span className="mobile-menu__link-text">{item.label}</span>
                    </Link>
                  )
                )}
              </li>
            ))}
          </ul>

          {/* User Links */}
          <div className="mobile-menu__user" style={getItemStyle(5)}>
            {isAuthenticated ? (
              <div className="mobile-menu__auth-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <Link 
                  to="/minha-conta" 
                  className="mobile-menu__account-btn"
                  onClick={closeMenu}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', fontWeight: 600, textDecoration: 'none' }}
                >
                  <User size={18} />
                  <span>{user?.name?.split(' ')[0] || 'Minha Conta'}</span>
                </Link>
                <Link 
                  to="/rastrear" 
                  className="mobile-menu__track-link"
                  onClick={closeMenu}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: '#f9fafb', color: 'var(--color-primary)', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}
                >
                  <Truck size={18} />
                  <span>Rastrear Pedido</span>
                </Link>
                <button 
                  className="mobile-menu__logout-btn"
                  onClick={() => { logout(); closeMenu(); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', fontWeight: 600, border: '1px solid #fecaca', cursor: 'pointer' }}
                >
                  <LogOut size={18} />
                  <span>Sair da Conta</span>
                </button>
              </div>
            ) : (
              <div className="mobile-menu__auth-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
                <Link 
                  to="/login" 
                  className="mobile-menu__login-btn"
                  onClick={closeMenu}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: 'var(--color-primary)', color: '#fff', borderRadius: '10px', fontWeight: 600, textDecoration: 'none' }}
                >
                  <LogIn size={18} />
                  <span>Entrar</span>
                </Link>
                <Link 
                  to="/cadastro" 
                  className="mobile-menu__register-btn"
                  onClick={closeMenu}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: '#f5f5f5', color: '#333', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}
                >
                  <User size={18} />
                  <span>Criar Conta</span>
                </Link>
                <Link 
                  to="/rastrear" 
                  className="mobile-menu__track-link"
                  onClick={closeMenu}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.25rem 1.5rem', background: '#f9fafb', color: 'var(--color-primary)', borderRadius: '10px', fontWeight: 600, textDecoration: 'none', border: '1px solid #e5e7eb' }}
                >
                  <Truck size={18} />
                  <span>Rastrear Pedido</span>
                </Link>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="mobile-menu__cta" style={getItemStyle(6)}>
            <a
              href="https://wa.me/5551998137009"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-menu__cta-button"
            >
              <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" style={{ width: 20, height: 20, objectFit: 'contain' }} />
              <span>Fale Conosco pelo WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Mobile Menu Footer */}
        <div className="mobile-menu__footer">
          <div className="mobile-menu__info">
            <div className="mobile-menu__info-item">
              <MapPin size={16} />
              <span>Sapiranga/RS</span>
            </div>
            <div className="mobile-menu__info-item">
              <Clock size={16} />
              <span>+13 anos de tradição</span>
            </div>
          </div>
          <div className="mobile-menu__social">
            <a href="https://www.instagram.com/domacrioulacaixastermicas/" className="mobile-menu__social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61582054284325" className="mobile-menu__social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Header
