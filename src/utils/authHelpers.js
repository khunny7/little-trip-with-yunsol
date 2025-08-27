// Utilities to make Firebase Auth work reliably in installed PWAs and Store apps
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'

// Detect if running as an installed app (PWA/TWA/Store)
export const isStandaloneApp = () => {
  if (typeof window === 'undefined') return false
  const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)')
  const standalone = mm ? mm.matches : false
  const iosStandalone = typeof navigator !== 'undefined' && navigator.standalone
  const androidTwa = typeof document !== 'undefined' && document.referrer?.startsWith('android-app://')
  return Boolean(standalone || iosStandalone || androidTwa)
}

// Smart Google Sign-In: try popup, fall back to redirect when popups are blocked/unsupported
export async function signInWithGoogleSmart(auth) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  try {
    return await signInWithPopup(auth, provider)
  } catch (e) {
    const code = e?.code || ''
    const shouldRedirect =
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/operation-not-supported-in-this-environment' ||
      isStandaloneApp()

    if (shouldRedirect) {
      // Redirect flow works better in packaged apps and some WebView-like contexts
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}
