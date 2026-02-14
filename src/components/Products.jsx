import { Package, Eye } from 'lucide-react'
import './Products.css'

const Products = () => {
  const products = [
    {
      id: 1,
      name: 'Caixas Térmicas',
      description: 'Caixas térmicas de alta qualidade, perfeitas para manter suas bebidas geladas por horas. Disponíveis em diversos tamanhos e cores.',
      image: 'https://images.unsplash.com/photo-1571079712726-4e90dc59e0dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Alta durabilidade', 'Isolamento térmico', 'Diversos tamanhos'],
      category: 'Destaque'
    },
    {
      id: 2,
      name: 'Facas Personalizadas',
      description: 'Facas artesanais com acabamento premium. Personalizamos com seu nome, logo ou design exclusivo. Perfeitas para presente.',
      image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Aço inoxidável', 'Personalização', 'Acabamento artesanal'],
      category: 'Mais Vendido'
    },
    {
      id: 3,
      name: 'Kit Churrasco',
      description: 'Conjuntos completos com tudo que você precisa para o churrasco perfeito. Espetos, garfos, facas e acessórios.',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Kit completo', 'Estojo premium', 'Presente ideal'],
      category: 'Novo'
    },
    {
      id: 4,
      name: 'Tábuas de Corte',
      description: 'Tábuas de madeira nobre para corte e apresentação. Acabamento refinado que valoriza seu churrasco.',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Madeira nobre', 'Acabamento premium', 'Durabilidade'],
      category: 'Popular'
    },
    {
      id: 5,
      name: 'Espetos Artesanais',
      description: 'Espetos de aço inox com cabos em madeira tratada. Diversos tamanhos para todos os tipos de cortes.',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Aço inox', 'Cabo ergonômico', 'Vários tamanhos'],
      category: 'Essencial'
    },
    {
      id: 6,
      name: 'Aventais Personalizados',
      description: 'Aventais de couro e tecido com personalização. Proteja-se com estilo durante o preparo do churrasco.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      features: ['Couro legítimo', 'Personalização', 'Conforto'],
      category: 'Exclusivo'
    }
  ]

  const handleWhatsApp = (productName) => {
    const message = encodeURIComponent(`Olá! Tenho interesse no produto: ${productName}. Gostaria de mais informações.`)
    window.open(`https://wa.me/5551998137009?text=${message}`, '_blank')
  }

  return (
    <section id="produtos" className="products section">
      <div className="container">
        <h2 className="section-title">Nossos Produtos</h2>
        <p className="section-subtitle">
          Conheça nossa linha completa de produtos para churrasco, 
          fabricados com qualidade e tradição gaúcha.
        </p>

        <div className="products__grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-card__image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-card__image"
                />
                <span className="product-card__category">{product.category}</span>
              </div>
              
              <div className="product-card__content">
                <h3 className="product-card__title">{product.name}</h3>
                <p className="product-card__description">{product.description}</p>
                
                <ul className="product-card__features">
                  {product.features.map((feature, index) => (
                    <li key={index} className="product-card__feature">
                      <Package size={14} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="product-card__actions">
                  <button
                    onClick={() => handleWhatsApp(product.name)}
                    className="btn btn-primary product-card__btn"
                  >
                    Fale Conosco
                  </button>
                  <button className="btn btn-secondary product-card__btn-secondary">
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="products__cta">
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

export default Products
