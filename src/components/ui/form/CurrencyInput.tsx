"use client"

import { Controller, type Control, type FieldValues, type Path } from "react-hook-form"
import { NumericFormat } from "react-number-format"
import { cn } from "@/lib/utils"

interface CurrencyInputProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  placeholder?: string
  className?: string
}

export function CurrencyInput<T extends FieldValues>({
  name,
  control,
  placeholder,
  className,
}: Readonly<CurrencyInputProps<T>>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, name, ref } }) => (
        <div className="flex items-center border border-border-strong rounded-lg bg-bg-surface focus-within:ring-2 focus-within:ring-primary overflow-hidden">
          <span className="px-3 py-2.5 text-sm text-text-secondary bg-bg-elevated border-r border-border-strong select-none">
            Rp
          </span>
          <NumericFormat
            getInputRef={ref}
            name={name}
            value={value ?? ""}
            onValueChange={(values) => {
              onChange(values.floatValue ?? undefined)
            }}
            onBlur={onBlur}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={0}
            allowNegative={false}
            placeholder={placeholder}
            className={cn(
              "flex-1 px-3 py-2.5 text-sm bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none",
              className
            )}
          />
        </div>
      )}
    />
  )
}
