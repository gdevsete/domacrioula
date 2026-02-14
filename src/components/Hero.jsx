import { Award, Clock, Shield } from 'lucide-react'
import './Hero.css'

const Hero = () => {
  return (
    <section id="inicio" className="hero">
      <div className="hero__overlay"></div>
      <div className="hero__background"></div>
      
      <div className="container hero__container">
        <div className="hero__content">
          <div className="hero__badge">
            <Award size={20} />
            <span>Mais de 13 anos de tradição</span>
          </div>
          
          <h1 className="hero__title">
            Qualidade e Tradição em
            <span className="hero__title-highlight"> Produtos para Churrasco</span>
          </h1>
          
          <p className="hero__description">
            Fabricamos caixas térmicas, facas personalizadas e acessórios de alta qualidade 
            para tornar seu churrasco ainda mais especial. Produtos feitos com dedicação 
            e o orgulho gaúcho.
          </p>

          <div className="hero__features">
            <div className="hero__feature">
              <Clock size={20} />
              <span>Entrega Rápida</span>
            </div>
            <div className="hero__feature">
              <Shield size={20} />
              <span>Garantia de Qualidade</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
