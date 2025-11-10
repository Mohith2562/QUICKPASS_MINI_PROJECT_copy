'use client'

import { useCallback, useEffect, useState } from 'react'

export type AuthUser = {
  id?: string
  name?: string
  email?: string
  rollNumber?: string
  department?: string
  year?: string
  [key: string]: unknown
}

type UseAuthState = {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  refreshAuth: () => void
}

export function useAuth(): UseAuthState {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAuthState = useCallback(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      setToken(storedToken)
      setUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null)
    } catch (error) {
      console.warn('Failed to parse auth state from storage', error)
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadAuthState()
  }, [loadAuthState])

  const refreshAuth = useCallback(() => {
    setLoading(true)
    loadAuthState()
  }, [loadAuthState])

  return {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    refreshAuth
  }
}


