import ProductPage from '../components/ProductPage'
import '../components/ProductPage.css'

const AventaisPage = () => {
  const products = [
    {
      id: 'avental-couro',
      name: 'Avental Couro Legítimo',
      tabName: 'Couro',
      description: 'Avental profissional em couro legítimo bovino. Proteção total com estilo e elegância. O preferido dos churrasqueiros.',
      highlight: true,
      images: [],
      specs: {
        'Material': 'Couro bovino legítimo',
        'Tamanho': 'Único (ajustável)',
        'Alças': 'Couro com regulagem',
        'Bolsos': '2 frontais'
      },
      features: ['Couro legítimo', 'Resistente ao calor', 'Durável', 'Personalização disponível']
    },
    {
      id: 'avental-lona',
      name: 'Avental Lona Encerada',
      tabName: 'Lona',
      description: 'Avental em lona encerada, leve e resistente. Ideal para uso frequente com fácil manutenção.',
      highlight: false,
      images: [],
      specs: {
        'Material': 'Lona encerada',
        'Tamanho': 'Único (ajustável)',
        'Alças': 'Cadarço reforçado',
        'Bolsos': '3 frontais'
      },
      features: ['Leve', 'Fácil limpeza', 'Resistente', 'Preço acessível']
    },
    {
      id: 'avental-jeans',
      name: 'Avental Jeans Premium',
      tabName: 'Jeans',
      description: 'Avental em jeans pesado com detalhes em couro. Visual moderno e casual para o churrasqueiro estiloso.',
      highlight: true,
      images: [],
      specs: {
        'Material': 'Jeans 14oz',
        'Detalhes': 'Couro legítimo',
        'Tamanho': 'P, M, G, GG',
        'Bolsos': '4 funcionais'
      },
      features: ['Visual moderno', 'Confortável', 'Vários bolsos', 'Personalização bordada']
    },
    {
      id: 'avental-churrasqueiro',
      name: 'Avental Churrasqueiro Tradicional',
      tabName: 'Tradicional',
      description: 'Avental no estilo tradicional gaúcho. Proteção completa com a identidade cultural do Rio Grande do Sul.',
      highlight: false,
      images: [],
      specs: {
        'Material': 'Algodão reforçado',
        'Estilo': 'Tradicional gaúcho',
        'Tamanho': 'Único',
        'Extras': 'Porta-utensílios lateral'
      },
      features: ['Tradição gaúcha', 'Proteção completa', 'Porta-utensílios', 'Identidade cultural']
    },
    {
      id: 'avental-personalizado',
      name: 'Avental Personalizado',
      tabName: 'Personalizado',
      description: 'Avental totalmente personalizado com seu nome, logo ou design exclusivo. Bordado ou estampado.',
      highlight: true,
      images: [],
      specs: {
        'Material': 'À escolha',
        'Personalização': 'Bordado ou estampa',
        'Logo': 'Até 20x20cm',
        'Cores': 'Diversas opções'
      },
      features: ['100% personalizável', 'Bordado premium', 'Presente corporativo', 'Várias cores']
    },
    {
      id: 'kit-avental',
      name: 'Kit Avental + Luva',
      tabName: 'Kit',
      description: 'Conjunto completo com avental e luva térmica combinando. Proteção total para o churrasqueiro.',
      highlight: false,
      images: [],
      specs: {
        'Avental': 'Couro ou jeans',
        'Luva': 'Térmica resistente',
        'Embalagem': 'Caixa presente',
        'Tamanhos': 'Consultar'
      },
      features: ['Kit completo', 'Proteção térmica', 'Presente ideal', 'Embalagem premium']
    }
  ]

  return (
    <ProductPage
      title="Aventais"
      subtitle="Aventais de alta qualidade para churrasqueiros. Couro legítimo, lona, jeans e mais. Proteção com estilo e personalização disponível."
      products={products}
      customizationText="Todos os aventais podem ser personalizados com bordado ou estampa. Ideal para times de churrasco, bares, restaurantes e presentes corporativos."
    />
  )
}

export default AventaisPage
