export interface ShareOptions {
  title: string
  text: string
  url: string
  /**
   * Texto copiado no fallback. Se omitido, copia `${text} ${url}`.
   * Útil para incluir mensagem completa quando o navigator.share não está disponível.
   */
  copyText?: string
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed'

export async function shareOrCopy(options: ShareOptions): Promise<ShareResult> {
  let shareError: Error | null = null

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: options.title, text: options.text, url: options.url })
      return 'shared'
    } catch (error) {
      shareError = error instanceof Error ? error : new Error(String(error))
      // Fall through to clipboard copy
    }
  }

  const textToCopy = options.copyText ?? `${options.text} ${options.url}`

  try {
    await navigator.clipboard.writeText(textToCopy)
    return 'copied'
  } catch {
    if (shareError?.name === 'AbortError') {
      return 'cancelled'
    }
    return 'failed'
  }
}
