import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToHash from './components/ScrollToHash'
import Cart from './components/Cart'
import CartButton from './components/CartButton'
import { CartProvider } from './contexts/CartContext'
import { CheckoutProvider } from './contexts/CheckoutContext'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import CaixasTermicasPage from './pages/CaixasTermicasPage'
import FacasPage from './pages/FacasPage'
import KitChurrascoPage from './pages/KitChurrascoPage'
import AcessoriosChurrascoPage from './pages/AcessoriosChurrascoPage'
import Login from './pages/Login'
import Register from './pages/Register'
import UserPanel from './pages/UserPanel'
import TrackOrder from './pages/TrackOrder'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <CheckoutProvider>
            <ScrollToHash />
            <div className="app">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/caixas-termicas" element={<CaixasTermicasPage />} />
                  <Route path="/facas-personalizadas" element={<FacasPage />} />
                  <Route path="/kit-churrasco" element={<KitChurrascoPage />} />
                  <Route path="/acessorios-churrasco" element={<AcessoriosChurrascoPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/minha-conta" element={<UserPanel />} />
                  <Route path="/rastrear" element={<TrackOrder />} />
                </Routes>
              </main>
              <Footer />
              <CartButton />
              <Cart />
              <WhatsAppButton />
            </div>
          </CheckoutProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
