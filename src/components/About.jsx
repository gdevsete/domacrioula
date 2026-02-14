import { Factory, Users, Award, Heart, MapPin, Package, Globe, Thermometer, Sword, Shield, Star, CheckCircle } from 'lucide-react'
import './About.css'

const About = () => {
  const stats = [
    { icon: <Factory size={32} />, number: '13+', label: 'Anos de Experiência' },
    { icon: <Package size={32} />, number: '5000+', label: 'Modelos Disponíveis' },
    { icon: <Award size={32} />, number: '300+', label: 'Peças por Dia' },
    { icon: <Globe size={32} />, number: '100%', label: 'Produção Própria' },
  ]

  const locations = [
    { city: 'Sapiranga - RS', type: 'Sede Principal', highlight: true },
    { city: 'Itapema - SC', type: 'Filial', highlight: false },
    { city: 'Curitiba - PR', type: 'Filial', highlight: false },
    { city: 'Chapecó - SC', type: 'Filial', highlight: false },
  ]

  const productLines = [
    { icon: <Thermometer size={24} />, name: 'Caixas Térmicas', desc: 'Em aço inox 316, de 30L a 500L, com isolamento premium' },
    { icon: <Sword size={24} />, name: 'Cutelaria Artesanal', desc: 'Facas, facões e machados com mais de 5.000 modelos' },
    { icon: <Shield size={24} />, name: 'Espadas e Katanas', desc: 'Peças para colecionadores e praticantes' },
    { icon: <Star size={24} />, name: 'Edições Limitadas', desc: 'Peças exclusivas numeradas para colecionadores' },
  ]

  const highlights = [
    'Mais de 13 anos de experiência no mercado',
    'Mais de 5.000 modelos diferentes disponíveis',
    'Produção diária de mais de 300 peças artesanais',
    '100% produção própria e artesanal',
    '1 loja principal + 3 filiais + rede de revendedores',
    'Entrega para todo o Brasil e exportação internacional',
  ]

  return (
    <section id="sobre" className="about section">
      <div className="container">
        {/* Header Section */}
        <div className="about__header">
          <h2 className="section-title">Sobre a Doma Crioula</h2>
          <p className="section-subtitle">A Arte da Cutelaria Gaúcha e Excelência em Caixas Térmicas</p>
        </div>

        {/* Main Content Grid */}
        <div className="about__grid">
          <div className="about__content">
            <h3 className="about__title">
              Tradição e Qualidade
              <span>Há Mais de 13 Anos</span>
            </h3>
            
            <div className="about__text">
              <p>
                A <strong>Doma Crioula</strong> nasceu da paixão pela tradição gaúcha e pelo 
                artesanato de excelência. Com mais de 13 anos no mercado, consolidamos nossa 
                posição como referência em <strong>cutelaria artesanal premium</strong> e 
                <strong> caixas térmicas em aço inoxidável 316</strong>, unindo técnicas 
                ancestrais e acabamento contemporâneo.
              </p>
              <p>
                Mantemos produção própria 100% artesanal, com um catálogo impressionante de 
                mais de <strong>5.000 modelos</strong> disponíveis entre facas, espadas, 
                machados e acessórios. Nossas caixas térmicas vão de 30 a 500 litros, 
                fabricadas com aço inox 316 resistente a sal, cloro e maresia.
              </p>
              <p>
                Inspirados pela cultura do Rio Grande do Sul e pela força dos tropeiros que 
                domavam a terra crioula, desenvolvemos produtos que unem herança, durabilidade 
                e design premium. Cada peça carrega a alma do pampa e a precisão de quem 
                respeita cada detalhe do processo artesanal.
              </p>
            </div>

            <a
              href="https://wa.me/5551998137009?text=Olá! Gostaria de saber mais sobre a Doma Crioula."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Fale Conosco
            </a>
          </div>

          <div className="about__stats">
            {stats.map((stat, index) => (
              <div key={index} className="about__stat-card">
                <div className="about__stat-icon">{stat.icon}</div>
                <div className="about__stat-number">{stat.number}</div>
                <div className="about__stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Lines */}
        <div className="about__products">
          <h3 className="about__section-title">Nossas Linhas de Produtos</h3>
          <div className="about__products-grid">
            {productLines.map((line, index) => (
              <div key={index} className="about__product-card">
                <div className="about__product-icon">{line.icon}</div>
                <h4>{line.name}</h4>
                <p>{line.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div className="about__locations">
          <h3 className="about__section-title">Onde Estamos</h3>
          <p className="about__locations-intro">
            Nossa sede e centro de produção ficam no coração do Rio Grande do Sul. 
            Além das lojas próprias, contamos com uma rede de revendedores autorizados em diversas regiões do Brasil.
          </p>
          <div className="about__locations-grid">
            {locations.map((loc, index) => (
              <div key={index} className={`about__location-card ${loc.highlight ? 'about__location-card--main' : ''}`}>
                <MapPin size={20} />
                <span className="about__location-city">{loc.city}</span>
                <span className="about__location-type">{loc.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="about__highlights">
          <h3 className="about__section-title">Números que Impressionam</h3>
          <div className="about__highlights-grid">
            {highlights.map((item, index) => (
              <div key={index} className="about__highlight-item">
                <CheckCircle size={20} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Commitment Banner */}
        <div className="about__commitment">
          <div className="about__commitment-content">
            <h3>Compromisso com a Excelência</h3>
            <p>
              Cada cliente da Doma Crioula recebe não apenas um produto, mas uma experiência 
              completa: desde a escolha entre milhares de modelos até o unboxing premium. 
              Nosso compromisso é com a satisfação total, a durabilidade e o orgulho de 
              possuir uma peça única que se torna patrimônio e é passada de geração em geração.
            </p>
          </div>
          <div className="about__commitment-badge">
            <Heart size={40} />
            <span>Do RS para o Mundo</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
