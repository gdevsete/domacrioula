import ProductPage from '../components/ProductPage'
import '../components/ProductPage.css'

const TabuasPage = () => {
  const products = [
    {
      id: 'tabua-retangular',
      name: 'Tábua Retangular Premium',
      tabName: 'Retangular',
      description: 'Tábua retangular em madeira nobre, ideal para corte e apresentação de carnes. Acabamento refinado.',
      highlight: true,
      images: [],
      specs: {
        'Dimensões': '50x30cm',
        'Espessura': '3cm',
        'Madeira': 'Teca',
        'Acabamento': 'Óleo mineral'
      },
      features: ['Madeira nobre', 'Fácil limpeza', 'Durável', 'Ideal para apresentação']
    },
    {
      id: 'tabua-redonda',
      name: 'Tábua Redonda Rústica',
      tabName: 'Redonda',
      description: 'Tábua redonda com acabamento rústico. Perfeita para servir petiscos e tábuas de frios.',
      highlight: false,
      images: [],
      specs: {
        'Diâmetro': '40cm',
        'Espessura': '2,5cm',
        'Madeira': 'Pinus tratado',
        'Acabamento': 'Rústico natural'
      },
      features: ['Estilo rústico', 'Versátil', 'Leve', 'Preço acessível']
    },
    {
      id: 'tabua-trilho',
      name: 'Tábua Trilho (Costela)',
      tabName: 'Trilho',
      description: 'Tábua alongada ideal para servir costela, picanha e cortes grandes. Design elegante.',
      highlight: true,
      images: [],
      specs: {
        'Dimensões': '80x25cm',
        'Espessura': '3cm',
        'Madeira': 'Teca',
        'Acabamento': 'Premium'
      },
      features: ['Ideal para costela', 'Design elegante', 'Resistente', 'Impressiona na mesa']
    },
    {
      id: 'tabua-churrasco',
      name: 'Tábua Churrasco com Canaleta',
      tabName: 'Com Canaleta',
      description: 'Tábua profissional com canaleta para recolher o suco da carne. Indispensável para churrasqueiros.',
      highlight: false,
      images: [],
      specs: {
        'Dimensões': '45x35cm',
        'Espessura': '4cm',
        'Madeira': 'Teca',
        'Canaleta': 'Profunda 1cm'
      },
      features: ['Canaleta funcional', 'Profissional', 'Fácil limpeza', 'Durabilidade']
    },
    {
      id: 'tabua-personalizada',
      name: 'Tábua Personalizada',
      tabName: 'Personalizada',
      description: 'Tábua com gravação personalizada. Seu nome, logo ou frase especial. Presente único e memorável.',
      highlight: true,
      images: [],
      specs: {
        'Dimensões': 'Sob medida',
        'Gravação': 'A laser',
        'Madeira': 'À escolha',
        'Acabamento': 'Premium'
      },
      features: ['100% personalizada', 'Gravação a laser', 'Presente único', 'Várias madeiras']
    }
  ]

  return (
    <ProductPage
      title="Tábuas de Corte"
      subtitle="Tábuas de madeira nobre para corte e apresentação. Fabricadas com acabamento refinado que valoriza seu churrasco e impressiona seus convidados."
      products={products}
      customizationText="Personalize sua tábua com gravação a laser. Ideal para presentes, lembranças de casamento, brindes corporativos e uso pessoal."
    />
  )
}

export default TabuasPage
