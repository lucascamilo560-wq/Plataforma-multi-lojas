import { SectionHeader } from './SectionHeader'

interface PageHeaderProps {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return <SectionHeader title={title} description={description} />
}
