function normalizeBasePath(basePath: string | undefined): string {
  const sanitized = (basePath ?? '/').trim()
  const withLeadingSlash = sanitized.startsWith('/') ? sanitized : `/${sanitized}`
  const withTrailingSlash = withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`
  return withTrailingSlash.replace(/\/{2,}/g, '/')
}

function normalizePath(path: string): string {
  if (path === '') return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//.test(path)
}

export function getAppBasePath(): string {
  return normalizeBasePath(import.meta.env.BASE_URL)
}

export function buildPublicPath(path: string): string {
  if (isAbsoluteUrl(path)) return path

  const normalizedPath = normalizePath(path.trim())
  const basePath = getAppBasePath()

  if (basePath === '/') {
    return normalizedPath
  }

  // Evita duplicar o basename quando a rota já estiver montada com BASE_URL.
  if (normalizedPath === basePath || normalizedPath.startsWith(basePath)) {
    return normalizedPath
  }

  const baseWithoutTrailingSlash = basePath.slice(0, -1)
  return normalizedPath === '/' ? basePath : `${baseWithoutTrailingSlash}${normalizedPath}`
}

export function buildPublicUrl(path: string): string {
  if (isAbsoluteUrl(path)) return path

  const publicPath = buildPublicPath(path)
  if (typeof window === 'undefined') return publicPath
  return new URL(publicPath, window.location.origin).toString()
}
