import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Thermometer, Ruler, Package, Check, Box, Weight, Layers, Settings, Wrench, Sparkles, ShoppingCart, Plus } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { formatCurrency } from '../services/podpayService'
import './CaixasTermicas.css'

const CaixasTermicas = () => {
  const [selectedSize, setSelectedSize] = useState('50L')
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const { addItem, cartTotals, potentialSavings } = useCart()

  // Dados das caixas térmicas por litragem
  const caixas = {
    '30L': {
      nome: 'Caixa Térmica 30 Litros',
      preco: 22999, // R$ 229,99 em centavos
      descricao: 'Compacta e resistente, a Caixa Térmica 30L da Doma Crioula é ideal para quem busca praticidade no transporte e conservação de bebidas ou alimentos em menor escala. Perfeita para uso pessoal, pequenos eventos ou apoio em estabelecimentos comerciais.',
      imagens: [
        '/images/caixastermicas/30L/1-30litros.png',
        '/images/caixastermicas/30L/2-30litros.png',
      ],
      specs: {
        capacidade: '30 Litros',
        armazenamento: 'Até 8 garrafas de 600ml ou 24 latas de 355ml',
        dimensoesExternas: '32cm (A) x 29cm (L) x 40cm (C)',
        dimensoesInternas: '25cm (A) x 25cm (L) x 36cm (C)',
        dimensoesEmbalagem: '35cm (A) x 35cm (L) x 46cm (C)',
        peso: '4 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 48h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Uso pessoal', 'Pequenos eventos', 'Apoio comercial', 'Piqueniques', 'Praia', 'Pescaria'],
    },
    '40L': {
      nome: 'Caixa Térmica 40 Litros',
      preco: 25999, // R$ 259,99 em centavos
      descricao: 'A Caixa Térmica 40L da Doma Crioula Caixas Térmicas é a combinação perfeita entre praticidade, resistência e conservação térmica. Ideal para eventos, pequenos comércios ou uso pessoal, ela garante ótimo desempenho com estrutura reforçada.',
      imagens: [
        '/images/caixastermicas/40L/1-40litros.png',
        '/images/caixastermicas/40L/2-40litros.png',
        '/images/caixastermicas/40L/3-40litros.png',
      ],
      specs: {
        capacidade: '40 Litros',
        armazenamento: 'Até 15 garrafas de 600ml ou 48 latas de 355ml',
        dimensoesExternas: '40cm (A) x 35cm (L) x 46cm (C)',
        dimensoesInternas: '30cm (A) x 29cm (L) x 39cm (C)',
        peso: '5 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 48h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Eventos', 'Pequenos comércios', 'Uso pessoal', 'Família pequena', 'Camping', 'Viagens'],
    },
    '50L': {
      nome: 'Caixa Térmica 50 Litros',
      preco: 29999, // R$ 299,99 em centavos
      descricao: 'A Caixa Térmica 50L da Doma Crioula Caixas Térmicas é uma solução prática e eficiente para quem busca conservação térmica e resistência em um tamanho compacto. Ideal para uso pessoal, em pequenos comércios, viagens ou eventos de menor porte.',
      imagens: [
        '/images/caixastermicas/50L/1-50litros.png',
        '/images/caixastermicas/50L/2-50litros.png',
        '/images/caixastermicas/50L/3-50litros.png',
        '/images/caixastermicas/50L/4-50litros.png',
        '/images/caixastermicas/50L/5-50litros.png',
      ],
      specs: {
        capacidade: '50 Litros',
        armazenamento: 'Até 22 garrafas de 600ml ou 68 latas de 355ml',
        dimensoesExternas: '35cm (A) x 39cm (L) x 65cm (C)',
        dimensoesInternas: '26cm (A) x 33cm (L) x 58cm (C)',
        peso: '10 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 72h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: true,
      usosRecomendados: ['Uso pessoal', 'Pequenos comércios', 'Viagens', 'Eventos', 'Camping', 'Pescaria'],
    },
    '75L': {
      nome: 'Caixa Térmica 75 Litros',
      preco: 34999, // R$ 349,99 em centavos
      descricao: 'A Caixa Térmica 75L da Doma Crioula Caixas Térmicas é ideal para quem busca praticidade, resistência e conservação térmica eficiente. Com estrutura reforçada e ótimo espaço interno, é perfeita para pequenos eventos, transporte de bebidas ou uso comercial.',
      imagens: [
        '/images/caixastermicas/75L/1-75litros.png',
        '/images/caixastermicas/75L/2-75litros.png',
        '/images/caixastermicas/75L/3-75litros.png',
        '/images/caixastermicas/75L/4-75litros.png',
        '/images/caixastermicas/75L/5-75litros.png',
      ],
      specs: {
        capacidade: '75 Litros',
        armazenamento: 'Até 40 garrafas de 600ml ou 100 latas de 355ml',
        dimensoesExternas: '45cm (A) x 42cm (L) x 77cm (C)',
        dimensoesInternas: '34cm (A) x 32cm (L) x 67cm (C)',
        peso: '16 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 72h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Pequenos eventos', 'Transporte de bebidas', 'Uso comercial', 'Grupos médios', 'Acampamentos'],
    },
    '90L': {
      nome: 'Caixa Térmica 90 Litros',
      preco: 42999, // R$ 429,99 em centavos
      descricao: 'Com excelente custo-benefício e alta eficiência térmica, a Caixa Térmica 90L da Doma Crioula Caixas Térmicas é ideal para quem precisa de uma solução resistente e funcional para armazenar bebidas com praticidade. Ótima opção para eventos, comércios e uso profissional.',
      imagens: [
        '/images/caixastermicas/90L/1-90litros.png',
        '/images/caixastermicas/90L/2-90litros.png',
        '/images/caixastermicas/90L/3-90litros.png',
      ],
      specs: {
        capacidade: '90 Litros',
        armazenamento: 'Até 60 garrafas de 600ml ou 140 latas de 355ml',
        dimensoesExternas: '50cm (A) x 48cm (L) x 80cm (C)',
        dimensoesInternas: '39cm (A) x 36cm (L) x 70cm (C)',
        peso: '18 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 72h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: true,
      usosRecomendados: ['Eventos', 'Comércios', 'Uso profissional', 'Churrascos grandes', 'Festas'],
    },
    '115L': {
      nome: 'Caixa Térmica 115 Litros',
      preco: 49999, // R$ 499,99 em centavos
      descricao: 'A Caixa Térmica 115L da Doma Crioula Caixas Térmicas é fabricada em Aço Inoxidável 316 com acabamento em pintura eletrostática. Ideal para conservar alimentos quentes ou frios, bebidas em geral, com isolamento térmico de alta performance.',
      imagens: [
        '/images/caixastermicas/115L/1-115litros.png',
        '/images/caixastermicas/115L/2-115litros.png',
        '/images/caixastermicas/115L/3-115litros.png',
      ],
      specs: {
        capacidade: '115 Litros',
        armazenamento: 'Até 52 garrafas de 600ml ou 110 latas de 355ml',
        dimensoesExternas: '52cm (A) x 48cm (L) x 80cm (C)',
        dimensoesInternas: '39cm (A) x 38cm (L) x 70cm (C)',
        peso: '19,5 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm)',
        manutencaoGelo: 'Até 96h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Eventos médios', 'Buffets', 'Pesca esportiva', 'Conservação de alimentos', 'Uso comercial'],
    },
    '150L': {
      nome: 'Caixa Térmica 150 Litros',
      preco: 56999, // R$ 569,99 em centavos
      descricao: 'A Caixa Térmica 150L da Doma Crioula Caixas Térmicas é a escolha ideal para quem busca um equilíbrio entre capacidade, resistência e isolamento térmico de alta performance. Indicada para uso profissional ou eventos, ela oferece praticidade no transporte e excelente conservação das bebidas.',
      imagens: [
        '/images/caixastermicas/150L/1-150litros.png',
        '/images/caixastermicas/150L/2-150litros.png',
        '/images/caixastermicas/150L/3-150litros.png',
      ],
      specs: {
        capacidade: '150 Litros',
        armazenamento: 'Até 72 garrafas de 600ml ou 170 latas de 355ml',
        dimensoesExternas: '54cm (A) x 48cm (L) x 85cm (C)',
        dimensoesInternas: '43cm (A) x 38cm (L) x 75cm (C)',
        peso: '21 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 96h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: true,
      usosRecomendados: ['Uso profissional', 'Grandes eventos', 'Comércio', 'Transporte', 'Buffets'],
    },
    '180L': {
      nome: 'Caixa Térmica 180 Litros',
      preco: 63999, // R$ 639,99 em centavos
      descricao: 'A Caixa Térmica 180L da Doma Crioula Caixas Térmicas é uma excelente escolha para quem precisa de capacidade elevada, estrutura reforçada e excelente isolamento térmico. Ideal para uso profissional, transporte de bebidas e conservação de alimentos em grandes volumes.',
      imagens: [
        '/images/caixastermicas/180L/1-180litros.png',
        '/images/caixastermicas/180L/2-180litros.png',
        '/images/caixastermicas/180L/3-180litros.png',
        '/images/caixastermicas/180L/4-180litros.png',
      ],
      specs: {
        capacidade: '180 Litros',
        armazenamento: 'Até 120 garrafas de 600ml ou 252 latas de 355ml',
        dimensoesExternas: '65cm (A) x 55cm (L) x 87cm (C)',
        dimensoesInternas: '54cm (A) x 45cm (L) x 77cm (C)',
        peso: '27 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 96h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Uso profissional', 'Transporte de bebidas', 'Conservação de alimentos', 'Distribuidores', 'Eventos grandes'],
    },
    '250L': {
      nome: 'Caixa Térmica 250 Litros',
      preco: 75999, // R$ 759,99 em centavos
      descricao: 'Projetada para quem busca alta capacidade de armazenamento, resistência e excelente conservação térmica, a Caixa Térmica 250L da Doma Crioula Caixas Térmicas é ideal para uso profissional, eventos, transporte de bebidas e ambientes que exigem performance.',
      imagens: [
        '/images/caixastermicas/250L/1-250litros.png',
        '/images/caixastermicas/250L/2-250litros.png',
        '/images/caixastermicas/250L/3-250litros.png',
        '/images/caixastermicas/250L/4-250litros.png',
      ],
      specs: {
        capacidade: '250 Litros',
        armazenamento: 'Até 180 garrafas de 600ml ou 368 latas de 355ml',
        dimensoesExternas: '70cm (A) x 61cm (L) x 95cm (C)',
        dimensoesInternas: '60cm (A) x 52cm (L) x 85cm (C)',
        peso: '32 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 120h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: false,
      usosRecomendados: ['Uso profissional', 'Eventos', 'Transporte de bebidas', 'Indústria', 'Alta performance'],
    },
    '380L': {
      nome: 'Caixa Térmica 380 Litros',
      preco: 87999, // R$ 879,99 em centavos (tabela original: 360L)
      descricao: 'Para quem busca grande capacidade, resistência e excelente conservação térmica, a Caixa Térmica 380L da Doma Crioula Caixas Térmicas é a solução ideal. Seu design robusto e materiais de alta qualidade garantem durabilidade e desempenho mesmo nos usos mais exigentes, sendo perfeita para eventos, comércios e ambientes profissionais.',
      imagens: [
        '/images/caixastermicas/380L/1-380litros.png',
        '/images/caixastermicas/380L/2-380litros.png',
        '/images/caixastermicas/380L/3-380litros.png',
        '/images/caixastermicas/380L/4-380litros.png',
      ],
      specs: {
        capacidade: '380 Litros',
        armazenamento: 'Até 240 garrafas de 600ml ou 600 latas de 355ml',
        dimensoesExternas: '79cm (A) x 68cm (L) x 107cm (C)',
        dimensoesInternas: '69cm (A) x 58cm (L) x 97cm (C)',
        peso: '39 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm laterais / 40mm tampa)',
        manutencaoGelo: 'Até 120h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: true,
      usosRecomendados: ['Eventos', 'Comércios', 'Ambientes profissionais', 'Indústrias', 'Frigoríficos', 'Logística'],
    },
    '500L': {
      nome: 'Caixa Térmica 500 Litros',
      preco: 109999, // R$ 1.099,99 em centavos
      descricao: 'A Caixa Térmica 500L da Doma Crioula Caixas Térmicas é nossa maior capacidade. Fabricada em Aço Inoxidável 316 com acabamento em pintura eletrostática e isolamento térmico de alta performance. Ideal para conservar alimentos quentes ou frios, bebidas em geral, indústrias, peixarias e grandes operações logísticas.',
      imagens: [
        '/images/caixastermicas/500L/1-500litros.png',
        '/images/caixastermicas/500L/2-500litros.png',
        '/images/caixastermicas/500L/3-500litros.png',
        '/images/caixastermicas/500L/4-500litros.png',
      ],
      specs: {
        capacidade: '500 Litros',
        armazenamento: 'Até 375 garrafas de 600ml ou 400 latas de 355ml',
        dimensoesExternas: '89cm (A) x 80cm (L) x 105cm (C)',
        dimensoesInternas: '76cm (A) x 70cm (L) x 95cm (C)',
        peso: '47 kg',
        isolamento: 'Poliestireno alta densidade P1 (50mm)',
        manutencaoGelo: 'Até 120h',
      },
      estrutura: {
        externa: 'Aço Inoxidável 316 com pintura eletrostática (pó) - resistente a sal, cloro e maresia',
        interna: 'Aço Inoxidável 316 com acabamento em borracha sintética - resistente a sal, cloro e maresia',
        isolamento: 'Poliestireno de alta densidade tipo P1 - mesmo utilizado em câmaras frias',
      },
      funcionalidades: [
        'Dobradiça reforçada tipo L com descanso para tampa',
        'Alça retrátil reforçada para melhor empunhadura',
        'Fecho rápido de pressão',
        'Cantoneiras (mata-juntas) nas extremidades - acabamento reforçado',
      ],
      opcionais: [
        'Dreno para escoamento de água',
        'Rodinhas deslizantes (com acréscimo)',
        'Personalização com identidade visual',
        'Fabricação sob medida disponível',
      ],
      destaque: true,
      usosRecomendados: ['Peixarias', 'Indústrias', 'Logística pesada', 'Frigoríficos', 'Conservação de alimentos'],
    },
  }

  const sizes = Object.keys(caixas)
  const currentCaixa = caixas[selectedSize]

  const handleSizeChange = (size) => {
    setSelectedSize(size)
    setSelectedImage(0)
  }

  const nextImage = () => {
    setSelectedImage((prev) => 
      prev === currentCaixa.imagens.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? currentCaixa.imagens.length - 1 : prev - 1
    )
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse na ${currentCaixa.nome}. Gostaria de mais informações e valores.`
    )
    window.open(`https://wa.me/5551998137009?text=${message}`, '_blank')
  }

  return (
    <section id="caixas-termicas" className="caixas-termicas section">
      <div className="container">
        {/* Header da seção */}
        <div className="caixas-termicas__header">
          <h2 className="section-title">Caixas Térmicas</h2>
          <p className="section-subtitle">
            Linha completa de caixas térmicas de alta qualidade, fabricadas com 
            isolamento em poliuretano expandido para máxima conservação térmica.
            De 30L a 500L para todas as necessidades.
          </p>
        </div>

        {/* Tabs de tamanhos */}
        <div className="caixas-termicas__tabs">
          <div className="caixas-termicas__tabs-wrapper">
            {sizes.map((size) => (
              <button
                key={size}
                className={`caixas-termicas__tab ${selectedSize === size ? 'caixas-termicas__tab--active' : ''} ${caixas[size].destaque ? 'caixas-termicas__tab--destaque' : ''}`}
                onClick={() => handleSizeChange(size)}
              >
                {size}
                {caixas[size].destaque && <span className="tab-badge">★</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo do produto selecionado */}
        <div className="caixas-termicas__content">
          {/* Galeria de imagens */}
          <div className="caixas-termicas__gallery">
            <div className="caixas-termicas__main-image">
              <img
                src={currentCaixa.imagens[selectedImage]}
                alt={`${currentCaixa.nome} - Imagem ${selectedImage + 1}`}
                onClick={() => setLightboxOpen(true)}
              />
              {currentCaixa.imagens.length > 1 && (
                <>
                  <button className="gallery-nav gallery-nav--prev" onClick={prevImage}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="gallery-nav gallery-nav--next" onClick={nextImage}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
              <div className="gallery-counter">
                {selectedImage + 1} / {currentCaixa.imagens.length}
              </div>
            </div>

            {/* Miniaturas */}
            <div className="caixas-termicas__thumbnails">
              {currentCaixa.imagens.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'thumbnail--active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`Miniatura ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Informações do produto */}
          <div className="caixas-termicas__info">
            <div className="caixas-termicas__title-wrapper">
              <h3 className="caixas-termicas__title">{currentCaixa.nome}</h3>
              {currentCaixa.destaque && (
                <span className="destaque-badge">Mais Vendido</span>
              )}
            </div>

            <p className="caixas-termicas__description">{currentCaixa.descricao}</p>

            {/* Especificações */}
            <div className="caixas-termicas__specs">
              <h4>Especificações Técnicas</h4>
              <div className="specs-grid">
                <div className="spec-item">
                  <Thermometer size={20} />
                  <div>
                    <strong>Capacidade</strong>
                    <span>{currentCaixa.specs.capacidade}</span>
                  </div>
                </div>
                {currentCaixa.specs.armazenamento && (
                  <div className="spec-item">
                    <Box size={20} />
                    <div>
                      <strong>Armazenamento</strong>
                      <span>{currentCaixa.specs.armazenamento}</span>
                    </div>
                  </div>
                )}
                <div className="spec-item">
                  <Ruler size={20} />
                  <div>
                    <strong>Dimensões Externas</strong>
                    <span>{currentCaixa.specs.dimensoesExternas || currentCaixa.specs.dimensoes}</span>
                  </div>
                </div>
                {currentCaixa.specs.dimensoesInternas && (
                  <div className="spec-item">
                    <Layers size={20} />
                    <div>
                      <strong>Dimensões Internas</strong>
                      <span>{currentCaixa.specs.dimensoesInternas}</span>
                    </div>
                  </div>
                )}
                <div className="spec-item">
                  <Weight size={20} />
                  <div>
                    <strong>Peso</strong>
                    <span>{currentCaixa.specs.peso}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <Package size={20} />
                  <div>
                    <strong>Isolamento</strong>
                    <span>{currentCaixa.specs.isolamento}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <Thermometer size={20} />
                  <div>
                    <strong>Conservação</strong>
                    <span>{currentCaixa.specs.manutencaoGelo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estrutura e Materiais - somente se existir */}
            {currentCaixa.estrutura && (
              <div className="caixas-termicas__estrutura">
                <h4><Wrench size={18} /> Estrutura e Materiais</h4>
                <ul className="estrutura-list">
                  <li>
                    <strong>Caixa externa:</strong> {currentCaixa.estrutura.externa}
                  </li>
                  <li>
                    <strong>Caixa interna:</strong> {currentCaixa.estrutura.interna}
                  </li>
                  <li>
                    <strong>Isolamento:</strong> {currentCaixa.estrutura.isolamento}
                  </li>
                </ul>
              </div>
            )}

            {/* Funcionalidades - somente se existir */}
            {currentCaixa.funcionalidades && (
              <div className="caixas-termicas__funcionalidades">
                <h4><Settings size={18} /> Detalhes Funcionais</h4>
                <ul className="funcionalidades-list">
                  {currentCaixa.funcionalidades.map((func, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {func}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Opcionais - somente se existir */}
            {currentCaixa.opcionais && (
              <div className="caixas-termicas__opcionais">
                <h4><Sparkles size={18} /> Extras e Personalizações</h4>
                <ul className="opcionais-list">
                  {currentCaixa.opcionais.map((opcional, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {opcional}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Usos recomendados */}
            <div className="caixas-termicas__usos">
              <h4>Indicado para</h4>
              <div className="usos-list">
                {currentCaixa.usosRecomendados.map((uso, index) => (
                  <span key={index} className="uso-tag">
                    <Check size={14} />
                    {uso}
                  </span>
                ))}
              </div>
            </div>

            {/* Preço e Botões de ação */}
            <div className="caixas-termicas__pricing">
              <div className="caixas-termicas__price">
                <span className="price-label">Preço:</span>
                <span className="price-value">{formatCurrency(currentCaixa.preco)}</span>
              </div>
            </div>

            {/* Banner de desconto */}
            {potentialSavings && (
              <div className="caixas-termicas__discount-hint">
                <Sparkles size={18} />
                <span>{potentialSavings.mensagem}</span>
              </div>
            )}

            {/* Desconto ativo */}
            {cartTotals.hasDiscount && (
              <div className="caixas-termicas__discount-active">
                <Check size={18} />
                <span>Desconto de 20% aplicado! Você economiza {formatCurrency(cartTotals.discountAmount)}</span>
              </div>
            )}

            <div className="caixas-termicas__actions">
              <button 
                className="btn btn-primary btn-comprar" 
                onClick={() => addItem({
                  id: `caixa-${selectedSize}`,
                  name: currentCaixa.nome,
                  price: currentCaixa.preco,
                  image: currentCaixa.imagens[0],
                  category: 'caixa-termica'
                })}
              >
                <Plus size={20} />
                Adicionar ao Carrinho
              </button>
              <button className="btn btn-whatsapp" onClick={handleWhatsApp}>
                <img src="/images/logo/iconWhatsApp.png" alt="WhatsApp" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                Fale Conosco
              </button>
              <p className="caixas-termicas__contact-hint">
                Adicione 3 caixas e ganhe 20% de desconto!
              </p>
            </div>
          </div>
        </div>

        {/* Banner de personalização */}
        <div className="caixas-termicas__custom-banner">
          <div className="custom-banner__content">
            <h3>Personalização Disponível</h3>
            <p>
              Todas as nossas caixas térmicas podem ser personalizadas com a 
              logomarca da sua empresa. Ideal para brindes corporativos e 
              identificação de frota.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => {
            const message = encodeURIComponent('Olá! Gostaria de informações sobre personalização de caixas térmicas com logo.')
            window.open(`https://wa.me/5551998137009?text=${message}`, '_blank')
          }}>
            Consultar Personalização
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox__close" onClick={() => setLightboxOpen(false)}>
            <X size={32} />
          </button>
          <img
            src={currentCaixa.imagens[selectedImage]}
            alt={currentCaixa.nome}
            onClick={(e) => e.stopPropagation()}
          />
          {currentCaixa.imagens.length > 1 && (
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

export default CaixasTermicas
