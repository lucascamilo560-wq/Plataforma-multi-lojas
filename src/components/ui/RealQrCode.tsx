import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'

interface RealQrCodeProps {
  value: string
  size?: number
  label?: string
}

export function RealQrCode({ value, size = 160, label = 'QR Code da loja' }: RealQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!canvasRef.current || !value) return
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#111111', light: '#ffffff' },
    }).catch(() => setError(true))
  }, [value, size])

  if (error) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          padding: '0.5rem',
        }}
      >
        Erro ao gerar QR Code
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={label}
      role="img"
      style={{ display: 'block', borderRadius: '0.25rem' }}
    />
  )
}
