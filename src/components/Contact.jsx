import { MapPin, Mail, Clock, Send } from 'lucide-react'
import './Contact.css'

const WhatsAppIcon = ({ size = 20 }) => (
  <img 
    src="/images/logo/iconWhatsApp.png" 
    alt="WhatsApp" 
    style={{ width: size, height: size, objectFit: 'contain' }} 
  />
)

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const name = formData.get('name')
    const message = formData.get('message')
    const fullMessage = encodeURIComponent(`Olá! Meu nome é ${name}. ${message}`)
    window.open(`https://wa.me/5551998137009?text=${fullMessage}`, '_blank')
  }

  return (
    <section id="contato" className="contact section">
      <div className="container">
        <h2 className="section-title">Entre em Contato</h2>
        <p className="section-subtitle">
          Estamos prontos para atender você! Tire suas dúvidas, 
          solicite orçamentos ou faça sua encomenda.
        </p>

        <div className="contact__grid">
          <div className="contact__info">
            <h3 className="contact__info-title">Informações</h3>
            
            <div className="contact__info-list">
              <div className="contact__info-item">
                <div className="contact__info-icon">
                  <MapPin size={24} />
                </div>
                <div className="contact__info-content">
                  <strong>Endereço</strong>
                  <p>Rodovia RS-239, 4968</p>
                  <p>Bairro Oeste - Sapiranga/RS</p>
                  <p>CEP: 93804-570</p>
                </div>
              </div>

              <div className="contact__info-item">
                <div className="contact__info-icon">
                  <WhatsAppIcon size={24} />
                </div>
                <div className="contact__info-content">
                  <strong>WhatsApp</strong>
                  <a href="https://wa.me/5551998137009" target="_blank" rel="noopener noreferrer">
                    (51) 99813-7009
                  </a>
                </div>
              </div>

              <div className="contact__info-item">
                <div className="contact__info-icon">
                  <Clock size={24} />
                </div>
                <div className="contact__info-content">
                  <strong>Horário de Atendimento</strong>
                  <p>Segunda a Sexta: 8h às 18h</p>
                  <p>Sábado: 8h às 12h</p>
                </div>
              </div>
            </div>

            <div className="contact__company">
              <strong>Doma Crioula LTDA</strong>
              <span>CNPJ: 18.701.908/0001-98</span>
            </div>

            <a
              href="https://wa.me/5551998137009"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp contact__whatsapp-btn"
            >
              <WhatsAppIcon size={20} />
              Chamar no WhatsApp
            </a>
          </div>

          <form className="contact__form" onSubmit={handleSubmit}>
            <h3 className="contact__form-title">Envie uma Mensagem</h3>
            
            <div className="contact__form-group">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="(51) 99999-9999"
              />
            </div>

            <div className="contact__form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Como podemos ajudar?"
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary contact__submit-btn">
              <WhatsAppIcon size={18} />
              Enviar via WhatsApp
            </button>
          </form>
        </div>

        <div className="contact__map">
          <iframe
            title="Localização Doma Crioula"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.482!2d-51.0069!3d-29.6289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDM3JzQ0LjAiUyA1McKwMDAnMjQuOCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: 'var(--border-radius-lg)' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default Contact
