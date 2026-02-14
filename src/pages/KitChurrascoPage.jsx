import ProductPage from '../components/ProductPage'
import '../components/ProductPage.css'

const KitChurrascoPage = () => {
  const products = [
    {
      id: 'kit-gold-3-pecas',
      name: 'Kit Churrasco 3 Peças Gold',
      tabName: 'Gold 3 Peças',
      price: 27999,
      category: 'kit-churrasco',
      image: '/images/caixastermicas/kit-churrasco/kit-churrasco-3-pecas-gold/kitgold3pecas1.png',
      description: 'O Kit Churrasco 3 Peças Gold é o conjunto completo para churrasqueiros exigentes. Com faca 8", garfo e chaira, todos com cabo em resina dourada com folhas encapsuladas, este kit une funcionalidade profissional com design exclusivo e sofisticado.',
      highlight: true,
      images: [
        '/images/caixastermicas/kit-churrasco/kit-churrasco-3-pecas-gold/kitgold3pecas1.png',
        '/images/caixastermicas/kit-churrasco/kit-churrasco-3-pecas-gold/kitgold3pecas2.png',
        '/images/caixastermicas/kit-churrasco/kit-churrasco-3-pecas-gold/kitgold3pecas3.png'
      ],
      specs: {
        'Faca': '8 polegadas em aço inox polido',
        'Garfo': 'Aço inox com 2 pontas reforçadas',
        'Chaira': 'Haste em aço inox profissional',
        'Cabos': 'Resina dourada com folhas naturais',
        'Estojo': 'Couro premium com divisórias',
        'Peso total': '600g'
      },
      features: ['Cabo resina dourada exclusivo', 'Estojo couro premium', 'Garantia vitalícia', 'Presente sofisticado'],
      destaques: [
        'Faca 8 polegadas em aço inox polido para cortes precisos',
        'Garfo de churrasco com pontas afiadas e resistentes',
        'Chaira profissional para manter o fio perfeito',
        'Cabo resina dourada com folhas naturais encapsuladas',
        'Estojo em couro premium para armazenamento e transporte',
        'Garantia vitalícia Doma Crioula em todas as peças'
      ]
    },
    {
      id: 'kit-petisco-elegance',
      name: 'Kit Petisco Elegance',
      tabName: 'Petisco Elegance',
      price: 15999,
      category: 'kit-petisco',
      image: '/images/caixastermicas/kit-churrasco/kit-petisco-elegante/kit-petisco-elegance1.png',
      description: 'O Kit Petisco Elegance é o conjunto perfeito para servir petiscos, queijos e aperitivos com sofisticação. Com garfo tridente grande e 6 garfinhos dourados em base de madeira nobre, este kit eleva o nível de qualquer evento.',
      highlight: true,
      images: [
        '/images/caixastermicas/kit-churrasco/kit-petisco-elegante/kit-petisco-elegance1.png',
        '/images/caixastermicas/kit-churrasco/kit-petisco-elegante/kit-petisco-elegance2.png',
        '/images/caixastermicas/kit-churrasco/kit-petisco-elegante/kit-petisco-elegance3.png'
      ],
      specs: {
        'Garfo tridente': 'Metal com acabamento dourado',
        'Garfinhos': '6 unidades douradas',
        'Base': 'Madeira nobre polida',
        'Acabamento': 'Premium em todas as peças',
        'Peso': '400g',
        'Peças': '7 peças (1 tridente + 6 garfinhos)'
      },
      features: ['Acabamento dourado premium', 'Base madeira nobre', 'Ideal para eventos', 'Design sofisticado'],
      destaques: [
        '1 garfo tridente grande em metal dourado premium',
        '6 garfinhos individuais com acabamento dourado',
        'Base em madeira nobre para organização elegante',
        'Acabamento premium em todos os detalhes',
        'Design sofisticado para mesa posta',
        'Pronto para uso em festas e eventos'
      ]
    }
  ]

  return (
    <ProductPage
      title="Kit Churrasco"
      subtitle="Conjuntos premium para churrasqueiros exigentes. Kits com acabamento artesanal e materiais nobres, perfeitos para uso próprio ou presente. Garantia vitalícia Doma Crioula."
      products={products}
      customizationText="Personalize seu kit com gravação a laser nos cabos. Ideal para presentes corporativos, casamentos, formaturas e ocasiões especiais."
    />
  )
}

export default KitChurrascoPage
