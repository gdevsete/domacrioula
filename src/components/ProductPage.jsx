import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X, Check, ArrowLeft, Package, Plus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAnalytics } from '../contexts/AnalyticsContext'
import { formatCurrency } from '../services/podpayService'
import './ProductPage.css'

const ProductPage = ({ 
  title, 
  subtitle, 
  description, 
  products, 
  customizationText,
  backLink = '/#produtos'
}) => {
  const [selectedProduct, setSelectedProduct] = useState(0)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { addItem } = useCart()
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    setSelectedImage(0)
  }, [selectedProduct])

  const currentProduct = products[selectedProduct]

  // Disparar ViewContent quando o produto é visualizado
  useEffect(() => {
    if (currentProduct) {
      trackEvent('ViewContent', {
        content_name: currentProduct.name,
        content_ids: [currentProduct.id],
        content_type: 'product',
        content_category: title,
        value: currentProduct.price / 100,
        currency: 'BRL'
      })
    }
  }, [selectedProduct, currentProduct, title, trackEvent])

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === currentProduct.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? currentProduct.images.length - 1 : prev - 1
    )
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse em: ${currentProduct.name}. Gostaria de mais informações e valores.`
    )
    window.open(`https://wa.me/5551998137009?text=${message}`, '_blank')
  }

  return (
    <section className="product-page section">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product-page__breadcrumb">
          <Link to="/" className="breadcrumb__back">
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <span className="breadcrumb__separator">/</span>
          <span className="breadcrumb__current">{title}</span>
        </div>

        {/* Header */}
        <div className="product-page__header">
          <h1 className="product-page__title">{title}</h1>
          <p className="product-page__subtitle">{subtitle}</p>
        </div>

        {/* Product Selection */}
        {products.length > 1 && (
          <div className="product-page__tabs">
            <div className="product-page__tabs-wrapper">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  className={`product-page__tab ${selectedProduct === index ? 'product-page__tab--active' : ''} ${product.highlight ? 'product-page__tab--highlight' : ''}`}
                  onClick={() => setSelectedProduct(index)}
                >
                  {product.tabName || product.name}
                  {product.highlight && <span className="tab-badge">★</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Product Content */}
        <div className="product-page__content">
          {/* Gallery */}
          <div className="product-page__gallery">
            <div className="product-page__main-image">
              {currentProduct.images && currentProduct.images.length > 0 ? (
                <img
                  src={currentProduct.images[selectedImage]}
                  alt={`${currentProduct.name} - Imagem ${selectedImage + 1}`}
                  onClick={() => setLightboxOpen(true)}
                />
              ) : (
                <div className="product-page__no-image">
                  <Package size={60} />
                  <span>Imagem em breve</span>
                </div>
              )}
              {currentProduct.images && currentProduct.images.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" onClick={prevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="gallery-nav gallery-nav--next" onClick={nextImage}>
                    <ChevronRight size={24} />
                  </button>
                  <div className="gallery-counter">
                    {selectedImage + 1} / {currentProduct.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="product-page__thumbnails">
                {currentProduct.images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'thumbnail--active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`Miniatura ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-page__info">
            <div className="product-page__info-header">
              <h2 className="product-page__product-title">{currentProduct.name}</h2>
              {currentProduct.highlight && (
                <span className="highlight-badge">Mais Vendido</span>
              )}
            </div>

            <p className="product-page__description">{currentProduct.description}</p>

            {/* Specifications */}
            {currentProduct.specs && (
              <div className="product-page__specs">
                <h4>Especificações</h4>
                <div className="specs-grid">
                  {Object.entries(currentProduct.specs).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <strong>{key}</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {currentProduct.features && (
              <div className="product-page__features">
                <h4>Características</h4>
                <div className="features-list">
                  {currentProduct.features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      <Check size={14} />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Destaques */}
            {currentProduct.destaques && currentProduct.destaques.length > 0 && (
              <div className="product-page__destaques">
                <h4>Destaques</h4>
                <ul className="destaques-list">
                  {currentProduct.destaques.map((destaque, index) => (
                    <li key={index} className="destaque-item">
                      <Check size={16} />
                      <span>{destaque}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalização */}
            {currentProduct.personalizacao && currentProduct.personalizacao.length > 0 && (
              <div className="product-page__personalizacao">
                <h4>Opções de Personalização</h4>
                <ul className="personalizacao-list">
                  {currentProduct.personalizacao.map((opcao, index) => (
                    <li key={index} className="personalizacao-item">
                      <span className="personalizacao-bullet">✦</span>
                      <span>{opcao}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="product-page__actions">
              {currentProduct.price && (
                <div className="product-page__pricing">
                  <span className="product-page__price">{formatCurrency(currentProduct.price)}</span>
                </div>
              )}
              {currentProduct.price ? (
                <>
                  <button 
                    className="btn btn-comprar" 
                    onClick={() => addItem({
                      id: currentProduct.id,
                      name: currentProduct.name,
                      price: currentProduct.price,
                      image: currentProduct.image,
                      category: currentProduct.category || 'acessorio'
                    })}
                  >
                    <Plus size={18} />
                    Adicionar ao Carrinho
                  </button>
                  <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                    <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    Dúvidas? Fale Conosco
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                    <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                    Fale Conosco
                  </button>
                  <p className="product-page__contact-hint">
                    Resposta rápida via WhatsApp
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Customization Banner */}
        {customizationText && (
          <div className="product-page__custom-banner">
            <div className="custom-banner__content">
              <h3>Personalização Disponível</h3>
              <p>{customizationText}</p>
            </div>
            <button className="btn btn-primary" onClick={() => {
              const message = encodeURIComponent(`Olá! Gostaria de informações sobre personalização de ${title}.`)
              window.open(`https://wa.me/5551998137009?text=${message}`, '_blank')
            }}>
              Consultar Personalização
            </button>
          </div>
        )}

        {/* All Products Grid */}
        {products.length > 1 && (
          <div className="product-page__all-products">
            <h3>Todos os Modelos</h3>
            <div className="all-products__grid">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  className={`all-products__card ${selectedProduct === index ? 'all-products__card--active' : ''}`}
                  onClick={() => setSelectedProduct(index)}
                >
                  <div className="all-products__card-image">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <Package size={40} />
                    )}
                  </div>
                  <span className="all-products__card-name">{product.name}</span>
                  {product.highlight && <span className="all-products__card-badge">★</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && currentProduct.images && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox__close" onClick={() => setLightboxOpen(false)}>
            <X size={32} />
          </button>
          <img
            src={currentProduct.images[selectedImage]}
            alt={currentProduct.name}
            onClick={(e) => e.stopPropagation()}
          />
          {currentProduct.images.length > 1 && (
            <>
              <button 
                className="lightbox__nav lightbox__nav--prev" 
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
              >
                <ChevronLeft size={40} />
              </button>
              <button 
                className="lightbox__nav lightbox__nav--next" 
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

export default ProductPage
