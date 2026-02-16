/**
 * API de Produtos (Supabase)
 * 
 * Rotas:
 * - GET /api/products - Listar produtos
 * - POST /api/products - Criar produto
 * - PUT /api/products - Atualizar produto
 * - DELETE /api/products?id={id} - Deletar produto
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseKey) return null
  return createClient(supabaseUrl, supabaseKey)
}

// Validar admin token
function validateAdminToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp < Date.now() || payload.role !== 'admin') {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return res.status(500).json({ error: 'Service not configured' })
  }

  // GET - Listar produtos (público)
  if (req.method === 'GET') {
    try {
      const { category, active, featured, id } = req.query

      // Buscar produto específico
      if (id) {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !product) {
          return res.status(404).json({ error: 'Produto não encontrado' })
        }

        return res.status(200).json({ product })
      }

      // Listar todos
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (category) {
        query = query.eq('category', category)
      }

      if (active !== undefined) {
        query = query.eq('active', active === 'true')
      }

      if (featured !== undefined) {
        query = query.eq('featured', featured === 'true')
      }

      const { data: products, error } = await query

      if (error) {
        console.error('Error fetching products:', error)
        return res.status(500).json({ error: 'Erro ao buscar produtos' })
      }

      // Mapear campos do banco para o frontend
      const mappedProducts = (products || []).map(p => ({
        ...p,
        active: p.active ?? p.in_stock ?? true,
        stock: p.stock ?? p.stock_quantity ?? 0,
        image: p.image || (p.images && p.images[0]) || '',
      }))

      return res.status(200).json({ 
        products: mappedProducts,
        total: mappedProducts.length
      })

    } catch (error) {
      console.error('Products GET error:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // POST/PUT/DELETE - Requer autenticação admin
  const admin = validateAdminToken(req.headers.authorization)
  if (!admin) {
    return res.status(401).json({ error: 'Não autorizado' })
  }

  // POST - Criar produto
  if (req.method === 'POST') {
    try {
      const { name, description, price, originalPrice, category, image, stock, sku, active, featured, images } = req.body

      if (!name || !price) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' })
      }

      const { data: product, error } = await supabase
        .from('products')
        .insert({
          name,
          description: description || '',
          price: parseInt(price),
          original_price: originalPrice ? parseInt(originalPrice) : null,
          category: category || 'outros',
          image: image || '',
          images: images || [],
          stock: stock ? parseInt(stock) : null,
          sku: sku || null,
          active: active !== false,
          featured: featured === true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({ error: 'Erro ao criar produto' })
      }

      return res.status(201).json({ 
        success: true,
        product: formatProduct(product)
      })

    } catch (error) {
      console.error('Products POST error:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // PUT - Atualizar produto
  if (req.method === 'PUT') {
    try {
      const { id, name, description, price, originalPrice, category, image, stock, sku, active, featured, images } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' })
      }

      const updates = {
        updated_at: new Date().toISOString()
      }

      if (name !== undefined) updates.name = name
      if (description !== undefined) updates.description = description
      if (price !== undefined) updates.price = parseInt(price)
      if (originalPrice !== undefined) updates.original_price = originalPrice ? parseInt(originalPrice) : null
      if (category !== undefined) updates.category = category
      if (image !== undefined) updates.image = image
      if (images !== undefined) updates.images = images
      if (stock !== undefined) updates.stock = stock ? parseInt(stock) : null
      if (sku !== undefined) updates.sku = sku
      if (active !== undefined) updates.active = active
      if (featured !== undefined) updates.featured = featured

      const { data: product, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating product:', error)
        return res.status(500).json({ error: 'Erro ao atualizar produto' })
      }

      return res.status(200).json({ 
        success: true,
        product: formatProduct(product)
      })

    } catch (error) {
      console.error('Products PUT error:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  // DELETE - Deletar produto
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({ error: 'ID do produto é obrigatório' })
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({ error: 'Erro ao deletar produto' })
      }

      return res.status(200).json({ 
        success: true,
        message: 'Produto deletado com sucesso'
      })

    } catch (error) {
      console.error('Products DELETE error:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

// Formatar produto para resposta
function formatProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    originalPrice: product.original_price,
    category: product.category,
    image: product.image,
    images: product.images || [],
    stock: product.stock,
    sku: product.sku,
    active: product.active,
    featured: product.featured,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  }
}
