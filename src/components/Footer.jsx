import { Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Phone, Instagram, Facebook } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()
  const location = useLocation()

  const quickLinks = [
    { to: '/', label: 'Início', hash: null },
    { to: '/', label: 'Sobre Nós', hash: 'sobre' },
    { to: '/', label: 'Produtos', hash: 'produtos' },
    { to: '/', label: 'Diferenciais', hash: 'diferenciais' },
    { to: '/', label: 'Contato', hash: 'contato' },
  ]

  const productLinks = [
    { to: '/caixas-termicas', label: 'Caixas Térmicas' },
    { to: '/facas-personalizadas', label: 'Facas Personalizadas' },
    { to: '/kit-churrasco', label: 'Kit Churrasco' },
    { to: '/acessorios-churrasco', label: 'Acessórios para Churrasco' },
  ]

  const handleQuickLinkClick = (e, link) => {
    e.preventDefault()
    
    if (link.hash) {
      if (location.pathname === '/') {
        // Já está na home, apenas scrollar
        const element = document.getElementById(link.hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // Navegar para home e depois scrollar
        navigate('/')
        setTimeout(() => {
          const element = document.getElementById(link.hash)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    } else {
      // Link para home sem hash
      navigate('/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <img src="/images/logo/logo.png" alt="Doma Crioula" className="footer__logo-img" />
              <div className="footer__logo-text">
                <span className="footer__logo-name">Doma Crioula</span>
                <span className="footer__logo-tagline">Tradição em Churrasco</span>
              </div>
            </Link>
            <p className="footer__description">
              Há mais de 13 anos fabricando caixas térmicas, facas personalizadas e acessórios 
              de qualidade para tornar seu churrasco ainda mais especial. Tradição e orgulho gaúcho.
            </p>
            <div className="footer__social">
              <a 
                href="https://www.instagram.com/domacrioulacaixastermicas/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer__social-link" 
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.facebook.com/profile.php?id=61582054284325" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer__social-link" 
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div className="footer__links">
            <h4 className="footer__title">Links Rápidos</h4>
            <ul>
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.hash ? `/#${link.hash}` : '/'}
                    onClick={(e) => handleQuickLinkClick(e, link)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__links">
            <h4 className="footer__title">Nossos Produtos</h4>
            <ul>
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__contact">
            <h4 className="footer__title">Contato</h4>
            <ul>
              <li>
                <MapPin size={16} />
                <span>
                  Rodovia RS-239, 4968<br />
                  Oeste - Sapiranga/RS<br />
                  CEP: 93804-570
                </span>
              </li>
              <li>
                <Phone size={16} />
                <a href="https://wa.me/5551998137009">(51) 99813-7009</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__company-info">
            <p><strong>Doma Crioula LTDA</strong> • CNPJ: 18.701.908/0001-98</p>
          </div>
          <p className="footer__copyright">
            © {currentYear} Doma Crioula. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
