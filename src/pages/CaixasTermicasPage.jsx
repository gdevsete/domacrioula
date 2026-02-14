import { useEffect } from 'react'
import CaixasTermicas from '../components/CaixasTermicas'

const CaixasTermicasPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return <CaixasTermicas />
}

export default CaixasTermicasPage
