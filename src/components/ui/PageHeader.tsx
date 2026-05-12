import { Icon } from './Icon'
import { SectionHeader } from './SectionHeader'

interface PageHeaderProps {
  title: string
  description: string
  kicker?: string
  icon?: Parameters<typeof Icon>[0]['name']
}

export function PageHeader({ title, description, kicker, icon = 'sparkles' }: PageHeaderProps) {
  return <SectionHeader title={title} description={description} kicker={kicker} icon={icon} />
}
