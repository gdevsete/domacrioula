import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Ruler, Package, Check, Sparkles, Palette, Award, Star, Scissors, Plus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { formatCurrency } from '../services/podpayService'
import './FacasPersonalizadas.css'

// Preço fixo para todas as facas (R$ 189,99)
const PRECO_FACA = 18999

const FacasPersonalizadas = () => {
  const [selectedCategory, setSelectedCategory] = useState('rock')
  const [selectedFaca, setSelectedFaca] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { addItem } = useCart()

  // Categorias de facas
  const categorias = {
    rock: {
      nome: 'Facas de Rock',
      descricao: 'Para os amantes de rock e heavy metal que também são mestres do churrasco',
      facas: [
        {
          id: 'iron-maiden',
          nome: 'Picanheira Iron Maiden',
          descricao: 'Para os verdadeiros fãs de heavy metal que também são mestres do churrasco. Uma peça artesanal que une a brutalidade do rock com a precisão da cutelaria premium.',
          imagens: [
            '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/PicanheiraIronMaiden1.png',
            '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/PicanheiraIronMaiden2.png',
            '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/PicanheiraIronMaiden3.png',
          ],
          gif: '/images/caixastermicas/facas/facas-de-rock/picanheiraironmaiden/demonstracao.gif',
          specs: {
            lamina: '8 polegadas em aço inoxidável',
            cabo: 'Resina de alta resistência com design personalizado',
            acabamento: 'Artesanal premium',
            gravacao: 'Logo Iron Maiden personalizado',
          },
          destaques: [
            'Lâmina de aço inoxidável de alta qualidade',
            'Gravação personalizada do logo Iron Maiden',
            'Cabo em resina premium com acabamento exclusivo',
            'Edição especial para colecionadores',
            'Equilíbrio perfeito para cortes precisos',
          ],
          destaque: true,
        },
        {
          id: 'metallica',
          nome: 'Faca Artesanal Metallica',
          descricao: 'Uma verdadeira obra de arte em cutelaria artesanal para os verdadeiros fãs de heavy metal. Combina a tradição gaúcha com a energia do rock.',
          imagens: [
            '/images/caixastermicas/facas/facas-de-rock/metallica/metallica1.png',
            '/images/caixastermicas/facas/facas-de-rock/metallica/metallica2.png',
            '/images/caixastermicas/facas/facas-de-rock/metallica/metallica3.png',
          ],
          gif: '/images/caixastermicas/facas/facas-de-rock/metallica/metallica.gif',
          specs: {
            lamina: '20cm (8 polegadas) - Aço de alta qualidade',
            comprimentoTotal: '33cm',
            peso: '250g - equilíbrio perfeito',
            cabo: 'Resina personalizada 13cm com design heavy metal',
            dorso: 'Acabamento mosqueado artesanal exclusivo',
          },
          destaques: [
            'Edição Limitada numerada',
            'Lâmina gravada com arte Metallica',
            'Cabo ergonômico em resina de alta resistência',
            'Cutelaria 100% artesanal gaúcha',
            'Peça única feita à mão',
          ],
          destaque: true,
        },
        {
          id: 'guns-n-roses',
          nome: 'Faca Guns N\' Roses',
          descricao: 'Rock Clássico encontra Cutelaria de Elite. Faca artesanal exclusiva para quem vive o rock e exige qualidade superior em cada detalhe.',
          imagens: [
            '/images/caixastermicas/facas/facas-de-rock/guns-n-roses/guns-n-roses1.png',
            '/images/caixastermicas/facas/facas-de-rock/guns-n-roses/guns-n-roses2.png',
            '/images/caixastermicas/facas/facas-de-rock/guns-n-roses/guns-n-roses3.png',
          ],
          specs: {
            lamina: '8 polegadas (20cm) em aço inoxidável',
            cabo: 'Resina artesanal com glitter dourado e logo GNR',
            bainha: 'Couro legítimo preto com passadores',
            acabamento: 'Premium com detalhes em metal polido',
          },
          destaques: [
            'Logo oficial Guns N\' Roses gravado',
            'Bainha em couro legítimo artesanal',
            'Cabo com design exclusivo e glitter dourado',
            'Resistente à corrosão com fio duradouro',
            'Balanceamento perfeito para uso profissional',
          ],
          destaque: false,
        },
      ],
    },
    tematicas: {
      nome: 'Facas Temáticas',
      descricao: 'Facas personalizadas com temas exclusivos para todos os gostos',
      facas: [
        {
          id: 'harley-davidson',
          nome: 'Picanheira Harley-Davidson',
          descricao: 'Motos e Churrasco em Perfeita Harmonia. Para quem vive intensamente e ama um churrasco, uma faca exclusiva que une a paixão pelas motos com a arte de preparar a carne perfeita.',
          imagens: [
            '/images/caixastermicas/facas/Facas-Tematicas/harley-davidson/harley-davidson1.png',
            '/images/caixastermicas/facas/Facas-Tematicas/harley-davidson/harley-davidson2.png',
            '/images/caixastermicas/facas/Facas-Tematicas/harley-davidson/harley-davidson3.png',
          ],
          specs: {
            lamina: '8 polegadas (20cm) em aço inoxidável de alta qualidade',
            dorso: '3mm de espessura para cortes precisos',
            gravacao: 'Logo Harley-Davidson vazado na lâmina',
            cabo: 'Resina artesanal tons laranja e preto',
            acabamento: 'Virola em metal polido',
          },
          destaques: [
            'Gravação exclusiva Harley-Davidson vazada',
            'Cabo inspirado na estética motoqueira',
            'Cada peça é exclusiva e única',
            'Pegada firme e confortável',
            'Cortes precisos e seguros',
          ],
          destaque: true,
        },
        {
          id: 'maconaria',
          nome: 'Picanheira Maçônica',
          descricao: 'Faca picanheira artesanal de 10 polegadas com tema maçônico - uma peça exclusiva que une tradição, simbolismo e funcionalidade.',
          imagens: [
            '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria1.png',
            '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria2.png',
            '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria3.png',
            '/images/caixastermicas/facas/Facas-Tematicas/maconaria/maconaria4.png',
          ],
          specs: {
            lamina: '10 polegadas em aço inox de alta qualidade',
            dorso: '4mm - robustez e durabilidade',
            gravacao: 'Símbolos maçônicos (esquadro e compasso)',
            cabo: 'Osso natural e resina artesanal',
            acabamento: 'Premium com virola cromada Doma Crioula',
          },
          destaques: [
            'Pingente maçônico dourado no cabo',
            'Símbolos gravados na lâmina',
            'Cabo exclusivo em osso natural e resina',
            'Visual sofisticado e único',
            'Embalagem premium para presente',
          ],
          destaque: true,
        },
        {
          id: 'glock',
          nome: 'Picanheira Glock',
          descricao: 'Armas e Churrasco em Perfeita Harmonia. Para quem vive intensamente, uma faca exclusiva que une a paixão pela Glock com a arte de preparar a carne perfeita.',
          imagens: [
            '/images/caixastermicas/facas/Facas-Tematicas/glock/picanheira-glock1.png',
            '/images/caixastermicas/facas/Facas-Tematicas/glock/picanheira-glock2.png',
            '/images/caixastermicas/facas/Facas-Tematicas/glock/picanheira-glock3.png',
          ],
          specs: {
            lamina: '8 polegadas (20cm) em aço inoxidável',
            dorso: '3mm de espessura',
            gravacao: 'Logo Glock gravado na lâmina',
            cabo: 'Madeira nó de pinho, resina e pingente',
            acabamento: 'Virola em metal polido',
          },
          destaques: [
            'Gravação exclusiva Glock premium',
            'Cabo único em madeira e resina',
            'Pegada firme e confortável',
            'Cortes precisos e seguros',
            'Garantia contra defeitos de fabricação',
          ],
          destaque: false,
        },
        {
          id: 'bolsonaro',
          nome: 'Picanheira do Mito',
          descricao: 'Edição Especial Personalizada. Picanheira exclusiva com temática do Mito, perfeita para os fãs que querem unir paixão por churrasco e admiração.',
          imagens: [
            '/images/caixastermicas/facas/Facas-Tematicas/bolsonaro/bolsonaro1.png',
            '/images/caixastermicas/facas/Facas-Tematicas/bolsonaro/bolsonaro2.png',
            '/images/caixastermicas/facas/Facas-Tematicas/bolsonaro/bolsonaro3.png',
            '/images/caixastermicas/facas/Facas-Tematicas/bolsonaro/bolsonaro4.png',
          ],
          specs: {
            lamina: '8 polegadas com vazado especial #MITO',
            dorso: '3mm de espessura para resistência ideal',
            cabo: 'Resina personalizada verde e amarelo',
            acabamento: 'Artesanal premium',
            detalhe: 'Medalha com imagem personalizada no cabo',
          },
          destaques: [
            'Vazado especial #MITO na lâmina',
            'Design vibrante verde e amarelo',
            'Medalha personalizada exclusiva',
            'Peça artesanal única',
            'Ideal para presente diferenciado',
          ],
          destaque: false,
        },
      ],
    },
  }

  const currentCategory = categorias[selectedCategory]
  const facaAtual = selectedFaca || currentCategory.facas[0]

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSelectedFaca(null)
    setSelectedImage(0)
  }

  const handleFacaChange = (faca) => {
    setSelectedFaca(faca)
    setSelectedImage(0)
  }

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === facaAtual.imagens.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? facaAtual.imagens.length - 1 : prev - 1
    )
  }

  const openLightbox = () => setLightboxOpen(true)
  const closeLightbox = () => setLightboxOpen(false)

  const handleWhatsApp = (faca) => {
    const mensagem = `Olá! Vi a ${faca.nome} no site e gostaria de mais informações sobre personalização e valores.`
    window.open(`https://wa.me/5554999999999?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  return (
    <section className="facas-personalizadas">
      <div className="container">
        {/* Header */}
        <div className="facas-personalizadas__header">
          <h1>
            <Scissors className="section-icon" />
            Facas Personalizadas
          </h1>
          <p className="facas-personalizadas__subtitle">
            Cutelaria artesanal de alta qualidade com personalização exclusiva
          </p>
        </div>

        {/* Banner de Personalização */}
        <div className="facas-personalizadas__custom-banner">
          <div className="custom-banner__icon">
            <Palette size={48} />
          </div>
          <div className="custom-banner__content">
            <h3>✨ Personalizamos do Seu Jeito!</h3>
            <p>
              <strong>Crie a faca dos seus sonhos!</strong> Personalizamos com qualquer tema, logo, nome ou design que você imaginar. 
              Seja para presente, coleção ou uso pessoal - transformamos sua ideia em uma peça única e exclusiva.
            </p>
            <ul className="custom-banner__features">
              <li><Check size={16} /> Logos de empresas e marcas</li>
              <li><Check size={16} /> Times de futebol e esportes</li>
              <li><Check size={16} /> Bandas e artistas favoritos</li>
              <li><Check size={16} /> Nomes e datas especiais</li>
              <li><Check size={16} /> Símbolos e emblemas</li>
              <li><Check size={16} /> Qualquer tema que desejar</li>
            </ul>
            <button 
              className="btn-primary btn-personalize"
              onClick={() => {
                const mensagem = `Olá! Gostaria de personalizar uma faca exclusiva. Tenho uma ideia/tema em mente e gostaria de saber mais sobre o processo e valores.`
                window.open(`https://wa.me/5554999999999?text=${encodeURIComponent(mensagem)}`, '_blank')
              }}
            >
              <Sparkles size={20} />
              Quero Personalizar Minha Faca
            </button>
          </div>
        </div>

        {/* Categorias */}
        <div className="facas-personalizadas__categories">
          <h2>Explore Nossos Modelos</h2>
          <div className="facas-personalizadas__category-tabs">
            {Object.entries(categorias).map(([key, cat]) => (
              <button
                key={key}
                className={`facas-personalizadas__category-tab ${selectedCategory === key ? 'facas-personalizadas__category-tab--active' : ''}`}
                onClick={() => handleCategoryChange(key)}
              >
                {cat.nome}
              </button>
            ))}
          </div>
          <p className="facas-personalizadas__category-desc">{currentCategory.descricao}</p>
        </div>

        {/* Grid de Facas */}
        <div className="facas-personalizadas__grid">
          {currentCategory.facas.map((faca) => (
            <div 
              key={faca.id}
              className={`faca-card ${selectedFaca?.id === faca.id || (!selectedFaca && currentCategory.facas[0].id === faca.id) ? 'faca-card--active' : ''} ${faca.destaque ? 'faca-card--destaque' : ''}`}
              onClick={() => handleFacaChange(faca)}
            >
              <div className="faca-card__image">
                <img src={faca.imagens[0]} alt={faca.nome} />
                {faca.destaque && (
                  <span className="faca-card__badge">
                    <Star size={14} /> Destaque
                  </span>
                )}
              </div>
              <div className="faca-card__info">
                <h3>{faca.nome}</h3>
                <p>{faca.descricao.substring(0, 80)}...</p>
              </div>
            </div>
          ))}
        </div>

        {/* Detalhes da Faca Selecionada */}
        <div className="facas-personalizadas__detail">
          <div className="facas-personalizadas__gallery">
            <div className="facas-personalizadas__main-image" onClick={openLightbox}>
              <img 
                src={facaAtual.imagens[selectedImage]} 
                alt={facaAtual.nome}
              />
              {facaAtual.imagens.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="gallery-nav gallery-nav--next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="facas-personalizadas__thumbnails">
              {facaAtual.imagens.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'thumbnail--active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${facaAtual.nome} ${index + 1}`} />
                </button>
              ))}
            </div>

            {/* GIF Demonstração */}
            {facaAtual.gif && (
              <div className="facas-personalizadas__gif-container">
                <div className="gif-header">
                  <span className="gif-label">🎬 Demonstração em Vídeo</span>
                </div>
                <div className="gif-wrapper">
                  <img 
                    src={facaAtual.gif} 
                    alt={`Demonstração ${facaAtual.nome}`}
                    className="gif-preview"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="facas-personalizadas__info">
            <div className="facas-personalizadas__title-row">
              <h2>{facaAtual.nome}</h2>
              {facaAtual.destaque && (
                <span className="destaque-badge">
                  <Award size={16} /> Edição Especial
                </span>
              )}
            </div>
            
            <p className="facas-personalizadas__description">{facaAtual.descricao}</p>

            {/* Especificações */}
            <div className="facas-personalizadas__specs">
              <h4><Ruler size={18} /> Especificações Técnicas</h4>
              <div className="specs-grid">
                {Object.entries(facaAtual.specs).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Destaques */}
            <div className="facas-personalizadas__features">
              <h4><Sparkles size={18} /> Destaques</h4>
              <ul className="features-list">
                {facaAtual.destaques.map((item, index) => (
                  <li key={index}>
                    <Check size={16} className="check-icon" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preço */}
            <div className="facas-personalizadas__pricing">
              <span className="price-label">Preço:</span>
              <span className="price-value">{formatCurrency(PRECO_FACA)}</span>
            </div>

            {/* Ações */}
            <div className="facas-personalizadas__actions">
              <button 
                className="btn-primary btn-comprar" 
                onClick={() => addItem({
                  id: `faca-${facaAtual.id}`,
                  name: facaAtual.nome,
                  price: PRECO_FACA,
                  image: facaAtual.imagens[0],
                  category: 'faca'
                })}
              >
                <Plus size={20} />
                Adicionar ao Carrinho
              </button>
              <button className="btn-whatsapp" onClick={() => handleWhatsApp(facaAtual)}>
                <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                Consultar Disponibilidade
              </button>
            </div>

            {/* Artesanal Badge */}
            <div className="facas-personalizadas__artesanal">
              <Package size={20} />
              <span>Produto 100% artesanal - Cada peça é única</span>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="lightbox" onClick={closeLightbox}>
            <button className="lightbox__close" onClick={closeLightbox}>
              <X size={32} />
            </button>
            <img 
              src={facaAtual.imagens[selectedImage]} 
              alt={facaAtual.nome}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
              <ChevronLeft size={32} />
            </button>
            <button className="lightbox__nav lightbox__nav--next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
              <ChevronRight size={32} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default FacasPersonalizadas
