import ProductPage from '../components/ProductPage'
import '../components/ProductPage.css'

const AcessoriosChurrascoPage = () => {
  const products = [
    {
      id: 'avental-couro-artesanal',
      name: 'Avental Artesanal em Couro Legítimo',
      tabName: 'Avental Couro',
      price: 25699,
      category: 'acessorio',
      image: '/images/caixastermicas/kit-churrasco/acessorios/avental/avental1.png',
      description: 'Avental premium em couro legítimo marrom com acabamento artesanal de alta qualidade. Peça exclusiva com rebites metálicos, alças ajustáveis e argola lateral funcional para pendurar panos ou utensílios. Personalize com seu nome, logo de banda favorita, símbolo ou mensagem especial.',
      highlight: true,
      images: [
        '/images/caixastermicas/kit-churrasco/acessorios/avental/avental1.png',
        '/images/caixastermicas/kit-churrasco/acessorios/avental/avental2.png',
        '/images/caixastermicas/kit-churrasco/acessorios/avental/avental3.png'
      ],
      specs: {
        'Material': 'Couro legítimo marrom',
        'Alças': 'Ajustáveis com fivelas metálicas',
        'Acabamento': 'Artesanal com rebites metálicos',
        'Personalização': 'Relevo no couro',
        'Argola lateral': 'Para utensílios'
      },
      features: ['Couro legítimo', 'Personalização em relevo', 'Desenvolve pátina única', 'Artesanato 100% brasileiro'],
      destaques: [
        'Couro legítimo marrom de alta qualidade',
        'Personalização disponível - nome, logo, símbolo ou mensagem',
        'Alças ajustáveis com fivelas metálicas resistentes',
        'Argola lateral funcional para pendurar utensílios',
        'Acabamento artesanal premium com rebites metálicos',
        'Proteção total contra respingos e calor',
        'Desenvolve pátina única com o uso'
      ],
      personalizacao: [
        'Nome pessoal',
        'Logo de banda de rock (AC/DC, Metallica, Iron Maiden, Guns N\' Roses, etc)',
        'Símbolos e ícones personalizados',
        'Mensagens especiais',
        'Logo de negócio ou marca pessoal'
      ]
    },
    {
      id: 'abridor-bala-50',
      name: 'Abridor de Garrafas Réplica Bala .50',
      tabName: 'Abridor Bala .50',
      price: 9999,
      category: 'acessorio',
      image: '/images/caixastermicas/kit-churrasco/acessorios/abridor-de-garrafas-bala-50mm/abridorbaladeponto50-1.png',
      description: 'O Abridor de Garrafas Réplica Bala .50 é o presente perfeito para churrasqueiros, atiradores esportivos e colecionadores. Com corpo metálico dourado e gravação laser personalizada GRÁTIS, este abridor une funcionalidade com design exclusivo inspirado em munição calibre .50.',
      highlight: true,
      images: [
        '/images/caixastermicas/kit-churrasco/acessorios/abridor-de-garrafas-bala-50mm/abridorbaladeponto50-1.png',
        '/images/caixastermicas/kit-churrasco/acessorios/abridor-de-garrafas-bala-50mm/abridorbaladeponto50-2.png',
        '/images/caixastermicas/kit-churrasco/acessorios/abridor-de-garrafas-bala-50mm/abridorbaladeponto50-3.png'
      ],
      specs: {
        'Formato': 'Réplica bala calibre .50',
        'Material': 'Metal com acabamento dourado',
        'Comprimento': '13,5cm',
        'Peso': '123g',
        'Personalização': 'Gravação laser GRÁTIS',
        'Acompanha': 'Caixinha MDF personalizada'
      },
      features: ['Gravação laser GRÁTIS', 'Réplica fiel calibre .50', 'Acabamento dourado premium', 'Funcional e decorativo'],
      destaques: [
        'Réplica fiel de bala calibre .50 em tamanho real',
        'Corpo metálico dourado com acabamento premium',
        'Gravação laser GRÁTIS - personalize com nome, data ou frase',
        'Comprimento 13,5cm - tamanho ideal para uso',
        'Funcional e decorativo - abre garrafas com facilidade',
        'Acompanha caixinha MDF personalizada'
      ],
      personalizacao: [
        'Nome pessoal ou data especial',
        'Frase motivacional ou mensagem especial',
        'Ideal para presentes personalizados',
        'Brindes corporativos',
        'Decoração de bar e man cave'
      ]
    }
  ]

  const pageInfo = {
    title: 'Acessórios para Churrasco Personalizado',
    description: 'Acessórios exclusivos para o seu churrasco com personalização artesanal. Couro legítimo, gravação a laser e design único em cada peça.',
    category: 'Acessórios'
  }

  return (
    <ProductPage 
      title="Acessórios para Churrasco"
      subtitle="Acessórios exclusivos com personalização artesanal. Avental em couro legítimo e abridor de garrafas com gravação laser - peças únicas que combinam estilo, proteção e personalidade."
      products={products}
      customizationText="Personalize com seu nome, logo de banda favorita, símbolos ou mensagens especiais. Gravação em relevo no couro e gravação laser no abridor."
      showPersonalization={true}
    />
  )
}

export default AcessoriosChurrascoPage
