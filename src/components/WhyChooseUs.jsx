import { Award, Truck, ThumbsUp, Wrench, Clock, Shield } from 'lucide-react'
import './WhyChooseUs.css'

const WhyChooseUs = () => {
  const benefits = [
    {
      icon: <Award size={40} />,
      title: 'Qualidade Premium',
      description: 'Utilizamos apenas materiais de primeira linha, garantindo produtos que duram por anos.'
    },
    {
      icon: <Wrench size={40} />,
      title: 'Fabricação Própria',
      description: 'Tudo é produzido em nossa fábrica em Sapiranga/RS, com controle total de qualidade.'
    },
    {
      icon: <ThumbsUp size={40} />,
      title: 'Personalização',
      description: 'Criamos produtos exclusivos com seu nome, logo ou design personalizado.'
    },
    {
      icon: <Clock size={40} />,
      title: '13+ Anos de Experiência',
      description: 'Mais de uma década produzindo satisfação para milhares de clientes.'
    },
    {
      icon: <Truck size={40} />,
      title: 'Entrega em Todo Brasil',
      description: 'Enviamos nossos produtos para todas as regiões do país com segurança.'
    },
    {
      icon: <Shield size={40} />,
      title: 'Garantia de Satisfação',
      description: 'Se não ficar satisfeito, resolvemos. Seu contentamento é nossa prioridade.'
    }
  ]

  return (
    <section id="diferenciais" className="why-choose-us section">
      <div className="container">
        <h2 className="section-title">Por Que Escolher a Doma Crioula?</h2>
        <p className="section-subtitle">
          Nossa tradição e compromisso com a qualidade nos tornam referência 
          em produtos para churrasco no Rio Grande do Sul e em todo Brasil.
        </p>

        <div className="benefits__grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="benefit-card">
              <div className="benefit-card__icon">
                {benefit.icon}
              </div>
              <h3 className="benefit-card__title">{benefit.title}</h3>
              <p className="benefit-card__description">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="testimonial">
          <blockquote className="testimonial__quote">
            "A qualidade dos produtos da Doma Crioula é excepcional. 
            Comprei uma faca personalizada e virou meu item favorito no churrasco!"
          </blockquote>
          <div className="testimonial__author">
            <div className="testimonial__avatar">JR</div>
            <div className="testimonial__info">
              <strong>João Roberto</strong>
              <span>Cliente desde 2019</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs
