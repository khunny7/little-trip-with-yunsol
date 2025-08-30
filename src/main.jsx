import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { auth } from './config/firebase'
import { getRedirectResult } from 'firebase/auth'

// PWA: register service worker
import { registerSW } from 'virtual:pwa-register'
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // auto-apply new SW on next tick
    updateSW()
  },
  onOfflineReady() {}
})

async function bootstrap() {
  try {
    // Diagnose any pending redirect state before React mounts
    const ssKeys = []
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        ssKeys.push(key)
      }
    } catch {
      // ignore storage access errors
    }
  console.log('🔥 [auth] Pre-mount check: sessionStorage keys', ssKeys)
  const pendingKey = ssKeys.find(k => k && k.startsWith('firebase:pendingRedirect:'))
  console.log('🔥 [auth] Pending redirect key found:', pendingKey || 'none')

    // Dump pending redirect payload (if any)
    try {
      if (pendingKey) {
        const payload = sessionStorage.getItem(pendingKey)
        console.log('🔥 [auth] Pending redirect payload:', payload)
      }
    } catch {
      // ignore
    }

    // Also list localStorage keys (some environments write here)
    const lsKeys = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        lsKeys.push(key)
      }
    } catch {
      // ignore
    }
    console.log('🔥 [auth] Pre-mount check: localStorage keys', lsKeys)

    // Auth/environment diagnostics
    try {
      console.log('🔥 [auth] Env diag:', {
        origin: window.location.origin,
        cookieEnabled: navigator.cookieEnabled,
        authDomain: auth?.config?.authDomain,
        appName: auth?.app?.name
      })
    } catch {
      // ignore
    }

  const urlParams = new URLSearchParams(window.location.search)
  const hasAuthParams = urlParams.has('state') || urlParams.has('code') || urlParams.has('error')
  console.log('🔥 [auth] Pre-mount URL auth params:', hasAuthParams, window.location.search)

  console.log('🔥 [auth] Pre-mount: calling getRedirectResult...')
    const result = await getRedirectResult(auth).catch((e) => {
      console.log('🔥 [auth] Pre-mount getRedirectResult error:', { code: e?.code, message: e?.message })
      return null
    })
    console.log('🔥 [auth] Pre-mount getRedirectResult resolved:', {
      hasUser: !!result?.user,
      userUid: result?.user?.uid,
      userEmail: result?.user?.email
    })
    if (!result?.user && (pendingKey || hasAuthParams)) {
      await new Promise(r => setTimeout(r, 400))
      const result2 = await getRedirectResult(auth).catch(() => null)
      console.log('🔥 [auth] Pre-mount delayed getRedirectResult resolved:', {
        hasUser: !!result2?.user,
        userUid: result2?.user?.uid,
        userEmail: result2?.user?.email
      })
    }

    if (hasAuthParams && window.history?.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
      console.log('🔥 [auth] Pre-mount: cleaned URL params')
    }
  } finally {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

bootstrap()
