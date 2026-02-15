/**
 * API de Reset de Senha
 * POST /api/auth/reset-password
 * Verifica código e atualiza senha
 */

import { createClient } from '@supabase/supabase-js'

const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, code, newPassword } = req.body

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' })
    }

    // Buscar código válido
    const { data: resetCode, error: codeError } = await supabase
      .from('password_reset_codes')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (codeError || !resetCode) {
      return res.status(400).json({ error: 'Código inválido ou expirado' })
    }

    // O user_id na tabela users É o próprio ID do auth.users
    const authUserId = resetCode.user_id

    // Atualizar senha no Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      authUserId,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return res.status(500).json({ error: 'Erro ao atualizar senha' })
    }

    // Marcar código como usado
    await supabase
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', resetCode.id)

    return res.status(200).json({ 
      success: true, 
      message: 'Senha atualizada com sucesso!' 
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
