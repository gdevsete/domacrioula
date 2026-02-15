import { createContext, useContext, useState, useMemo } from 'react'
import { useAnalytics } from './AnalyticsContext'

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { trackEvent } = useAnalytics()

  // Adicionar item ao carrinho
  const addItem = (product) => {
    // Disparar evento AddToCart para Pixel
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price / 100, // Converter centavos para reais
      currency: 'BRL'
    })

    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  // Remover item do carrinho
  const removeItem = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  // Atualizar quantidade
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  // Limpar carrinho
  const clearCart = () => {
    setItems([])
  }

  // Calcular totais com desconto para caixas térmicas
  const cartTotals = useMemo(() => {
    // Separar caixas térmicas dos outros itens
    const caixasTermicas = items.filter(item => item.category === 'caixa-termica')
    const outrosItens = items.filter(item => item.category !== 'caixa-termica')

    // Total de caixas térmicas (quantidade)
    const totalCaixas = caixasTermicas.reduce((sum, item) => sum + item.quantity, 0)

    // Verificar se tem desconto (3 ou mais caixas)
    const hasDiscount = totalCaixas >= 3
    const discountPercentage = hasDiscount ? 20 : 0

    // Subtotal caixas térmicas
    const subtotalCaixas = caixasTermicas.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Desconto aplicado nas caixas
    const discountAmount = hasDiscount ? Math.round(subtotalCaixas * 0.20) : 0

    // Total caixas com desconto
    const totalCaixasComDesconto = subtotalCaixas - discountAmount

    // Subtotal outros itens
    const subtotalOutros = outrosItens.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    // Total geral
    const subtotal = subtotalCaixas + subtotalOutros
    const total = totalCaixasComDesconto + subtotalOutros

    return {
      items,
      caixasTermicas,
      outrosItens,
      totalCaixas,
      hasDiscount,
      discountPercentage,
      subtotalCaixas,
      discountAmount,
      totalCaixasComDesconto,
      subtotalOutros,
      subtotal,
      total,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }
  }, [items])

  // Calcular economia potencial (mostrar vantagem de comprar 3 caixas)
  const potentialSavings = useMemo(() => {
    const { caixasTermicas, totalCaixas, subtotalCaixas } = cartTotals
    
    if (totalCaixas >= 3) {
      return null // Já tem desconto
    }

    const caixasParaDesconto = 3 - totalCaixas
    
    // Se não tem caixa no carrinho, mostrar economia com 3 caixas de menor preço
    if (totalCaixas === 0) {
      return {
        caixasFaltando: 3,
        economiaEstimada: null,
        mensagem: 'Compre 3 caixas térmicas e ganhe 20% de desconto!'
      }
    }

    // Calcular economia se adicionar mais caixas para chegar a 3
    // Usar o preço médio ou o preço da caixa já no carrinho
    const precoMedioCaixa = subtotalCaixas / totalCaixas
    const subtotalCom3Caixas = subtotalCaixas + (precoMedioCaixa * caixasParaDesconto)
    const economiaEstimada = Math.round(subtotalCom3Caixas * 0.20)

    return {
      caixasFaltando: caixasParaDesconto,
      economiaEstimada,
      mensagem: `Adicione mais ${caixasParaDesconto} caixa${caixasParaDesconto > 1 ? 's' : ''} térmica${caixasParaDesconto > 1 ? 's' : ''} e economize até ${formatPrice(economiaEstimada)}!`
    }
  }, [cartTotals])

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      cartTotals,
      potentialSavings,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Helper para formatar preço
const formatPrice = (cents) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100)
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
