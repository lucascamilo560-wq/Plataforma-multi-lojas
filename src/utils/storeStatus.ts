import type { Store, StoreBusinessDay, StoreBusinessHours } from '../types'

export interface StoreOpenStatus {
  isOpenNow: boolean
  statusLabel: string
  statusDescription: string
  nextOpeningLabel?: string
  canAcceptOrders: boolean
}

const DAY_NAMES: Record<StoreBusinessDay, string> = {
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

const JS_DAY_TO_SLUG: StoreBusinessDay[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

export function getStoreOpenStatus(store: Store): StoreOpenStatus {
  // Loja pausada manualmente pelo lojista
  if (!store.isActive) {
    return {
      isOpenNow: false,
      statusLabel: 'Pausada',
      statusDescription: 'Esta loja está temporariamente pausada.',
      canAcceptOrders: false,
    }
  }

  // Modo férias
  if (store.vacationMode) {
    return {
      isOpenNow: false,
      statusLabel: 'Em férias',
      statusDescription:
        store.vacationMessage?.trim() ||
        'Esta loja está em período de férias. Em breve voltará ao atendimento.',
      canAcceptOrders: false,
    }
  }

  // Sem horário configurado → fallback: loja ativa = aberta
  if (!store.businessHours || store.businessHours.length === 0) {
    return {
      isOpenNow: true,
      statusLabel: 'Aberta',
      statusDescription: 'Loja em atendimento.',
      canAcceptOrders: true,
    }
  }

  const now = new Date()
  const todaySlug = JS_DAY_TO_SLUG[now.getDay()]
  const todayHours = store.businessHours.find((bh) => bh.day === todaySlug)

  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const isOpenToday =
    todayHours?.enabled &&
    todayHours.openTime &&
    todayHours.closeTime &&
    currentMinutes >= timeToMinutes(todayHours.openTime) &&
    currentMinutes < timeToMinutes(todayHours.closeTime)

  if (isOpenToday) {
    return {
      isOpenNow: true,
      statusLabel: 'Aberta agora',
      statusDescription: `Atendendo até ${todayHours!.closeTime}.`,
      canAcceptOrders: true,
    }
  }

  // Fechada — calcular próxima abertura
  const nextOpeningLabel = getNextOpeningLabel(store, todaySlug, todayHours, currentMinutes)

  const canAcceptOrders = store.acceptOrdersWhenClosed === true

  return {
    isOpenNow: false,
    statusLabel: 'Fechada agora',
    statusDescription: canAcceptOrders
      ? 'Loja fechada agora, mas você pode enviar pedido para atendimento depois.'
      : 'Loja fechada no momento.',
    nextOpeningLabel,
    canAcceptOrders,
  }
}

function getNextOpeningLabel(
  store: Store,
  todaySlug: StoreBusinessDay,
  todayHours: StoreBusinessHours | undefined,
  currentMinutes: number,
): string | undefined {
  if (!store.businessHours) return undefined

  // Check if opens later today
  if (
    todayHours?.enabled &&
    todayHours.openTime &&
    currentMinutes < timeToMinutes(todayHours.openTime)
  ) {
    return `Abre hoje às ${todayHours.openTime}`
  }

  // Search upcoming days (up to 7 days ahead)
  const todayIndex = JS_DAY_TO_SLUG.indexOf(todaySlug)
  for (let offset = 1; offset <= 7; offset++) {
    const nextIndex = (todayIndex + offset) % 7
    const nextDaySlug = JS_DAY_TO_SLUG[nextIndex]
    const nextDayHours = store.businessHours.find((bh) => bh.day === nextDaySlug)
    if (nextDayHours?.enabled && nextDayHours.openTime) {
      const dayName = offset === 1 ? 'amanhã' : `${DAY_NAMES[nextDaySlug]}`
      return `Abre ${dayName} às ${nextDayHours.openTime}`
    }
  }

  return undefined
}
