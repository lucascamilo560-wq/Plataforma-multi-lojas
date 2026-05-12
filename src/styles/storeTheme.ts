import type { Store } from '../types'
import { designTokens } from './tokens'

export interface StoreTheme {
  logoUrl: string
  coverUrl: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const DEFAULT_STORE_THEME: StoreTheme = {
  logoUrl: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
  coverUrl: 'https://images.unsplash.com/photo-1556740714-a8395b3bf30f?w=1200',
  primaryColor: designTokens.colors.primary,
  secondaryColor: designTokens.colors.primarySoft,
  accentColor: designTokens.colors.accentBlue,
}

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/

function safeColor(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback
  }

  return HEX_COLOR_REGEX.test(value) ? value : fallback
}

function safeImage(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback
  }

  try {
    const url = new URL(value)
    return url.href
  } catch {
    return fallback
  }
}

export function getStoreTheme(store?: Partial<Store> | null): StoreTheme {
  return {
    logoUrl: safeImage(store?.logoUrl, DEFAULT_STORE_THEME.logoUrl),
    coverUrl: safeImage(store?.coverUrl, DEFAULT_STORE_THEME.coverUrl),
    primaryColor: safeColor(store?.primaryColor, DEFAULT_STORE_THEME.primaryColor),
    secondaryColor: safeColor(store?.secondaryColor, DEFAULT_STORE_THEME.secondaryColor),
    accentColor: safeColor(store?.accentColor, DEFAULT_STORE_THEME.accentColor),
  }
}
