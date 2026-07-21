interface FormGroupProps {
  label: string
  error?: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}

export function FormGroup({ label, error, required, hint, children }: FormGroupProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
