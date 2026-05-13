import type { Store, StoreButtonStyle, StoreCardStyle, StoreHeroStyle, StoreNavigationStyle, StoreProductLayout } from '../types'
import { designTokens } from './tokens'

export interface StoreTheme {
  logoUrl: string
  coverUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  buttonStyle: StoreButtonStyle
  cardStyle: StoreCardStyle
  productLayout: StoreProductLayout
  navigationStyle: StoreNavigationStyle
  heroStyle: StoreHeroStyle
  showHero: boolean
  showLoyaltyBlock: boolean
  showPromotionsSection: boolean
  showBestSellersSection: boolean
  showWhatsappFloat: boolean
  // Derived style tokens
  borderRadius: string
  buttonRadius: string
}

export interface ThemePreset {
  id: string
  label: string
  emoji: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  buttonStyle: StoreButtonStyle
  cardStyle: StoreCardStyle
  buttonRadius: string
  borderRadius: string
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'elegante',
    label: 'Elegante',
    emoji: '✨',
    primaryColor: '#1a1a2e',
    secondaryColor: '#f0ebe3',
    accentColor: '#c9a84c',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    borderRadius: '20px',
    buttonRadius: '14px',
  },
  {
    id: 'moderno',
    label: 'Moderno',
    emoji: '🔷',
    primaryColor: '#0f172a',
    secondaryColor: '#e2e8f0',
    accentColor: '#3b82f6',
    buttonStyle: 'rounded',
    cardStyle: 'flat',
    borderRadius: '12px',
    buttonRadius: '10px',
  },
  {
    id: 'premium',
    label: 'Premium',
    emoji: '💎',
    primaryColor: '#1c1b1f',
    secondaryColor: '#f5f0ff',
    accentColor: '#7c3aed',
    buttonStyle: 'rounded',
    cardStyle: 'elevated',
    borderRadius: '24px',
    buttonRadius: '16px',
  },
  {
    id: 'minimalista',
    label: 'Minimalista',
    emoji: '◻️',
    primaryColor: '#2d2d2d',
    secondaryColor: '#f9f9f9',
    accentColor: '#555555',
    buttonStyle: 'square',
    cardStyle: 'outlined',
    borderRadius: '8px',
    buttonRadius: '6px',
  },
  {
    id: 'vibrante',
    label: 'Vibrante',
    emoji: '🔥',
    primaryColor: '#d62828',
    secondaryColor: '#fff3e0',
    accentColor: '#f77f00',
    buttonStyle: 'pill',
    cardStyle: 'elevated',
    borderRadius: '18px',
    buttonRadius: '999px',
  },
  {
    id: 'boutique',
    label: 'Boutique',
    emoji: '🌸',
    primaryColor: '#4a2c2a',
    secondaryColor: '#fdf2e9',
    accentColor: '#c0392b',
    buttonStyle: 'pill',
    cardStyle: 'glass',
    borderRadius: '20px',
    buttonRadius: '999px',
  },
]

const DEFAULT_STORE_THEME: StoreTheme = {
  logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
  coverUrl: 'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?w=1200',
  primaryColor: designTokens.colors.primary,
  secondaryColor: designTokens.colors.primarySoft,
  accentColor: designTokens.colors.accentBlue,
  buttonStyle: 'rounded',
  cardStyle: 'elevated',
  productLayout: 'grid-2',
  navigationStyle: 'chips',
  heroStyle: 'cover',
  showHero: true,
  showLoyaltyBlock: true,
  showPromotionsSection: true,
  showBestSellersSection: false,
  showWhatsappFloat: true,
  borderRadius: '18px',
  buttonRadius: '14px',
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/

function safeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  return HEX_COLOR_REGEX.test(value) ? value : fallback
}

function safeImage(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : fallback
  } catch {
    return fallback
  }
}

function getPresetById(presetId: string | undefined): ThemePreset | undefined {
  if (!presetId) return undefined
  return THEME_PRESETS.find((p) => p.id === presetId)
}

export function getStoreTheme(store?: Partial<Store> | null): StoreTheme {
  const preset = getPresetById(store?.themePreset)

  return {
    logoUrl: safeImage(store?.logoUrl, DEFAULT_STORE_THEME.logoUrl),
    coverUrl: safeImage(store?.coverUrl, DEFAULT_STORE_THEME.coverUrl),
    primaryColor: safeColor(store?.primaryColor ?? preset?.primaryColor, DEFAULT_STORE_THEME.primaryColor),
    secondaryColor: safeColor(store?.secondaryColor ?? preset?.secondaryColor, DEFAULT_STORE_THEME.secondaryColor),
    accentColor: safeColor(store?.accentColor ?? preset?.accentColor, DEFAULT_STORE_THEME.accentColor),
    buttonStyle: store?.buttonStyle ?? preset?.buttonStyle ?? DEFAULT_STORE_THEME.buttonStyle,
    cardStyle: store?.cardStyle ?? preset?.cardStyle ?? DEFAULT_STORE_THEME.cardStyle,
    productLayout: store?.productLayout ?? DEFAULT_STORE_THEME.productLayout,
    navigationStyle: store?.navigationStyle ?? DEFAULT_STORE_THEME.navigationStyle,
    heroStyle: store?.heroStyle ?? DEFAULT_STORE_THEME.heroStyle,
    showHero: store?.showHero ?? DEFAULT_STORE_THEME.showHero,
    showLoyaltyBlock: store?.showLoyaltyBlock ?? DEFAULT_STORE_THEME.showLoyaltyBlock,
    showPromotionsSection: store?.showPromotionsSection ?? DEFAULT_STORE_THEME.showPromotionsSection,
    showBestSellersSection: store?.showBestSellersSection ?? DEFAULT_STORE_THEME.showBestSellersSection,
    showWhatsappFloat: store?.showWhatsappFloat ?? DEFAULT_STORE_THEME.showWhatsappFloat,
    borderRadius: preset?.borderRadius ?? DEFAULT_STORE_THEME.borderRadius,
    buttonRadius: preset?.buttonRadius ?? DEFAULT_STORE_THEME.buttonRadius,
  }
}
