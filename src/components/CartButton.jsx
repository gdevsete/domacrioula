import { ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import './CartButton.css'

const CartButton = () => {
  const { cartTotals, setIsCartOpen } = useCart()

  return (
    <button 
      className="cart-button" 
      onClick={() => setIsCartOpen(true)}
      aria-label="Abrir carrinho"
    >
      <ShoppingCart size={24} />
      {cartTotals.itemCount > 0 && (
        <span className="cart-button__badge">{cartTotals.itemCount}</span>
      )}
    </button>
  )
}

export default CartButton
