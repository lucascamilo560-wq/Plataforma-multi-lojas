import type { SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  name:
    | 'sparkles'
    | 'storefront'
    | 'cart'
    | 'chart'
    | 'shield'
    | 'tag'
    | 'package'
    | 'search'
    | 'user'
    | 'arrowRight'
    | 'check'
    | 'clock'
    | 'star'
    | 'wallet'
    | 'palette'
    | 'close'
}

const iconPaths: Record<IconProps['name'], string> = {
  sparkles:
    'M12 3l1.7 3.9L18 8.6l-3.8 1.6L12 14l-2.2-3.8L6 8.6l4.3-1.7L12 3zm6.2 8.8l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1zM5 13l1.2 2.8L9 17l-2.8 1.2L5 21l-1.2-2.8L1 17l2.8-1.2L5 13z',
  storefront:
    'M3 7l1.4-3h15.2L21 7v2a2 2 0 01-2 2h-.2a2 2 0 01-1.8-1.1A2 2 0 0115.2 11 2 2 0 0113.4 9.9 2 2 0 0111.6 11a2 2 0 01-1.8-1.1A2 2 0 018 11H7a2 2 0 01-2-2V7zm2 6h14v7H5v-7z',
  cart: 'M3 4h2l2 11h10l2-8H8M9 20a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z',
  chart: 'M4 19h16M6 17V9m6 8V5m6 12v-6',
  shield: 'M12 3l7 3v5c0 5-3.5 8.9-7 10-3.5-1.1-7-5-7-10V6l7-3z',
  tag: 'M3 12l9-9h7v7l-9 9L3 12zm11-5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z',
  package: 'M3 8l9-5 9 5-9 5-9-5zm0 3l9 5 9-5m-18 0v8l9 5 9-5v-8',
  search: 'M11 4a7 7 0 105.2 11.7l3.1 3.1 1.4-1.4-3.1-3.1A7 7 0 0011 4z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H5z',
  arrowRight: 'M5 12h14m-5-5l5 5-5 5',
  check: 'M5 13l4 4L19 7',
  clock: 'M12 5v7l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z',
  star: 'M12 3l2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3z',
  wallet: 'M3 7a2 2 0 012-2h14v14H5a2 2 0 01-2-2V7zm11 5h5v4h-5a2 2 0 010-4z',
  palette:
    'M12 3a9 9 0 00-9 9c0 3.3 2.7 6 6 6h1a2 2 0 002-2c0-1.1.9-2 2-2h2a5 5 0 000-10h-4z',
  close: 'M6 6l12 12M6 18L18 6',
}

export function Icon({ name, className = '', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`icon ${className}`.trim()}
      {...props}
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}
