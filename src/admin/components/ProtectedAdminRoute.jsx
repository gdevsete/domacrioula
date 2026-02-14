import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0f172a'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(196, 92, 44, 0.2)',
          borderTopColor: '#c45c2c',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedAdminRoute
