import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  containerClassName?: string
}

export function Input({ label, id, className = '', containerClassName = '', ...props }: InputProps) {
  const inputId = id ?? props.name

  if (!label) {
    return <input id={inputId} className={`input ${className}`.trim()} {...props} />
  }

  return (
    <label className={`field ${containerClassName}`.trim()} htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input id={inputId} className={`input ${className}`.trim()} {...props} />
    </label>
  )
}
