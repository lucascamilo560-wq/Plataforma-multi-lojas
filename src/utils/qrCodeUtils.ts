import QRCode from 'qrcode'

export function downloadQrCode(value: string, filename = 'qrcode-vitrine.png'): void {
  QRCode.toDataURL(value, {
    width: 400,
    margin: 2,
    color: { dark: '#111111', light: '#ffffff' },
  })
    .then((dataUrl) => {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = filename
      link.click()
    })
    .catch((err) => {
      console.warn('Erro ao baixar QR Code:', err)
    })
}
