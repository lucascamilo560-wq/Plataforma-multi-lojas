import { Card } from './Card'

interface KpiCardProps {
  label: string
  value: string | number
  subtitle?: string
}

export function KpiCard({ label, value, subtitle }: KpiCardProps) {
  return (
    <Card title={label} subtitle={subtitle} variant="layered">
      <p className="kpi-value">{value}</p>
    </Card>
  )
}
