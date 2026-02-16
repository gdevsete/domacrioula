import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import './Products.css'

const Products = () => {
  const { getProducts, saveProduct, deleteProduct, addNotification } = useAdmin()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    stock: '',
    sku: '',
    active: true,
    featured: false
  })

  const categories = [
    { value: 'caixas-termicas', label: 'Caixas Térmicas' },
    { value: 'facas', label: 'Facas Personalizadas' },
    { value: 'kit-churrasco', label: 'Kit Churrasco' },
    { value: 'acessorios', label: 'Acessórios' },
    { value: 'espetos', label: 'Espetos' },
    { value: 'tabuas', label: 'Tábuas' },
    { value: 'aventais', label: 'Aventais' }
  ]

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    const data = await getProducts()
    setProducts(data)
    setLoading(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100)
  }

  const parseCurrency = (value) => {
    const numericValue = value.replace(/\D/g, '')
    return parseInt(numericValue) || 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'price' || name === 'originalPrice') {
      // Formatar como moeda
      const numericValue = parseCurrency(value)
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      image: '',
      stock: '',
      sku: '',
      active: true,
      featured: false
    })
    setShowModal(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      originalPrice: product.originalPrice || '',
      category: product.category || '',
      image: product.image || '',
      stock: product.stock || '',
      sku: product.sku || '',
      active: product.active !== false,
      featured: product.featured || false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      addNotification({
        type: 'error',
        title: 'Erro',
        message: 'Nome e preço são obrigatórios'
      })
      return
    }

    const productData = {
      ...formData,
      price: parseInt(formData.price) || 0,
      originalPrice: parseInt(formData.originalPrice) || 0,
      stock: parseInt(formData.stock) || 0
    }

    if (editingProduct) {
      productData.id = editingProduct.id
    }

    const success = await saveProduct(productData)
    if (success) {
      await loadProducts()
      setShowModal(false)
    }
  }

  const handleDelete = async (productId) => {
    const success = await deleteProduct(productId)
    if (success) {
      await loadProducts()
      setDeleteConfirm(null)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryLabel = (value) => {
    const category = categories.find(c => c.value === value)
    return category?.label || value
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-info">
          <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            Produtos
          </h1>
          <p>Gerencie o catálogo de produtos da sua loja</p>
        </div>
        <button className="btn-primary" onClick={handleNewProduct}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Novo Produto
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar produtos por nome, SKU ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="products-count">
          <span>{filteredProducts.length}</span> produtos
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <span>Carregando produtos...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className={`product-card ${!product.active ? 'inactive' : ''}`}>
                <div className="product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="no-image">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                    </div>
                  )}
                  {product.featured && (
                    <span className="badge featured">Destaque</span>
                  )}
                  {!product.active && (
                    <span className="badge inactive">Inativo</span>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-category">{getCategoryLabel(product.category)}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-pricing">
                    {product.originalPrice > product.price && (
                      <span className="original-price">{formatCurrency(product.originalPrice)}</span>
                    )}
                    <span className="current-price">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="product-meta">
                    {product.sku && <span className="sku">SKU: {product.sku}</span>}
                    <span className="stock">
                      Estoque: {product.stock || 0}
                    </span>
                  </div>
                </div>
                <div className="product-actions">
                  <button className="btn-edit" onClick={() => handleEditProduct(product)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => setDeleteConfirm(product.id)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
            <h3>Nenhum produto encontrado</h3>
            <p>
              {searchTerm
                ? 'Tente buscar com outros termos'
                : 'Comece adicionando seu primeiro produto'}
            </p>
            {!searchTerm && (
              <button className="btn-primary" onClick={handleNewProduct}>
                Adicionar Produto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Produto *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Caixa Térmica 45L"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Ex: CT-45L-001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o produto..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço *</label>
                  <div className="input-currency">
                    <span>R$</span>
                    <input
                      type="text"
                      name="price"
                      value={formData.price ? formatCurrency(formData.price).replace('R$', '').trim() : ''}
                      onChange={handleInputChange}
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Preço Original (riscado)</label>
                  <div className="input-currency">
                    <span>R$</span>
                    <input
                      type="text"
                      name="originalPrice"
                      value={formData.originalPrice ? formatCurrency(formData.originalPrice).replace('R$', '').trim() : ''}
                      onChange={handleInputChange}
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estoque</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL da Imagem</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row checkboxes">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Produto ativo
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Destacar produto
                </label>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3>Excluir Produto?</h3>
            <p>Esta ação não pode ser desfeita. O produto será removido permanentemente.</p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
