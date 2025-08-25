// Design Tokens (Phase 1)
// Later can be generated or themed (light/dark)
export const colors = {
  bg: '#FFFFFF',
  bgAlt: '#F7F9FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F5',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',
  text: '#1F2A37',
  textDim: '#556070',
  textFaint: '#6B7280',
  primary: '#6366F1',
  primaryHover: '#5558D9',
  primaryActive: '#4C51BF',
  warm: '#FB6F5E',
  mint: '#4CC9A6',
  soft: '#FFE897',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  warning: '#F59E0B',
  success: '#059669',
  focus: '#6366F1',
  neutral: {
    25: '#FCFCFD',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A'
  },
  accentGradient: 'linear-gradient(120deg,#6366F1 0%, #5558D9 50%, #4C51BF 100%)',
  playfulGradient: 'linear-gradient(135deg,#6366F1 0%, #FB6F5E 60%, #FFE897 100%)'
};

export const darkMode = {
  bg: '#0F172A',
  bgAlt: '#1E293B',
  surface: '#1E293B',
  surfaceAlt: '#334155',
  border: '#334155',
  borderStrong: '#475569',
  text: '#F1F5F9',
  textDim: '#CBD5E1',
  textFaint: '#94A3B8',
  primary: '#818CF8',
  primaryHover: '#6366F1',
  primaryActive: '#4F46E5',
  warm: '#FB8B78',
  mint: '#5ED8B6',
  soft: '#FFEFAF',
  danger: '#F87171',
  dangerBg: '#7F1D1D',
  warning: '#FBBF24',
  success: '#10B981',
  focus: '#818CF8'
};

export const radii = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  pill: 999,
  round: '50%'
};

export const spacing = [0,4,8,12,16,20,24,32,40,48,56,64]; // 4px scale

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 12px -2px rgba(0,0,0,0.08)',
  lg: '0 8px 28px -6px rgba(0,0,0,0.12)',
  focus: '0 0 0 3px rgba(99,102,241,0.4)'
};

export const typography = {
  fontFamily: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`,
  sizes: {
    xs: '0.75rem',
    sm: '0.8125rem',
    md: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  },
  weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  lineHeights: { tight: 1.15, snug: 1.25, normal: 1.5, relaxed: 1.65 }
};

export const transitions = {
  fast: '120ms cubic-bezier(.4,0,.2,1)',
  base: '200ms cubic-bezier(.4,0,.2,1)'
};

export const zIndex = {
  header: 100,
  overlay: 400,
  modal: 500,
  toast: 600
};

export const tokens = { colors, radii, spacing, shadows, typography, transitions, zIndex, darkMode };
export default tokens;
