// Utilities to make Firebase Auth work reliably in installed PWAs and Store apps
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'

// Detect if running as an installed app (PWA/TWA/Store/WebView)
export const isStandaloneApp = () => {
  if (typeof window === 'undefined') return false

  // PWA display-mode
  const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)')
  const standalone = mm ? mm.matches : false

  // iOS PWA
  const iosStandalone = typeof navigator !== 'undefined' && navigator.standalone

  // Android TWA hint
  const androidTwa = typeof document !== 'undefined' && document.referrer?.startsWith('android-app://')

  // Windows WebView2 (PWABuilder Windows 11 MSIX)
  const isWinWebView =
    typeof window !== 'undefined' &&
    (!!window.chrome?.webview || /WebView2|MSAppHost|WindowsAppWebView/i.test(navigator.userAgent || ''))

  return Boolean(standalone || iosStandalone || androidTwa || isWinWebView)
}

// Smart Google Sign-In: prefer redirect in installed contexts; try popup on the open web and fallback to redirect on common failures
export async function signInWithGoogleSmart(auth) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })

  // In installed PWA / Store shells / WebView, redirect is most reliable
  if (isStandaloneApp()) {
    await signInWithRedirect(auth, provider)
    return null
  }

  // In regular browsers, try popup first; fallback to redirect on common failures
  try {
    return await signInWithPopup(auth, provider)
  } catch (e) {
    const code = e?.code || ''
    const shouldRedirect =
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/operation-not-supported-in-this-environment'

    if (shouldRedirect) {
      await signInWithRedirect(auth, provider)
      return null
    }
    throw e
  }
}
