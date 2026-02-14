import { createContext, useContext, useState } from 'react'
import Checkout from '../components/Checkout'
import { useCart } from './CartContext'

const CheckoutContext = createContext()

export const CheckoutProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { clearCart } = useCart()

  const openCheckout = (productData, qty = 1) => {
    setProduct(productData)
    setQuantity(qty)
    setIsOpen(true)
  }

  const closeCheckout = () => {
    setIsOpen(false)
    setProduct(null)
    setQuantity(1)
  }

  const handleSuccess = () => {
    // Limpar carrinho após pagamento bem sucedido
    if (product?.items) {
      clearCart()
    }
    closeCheckout()
  }

  return (
    <CheckoutContext.Provider value={{ openCheckout, closeCheckout }}>
      {children}
      <Checkout 
        isOpen={isOpen} 
        onClose={closeCheckout} 
        product={product} 
        quantity={quantity}
        onSuccess={handleSuccess}
      />
    </CheckoutContext.Provider>
  )
}

export const useCheckout = () => {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}

export default CheckoutContext
