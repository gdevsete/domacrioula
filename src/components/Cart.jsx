import { X, Plus, Minus, Trash2, ShoppingBag, Tag, Sparkles } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useCheckout } from '../contexts/CheckoutContext'
import { formatCurrency } from '../services/podpayService'
import './Cart.css'

const Cart = () => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    cartTotals, 
    potentialSavings,
    isCartOpen, 
    setIsCartOpen 
  } = useCart()
  
  const { openCheckout } = useCheckout()

  const handleCheckout = () => {
    if (items.length === 0) return
    
    // Criar produto consolidado para o checkout
    const consolidatedProduct = {
      id: 'cart-checkout',
      name: `Pedido Doma Crioula (${cartTotals.itemCount} ${cartTotals.itemCount > 1 ? 'itens' : 'item'})`,
      price: cartTotals.total,
      image: items[0]?.image || '/images/logo/logo.png',
      items: items,
      hasDiscount: cartTotals.hasDiscount,
      discountAmount: cartTotals.discountAmount
    }
    
    openCheckout(consolidatedProduct, 1)
    setIsCartOpen(false)
  }

  if (!isCartOpen) return null

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header__title">
            <ShoppingBag size={24} />
            <h2>Carrinho</h2>
            <span className="cart-header__count">{cartTotals.itemCount}</span>
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={64} />
            <h3>Seu carrinho está vazio</h3>
            <p>Adicione produtos para continuar</p>
          </div>
        ) : (
          <>
            {/* Lista de itens */}
            <div className="cart-items">
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item__image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item__info">
                    <h4>{item.name}</h4>
                    {item.category === 'caixa-termica' && (
                      <span className="cart-item__badge">Caixa Térmica</span>
                    )}
                    <p className="cart-item__price">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="cart-item__actions">
                    <div className="cart-item__quantity">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                    <button className="cart-item__remove" onClick={() => removeItem(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Banner de desconto potencial */}
            {potentialSavings && (
              <div className="cart-discount-hint">
                <Sparkles size={20} />
                <div>
                  <strong>Aproveite!</strong>
                  <p>{potentialSavings.mensagem}</p>
                </div>
              </div>
            )}

            {/* Resumo */}
            <div className="cart-summary">
              {/* Subtotal caixas térmicas */}
              {cartTotals.caixasTermicas.length > 0 && (
                <div className="cart-summary__row">
                  <span>Subtotal Caixas Térmicas ({cartTotals.totalCaixas}x):</span>
                  <span>{formatCurrency(cartTotals.subtotalCaixas)}</span>
                </div>
              )}

              {/* Desconto aplicado */}
              {cartTotals.hasDiscount && (
                <div className="cart-summary__row cart-summary__discount">
                  <span>
                    <Tag size={16} />
                    Desconto 20% (3+ caixas):
                  </span>
                  <span>-{formatCurrency(cartTotals.discountAmount)}</span>
                </div>
              )}

              {/* Subtotal outros itens */}
              {cartTotals.outrosItens.length > 0 && (
                <div className="cart-summary__row">
                  <span>Outros itens:</span>
                  <span>{formatCurrency(cartTotals.subtotalOutros)}</span>
                </div>
              )}

              {/* Total */}
              <div className="cart-summary__row cart-summary__total">
                <span>Total:</span>
                <span>{formatCurrency(cartTotals.total)}</span>
              </div>

              {/* Economia */}
              {cartTotals.hasDiscount && (
                <div className="cart-summary__savings">
                  <Sparkles size={16} />
                  Você está economizando {formatCurrency(cartTotals.discountAmount)}!
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="cart-actions">
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                Finalizar Compra - PIX
              </button>
              <button className="cart-clear-btn" onClick={clearCart}>
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Cart
