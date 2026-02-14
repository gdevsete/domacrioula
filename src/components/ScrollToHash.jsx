import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToHash = () => {
  const location = useLocation()

  useEffect(() => {
    // Se houver um hash na URL, scrollar para a seção
    if (location.hash) {
      const elementId = location.hash.replace('#', '')
      
      // Aguardar um pouco para garantir que o DOM foi renderizado
      setTimeout(() => {
        const element = document.getElementById(elementId)
        if (element) {
          const headerHeight = 80 // Altura do header fixo
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          })
        }
      }, 100)
    } else if (location.pathname === '/') {
      // Se for a home sem hash, scrollar para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [location])

  return null
}

export default ScrollToHash
