import type { ReactElement } from 'react'

/**
 * MockQrCode — representação visual estática de um QR Code.
 * Não é funcional como leitor; serve como placeholder até que
 * uma biblioteca de geração real seja integrada.
 */

interface MockQrCodeProps {
  size?: number
}

const CELLS = 11

// Pré-definição de células preenchidas (padrão visual de QR Code, não funcional)
const FILLED = new Set([
  // Marcador superior-esquerdo (7×7)
  '0,0','1,0','2,0','3,0','4,0','5,0','6,0',
  '0,1','6,1',
  '0,2','2,2','3,2','4,2','6,2',
  '0,3','2,3','3,3','4,3','6,3',
  '0,4','2,4','3,4','4,4','6,4',
  '0,5','6,5',
  '0,6','1,6','2,6','3,6','4,6','5,6','6,6',
  // Marcador superior-direito (7×7, colunas 8-10)
  '8,0','9,0','10,0',
  '8,1','10,1',
  '8,2','9,2','10,2',
  '8,3','10,3',
  '8,4','9,4','10,4',
  '8,5','10,5',
  '8,6','9,6','10,6',
  // Marcador inferior-esquerdo (colunas 0-2, linhas 8-10)
  '0,8','1,8','2,8',
  '0,9','2,9',
  '0,10','1,10','2,10',
  // Módulos de dados (padrão visual aleatório fixo)
  '4,8','5,8','6,8','8,8','9,8',
  '4,9','6,9','8,9','10,9',
  '3,10','5,10','7,10','9,10','10,10',
  '3,2','7,2','7,3','7,4',
  '3,7','5,7','7,7','9,7','10,7',
])

export function MockQrCode({ size = 120 }: MockQrCodeProps) {
  const cellSize = size / CELLS

  const cells: ReactElement[] = []
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      if (FILLED.has(`${col},${row}`)) {
        cells.push(
          <rect
            key={`${col}-${row}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            fill="currentColor"
          />,
        )
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label="QR Code da loja (visual representativo)"
      role="img"
      style={{ display: 'block' }}
    >
      <rect width={size} height={size} fill="white" />
      <g>{cells}</g>
    </svg>
  )
}
