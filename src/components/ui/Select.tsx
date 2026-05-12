import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  containerClassName?: string
}

export function Select({
  label,
  id,
  className = '',
  containerClassName = '',
  children,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  if (!label) {
    return (
      <select id={selectId} className={`select ${className}`.trim()} {...props}>
        {children}
      </select>
    )
  }

  return (
    <label className={`field ${containerClassName}`.trim()} htmlFor={selectId}>
      <span className="field-label">{label}</span>
      <select id={selectId} className={`select ${className}`.trim()} {...props}>
        {children}
      </select>
    </label>
  )
}
