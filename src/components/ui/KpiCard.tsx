import { Card } from './Card'
import { Icon } from './Icon'

interface KpiCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: Parameters<typeof Icon>[0]['name']
}

export function KpiCard({ label, value, subtitle, icon = 'chart' }: KpiCardProps) {
  return (
    <Card title={label} subtitle={subtitle} variant="layered" className="kpi-card">
      <div className="kpi-row">
        <p className="kpi-value">{value}</p>
        <span className="kpi-icon-wrap">
          <Icon name={icon} className="icon-md" />
        </span>
      </div>
    </Card>
  )
}
