// Utilities to make Firebase Auth work reliably in installed PWAs and Store apps
import {
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth'

// Detect if running as an installed app (PWA/TWA/Store)
export const isStandaloneApp = () => {
  if (typeof window === 'undefined') return false
  const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)')
  const standalone = mm ? mm.matches : false
  const iosStandalone = typeof navigator !== 'undefined' && navigator.standalone
  const androidTwa = typeof document !== 'undefined' && document.referrer?.startsWith('android-app://')
  // Heuristics for WebView-like environments (PWABuilder, Android WebView, social in-app browsers)
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : ''
  const webViewUA = /; wv\)|WebView|EdgA\/.+?;\s*wv|FBAN|FBAV|Instagram|Twitter/i.test(ua)
  return Boolean(standalone || iosStandalone || androidTwa || webViewUA)
}

// Smart Google Sign-In: FORCE redirect mode for debugging (matches PWA behavior)
export async function signInWithGoogleSmart(auth) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  console.log('🔥 [auth] signInWithGoogleSmart: FORCING redirect mode for debugging')
  console.log('🔥 [auth] Current URL:', window.location.href)
  console.log('🔥 [auth] Auth domain:', auth.config?.authDomain)
  
  // ALWAYS use redirect (no popup) to match PWA behavior for debugging
  try {
    await signInWithRedirect(auth, provider)
    console.log('🔥 [auth] Redirect initiated successfully')
    return null // Redirect flow doesn't return a user immediately
  } catch (error) {
    console.error('🔥 [auth] signInWithRedirect failed:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    })
    throw error
  }
}
