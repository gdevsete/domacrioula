import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Thermometer, Sword, Package, Layers } from 'lucide-react'
import './ProductCategories.css'

// Carrossel de imagens para categorias
const ImageCarousel = ({ images, interval = 3000, altText = "Produto" }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images.length, interval])

  return (
    <div className="carousel">
      {images.map((image, index) => (
        <div
          key={index}
          className={`carousel__slide ${index === currentIndex ? 'carousel__slide--active' : ''}`}
        >
          <img src={image} alt={`${altText} ${index + 1}`} />
        </div>
      ))}
      <div className="carousel__indicators">
        {images.map((_, index) => (
          <button
            key={index}
            className={`carousel__indicator ${index === currentIndex ? 'carousel__indicator--active' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              setCurrentIndex(index)
            }}
            aria-label={`Ir para imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

const ProductCategories = () => {
  // Imagens do carrossel de caixas térmicas
  const carouselImages = [
    '/images/carrossel/001.jpeg',
    '/images/carrossel/002.jpeg',
    '/images/carrossel/003.jpeg',
    '/images/carrossel/004.jpeg',
    '/images/carrossel/005.jpeg',
    '/images/carrossel/006.jpeg',
    '/images/carrossel/007.jpeg',
    '/images/carrossel/008.jpeg',
    '/images/carrossel/009.jpeg',
    '/images/carrossel/010.jpeg',
    '/images/carrossel/011.jpeg',
    '/images/carrossel/012.jpeg',
    '/images/carrossel/013.jpeg',
    '/images/carrossel/014.jpeg',
  ]

  // Imagens do carrossel de facas personalizadas
  const facasCarouselImages = [
    '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/PicanheiraIronMaiden1.png',
    '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/PicanheiraIronMaiden2.png',
    '/images/caixastermicas/facas/facas-de-rock/metallica/metallica1.png',
    '/images/caixastermicas/facas/facas-de-rock/metallica/metallica2.png',
    '/images/caixastermicas/facas/facas-de-rock/guns-n-roses/guns-n-roses1.png',
    '/images/caixastermicas/facas/facas-de-rock/guns-n-roses/guns-n-roses2.png',
    '/images/caixastermicas/facas/Facas-Tematicas/harley-davidson/harley-davidson1.png',
    '/images/caixastermicas/facas/Facas-Tematicas/harley-davidson/harley-davidson2.png',
    '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria1.png',
    '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria2.png',
    '/images/caixastermicas/facas/Facas-Tematicas/glock/picanheira-glock1.png',
    '/images/caixastermicas/facas/Facas-Tematicas/bolsonaro/bolsonaro1.png',
  ]

  const categories = [
    {
      id: 'caixas-termicas',
      name: 'Caixas Térmicas',
      description: 'De 30L a 500L. Isolamento em poliuretano expandido para máxima conservação.',
      icon: <Thermometer size={40} />,
      hasCarousel: true,
      carouselAlt: 'Caixa Térmica',
      link: '/caixas-termicas',
      badge: 'Destaque',
      features: ['30L a 500L', 'Isolamento térmico', 'Personalização']
    },
    {
      id: 'facas',
      name: 'Facas Personalizadas',
      description: 'Facas artesanais com acabamento premium. Personalizamos com seu nome ou logo.',
      icon: <Sword size={40} />,
      hasCarousel: true,
      carouselImages: facasCarouselImages,
      carouselAlt: 'Faca Personalizada',
      link: '/facas-personalizadas',
      badge: 'Mais Vendido',
      features: ['Aço inoxidável', 'Personalização', 'Acabamento artesanal']
    },
    {
      id: 'kit-churrasco',
      name: 'Kit Churrasco',
      description: 'Conjuntos completos com tudo para o churrasco perfeito. Presente ideal.',
      icon: <Package size={40} />,
      image: '/images/caixastermicas/kit-churrasco/kit-churrasco-3-pecas-gold/kitgold3pecas1.png',
      link: '/kit-churrasco',
      badge: 'Presente Ideal',
      features: ['Kit completo', 'Estojo premium', 'Personalização']
    },
    {
      id: 'acessorios',
      name: 'Acessórios para Churrasco',
      description: 'Tábuas, aventais, espetos e acessórios com personalização exclusiva.',
      icon: <Layers size={40} />,
      image: '/images/caixastermicas/kit-churrasco/acessorios/avental/avental1.png',
      link: '/acessorios-churrasco',
      badge: 'Personalizado',
      features: ['Personalização', 'Variedade', 'Qualidade premium']
    }
  ]

  return (
    <section id="produtos" className="product-categories section">
      <div className="container">
        <h2 className="section-title">Nossos Produtos</h2>
        <p className="section-subtitle">
          Conheça nossa linha completa de produtos para churrasco, 
          fabricados com qualidade e mais de 13 anos de tradição gaúcha.
        </p>

        <div className="categories__grid">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={category.link} 
              className={`category-card ${category.hasCarousel ? 'category-card--has-carousel' : ''}`}
            >
              <div className="category-card__image-wrapper">
                {category.hasCarousel ? (
                  <ImageCarousel 
                    images={category.carouselImages || carouselImages} 
                    interval={2500} 
                    altText={category.carouselAlt || category.name}
                  />
                ) : category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="category-card__image"
                  />
                ) : (
                  <div className="category-card__icon">
                    {category.icon}
                  </div>
                )}
                <span className="category-card__badge">{category.badge}</span>
              </div>
              
              <div className="category-card__content">
                <h3 className="category-card__title">{category.name}</h3>
                <p className="category-card__description">{category.description}</p>
                
                <ul className="category-card__features">
                  {category.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <span className="category-card__link">
                  Ver Catálogo Completo
                  <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="categories__cta">
          <p>Não encontrou o que procura? Fazemos produtos personalizados!</p>
          <a
            href="https://wa.me/5551998137009?text=Olá! Gostaria de encomendar um produto personalizado."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Solicitar Personalização
          </a>
        </div>
      </div>
    </section>
  )
}

export default ProductCategories
