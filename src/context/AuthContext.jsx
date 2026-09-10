import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, profileApi } from '../api/services.js'
import { readStorage, writeStorage, removeStorage, STORAGE_KEYS } from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStorage(STORAGE_KEYS.USER))
  const [token, setToken] = useState(() => readStorage(STORAGE_KEYS.TOKEN))
  // "restoring" covers the first paint, so protected routes do not bounce a
  // logged-in farmer to the login screen on refresh.
  const [restoring, setRestoring] = useState(Boolean(readStorage(STORAGE_KEYS.TOKEN)))

  useEffect(() => {
    if (!token) {
      setRestoring(false)
      return
    }
    let cancelled = false
    authApi
      .me()
      .then((profile) => {
        if (cancelled) return
        setUser(profile)
        writeStorage(STORAGE_KEYS.USER, profile)
      })
      .catch((error) => {
        if (cancelled) return
        if (error.status === 401) {
          setToken(null)
          setUser(null)
          removeStorage(STORAGE_KEYS.TOKEN)
          removeStorage(STORAGE_KEYS.USER)
        }
      })
      .finally(() => {
        if (!cancelled) setRestoring(false)
      })
    return () => {
      cancelled = true
    }
    // Runs once per session token.
  }, [token])

  const persistSession = useCallback((session) => {
    writeStorage(STORAGE_KEYS.TOKEN, session.token)
    writeStorage(STORAGE_KEYS.USER, session.user)
    setToken(session.token)
    setUser(session.user)
  }, [])

  const requestOtp = useCallback((mobile) => authApi.requestOtp({ mobile }), [])

  const login = useCallback(
    async (mobile, otp) => {
      const session = await authApi.verifyOtp({ mobile, otp })
      persistSession(session)
      return session.user
    },
    [persistSession],
  )

  const register = useCallback(
    async (payload) => {
      const session = await authApi.register(payload)
      persistSession(session)
      return session.user
    },
    [persistSession],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Signing out locally must work even if the server call fails.
    }
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.USER)
    setToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const updated = await profileApi.update(payload)
    setUser(updated)
    writeStorage(STORAGE_KEYS.USER, updated)
    return updated
  }, [])

  const updateBankAccount = useCallback(async (payload) => {
    const updated = await profileApi.updateBankAccount(payload)
    setUser(updated)
    writeStorage(STORAGE_KEYS.USER, updated)
    return updated
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      restoring,
      requestOtp,
      login,
      register,
      logout,
      updateProfile,
      updateBankAccount,
    }),
    [user, token, restoring, requestOtp, login, register, logout, updateProfile, updateBankAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
