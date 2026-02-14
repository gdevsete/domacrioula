import ProductPage from '../components/ProductPage'
import '../components/ProductPage.css'

const EspetosPage = () => {
  const products = [
    {
      id: 'espeto-tradicional',
      name: 'Espeto Tradicional',
      tabName: 'Tradicional',
      description: 'O clássico espeto gaúcho em aço inox com cabo em madeira tratada. Diversos tamanhos disponíveis.',
      highlight: true,
      images: [],
      specs: {
        'Material': 'Aço Inox 304',
        'Tamanhos': '45cm, 55cm, 65cm, 75cm',
        'Cabo': 'Madeira tratada',
        'Espessura': '6mm'
      },
      features: ['Aço inoxidável', 'Cabo ergonômico', 'Vários tamanhos', 'Alta durabilidade']
    },
    {
      id: 'espeto-duplo',
      name: 'Espeto Duplo (Espada)',
      tabName: 'Duplo',
      description: 'Espeto duplo estilo espada, ideal para carnes maiores e picanha. Mantém a carne firme durante o giro.',
      highlight: true,
      images: [],
      specs: {
        'Material': 'Aço Inox 304',
        'Comprimento': '65cm',
        'Largura': '4cm',
        'Cabo': 'Madeira maciça'
      },
      features: ['Ideal para picanha', 'Giro uniforme', 'Profissional', 'Acabamento premium']
    },
    {
      id: 'espeto-tridente',
      name: 'Espeto Tridente',
      tabName: 'Tridente',
      description: 'Espeto com três pontas para carnes que precisam de maior fixação. Perfeito para linguiças e espetinhos.',
      highlight: false,
      images: [],
      specs: {
        'Material': 'Aço Inox',
        'Comprimento': '55cm',
        'Pontas': '3',
        'Cabo': 'Madeira'
      },
      features: ['Maior fixação', 'Ideal para linguiça', 'Versátil', 'Fácil manuseio']
    },
    {
      id: 'espeto-chato',
      name: 'Espeto Chato (Palito)',
      tabName: 'Chato',
      description: 'Espeto chato que evita que a carne gire. Ideal para espetinhos de carne, frango e legumes.',
      highlight: false,
      images: [],
      specs: {
        'Material': 'Aço Inox',
        'Comprimento': '45cm',
        'Formato': 'Chato',
        'Cabo': 'Madeira'
      },
      features: ['Não gira', 'Ideal para espetinhos', 'Prático', 'Fácil limpeza']
    },
    {
      id: 'conjunto-espetos',
      name: 'Conjunto 12 Espetos',
      tabName: 'Conjunto',
      description: 'Kit completo com 12 espetos em tamanhos variados. Acompanha suporte de mesa em madeira.',
      highlight: true,
      images: [],
      specs: {
        'Quantidade': '12 espetos',
        'Tamanhos': 'Variados',
        'Suporte': 'Madeira incluído',
        'Material': 'Aço Inox 304'
      },
      features: ['Kit completo', 'Suporte incluso', 'Presente ideal', 'Custo-benefício']
    },
    {
      id: 'espeto-personalizado',
      name: 'Espeto Personalizado',
      tabName: 'Personalizado',
      description: 'Espeto com cabo personalizado com seu nome ou logo. Gravação a laser em madeira nobre.',
      highlight: false,
      images: [],
      specs: {
        'Material': 'Aço Inox 304',
        'Gravação': 'A laser',
        'Cabo': 'Madeira nobre',
        'Tamanho': 'Sob consulta'
      },
      features: ['Personalização', 'Presente único', 'Madeira nobre', 'Gravação permanente']
    }
  ]

  return (
    <ProductPage
      title="Espetos Artesanais"
      subtitle="Espetos de aço inox com cabos em madeira tratada. Variedade de tamanhos e modelos para todos os tipos de cortes. Qualidade profissional para seu churrasco."
      products={products}
      customizationText="Personalize seus espetos com gravação a laser no cabo de madeira. Ideal para conjuntos de presente, uso pessoal ou brindes corporativos."
    />
  )
}

export default EspetosPage
