import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import ScrollToHash from './components/ScrollToHash'
import Cart from './components/Cart'
import CartButton from './components/CartButton'
import AnalyticsTracker from './components/AnalyticsTracker'
import { CartProvider } from './contexts/CartContext'
import { CheckoutProvider } from './contexts/CheckoutContext'
import { AuthProvider } from './contexts/AuthContext'
import { AnalyticsProvider } from './contexts/AnalyticsContext'
import Home from './pages/Home'
import CaixasTermicasPage from './pages/CaixasTermicasPage'
import FacasPage from './pages/FacasPage'
import KitChurrascoPage from './pages/KitChurrascoPage'
import AcessoriosChurrascoPage from './pages/AcessoriosChurrascoPage'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import UserPanel from './pages/UserPanel'
import TrackOrder from './pages/TrackOrder'
import './App.css'

// Admin imports
import { AdminProvider } from './admin/contexts/AdminContext'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedAdminRoute from './admin/components/ProtectedAdminRoute'
import AdminLogin from './admin/pages/AdminLogin'
import Dashboard from './admin/pages/Dashboard'
import Orders from './admin/pages/Orders'
import Products from './admin/pages/Products'
import Customers from './admin/pages/Customers'
import Reports from './admin/pages/Reports'
import Settings from './admin/pages/Settings'
import Analytics from './admin/pages/Analytics'

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnalyticsProvider>
          <CartProvider>
            <CheckoutProvider>
              <AdminProvider>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/*" element={
                    <ProtectedAdminRoute>
                      <AdminLayout>
                        <Routes>
                          <Route index element={<Dashboard />} />
                          <Route path="pedidos" element={<Orders />} />
                          <Route path="produtos" element={<Products />} />
                          <Route path="clientes" element={<Customers />} />
                          <Route path="relatorios" element={<Reports />} />
                          <Route path="analytics" element={<Analytics />} />
                          <Route path="configuracoes" element={<Settings />} />
                        </Routes>
                      </AdminLayout>
                    </ProtectedAdminRoute>
                  } />
                  
                  {/* Store Routes */}
                  <Route path="/*" element={
                    <>
                      <AnalyticsTracker />
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
                            <Route path="/esqueci-senha" element={<ForgotPassword />} />
                            <Route path="/minha-conta" element={<UserPanel />} />
                            <Route path="/rastrear" element={<TrackOrder />} />
                          </Routes>
                        </main>
                        <Footer />
                        <CartButton />
                        <Cart />
                        <WhatsAppButton />
                      </div>
                    </>
                  } />
                </Routes>
              </AdminProvider>
            </CheckoutProvider>
          </CartProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
