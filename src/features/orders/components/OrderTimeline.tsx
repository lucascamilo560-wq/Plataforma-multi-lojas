import type { OrderTimelineEntry, OrderTimelineEntryType } from '../../../types'

function timelineIcon(type: OrderTimelineEntryType): string {
  if (type === 'payment') return '💳'
  if (type === 'note') return '💬'
  return '✅'
}

interface Props {
  entries: OrderTimelineEntry[]
}

export function OrderTimeline({ entries }: Props) {
  if (!entries.length) return null

  return (
    <div className="stack" style={{ gap: '0.5rem' }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ fontSize: '1rem', lineHeight: '1.5', flexShrink: 0 }}>
            {timelineIcon(entry.type)}
          </span>
          <div className="stack" style={{ gap: '0.1rem' }}>
            <small style={{ fontWeight: 600 }}>{entry.label}</small>
            {entry.description && (
              <small className="muted" style={{ fontSize: '0.8rem' }}>{entry.description}</small>
            )}
            <small className="muted" style={{ fontSize: '0.75rem' }}>
              {new Date(entry.createdAt).toLocaleString('pt-BR')}
            </small>
          </div>
        </div>
      ))}
    </div>
  )
}
