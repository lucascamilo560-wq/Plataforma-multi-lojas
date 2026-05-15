export interface ShareOptions {
  title: string
  text: string
  url: string
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

  try {
    await navigator.clipboard.writeText(options.url)
    return 'copied'
  } catch {
    if (shareError?.name === 'AbortError') {
      return 'cancelled'
    }
    return 'failed'
  }
}
