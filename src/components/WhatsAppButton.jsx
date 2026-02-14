import './WhatsAppButton.css'

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/5551998137009?text=Olá! Vim pelo site e gostaria de mais informações."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contato via WhatsApp"
    >
      <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" className="whatsapp-float__icon" />
      <span className="whatsapp-float__tooltip">Fale Conosco!</span>
    </a>
  )
}

export default WhatsAppButton
