import { Controller, Control, FieldValues, Path } from "react-hook-form"

interface FileInputProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  accept?: string
}

export function FileInput<T extends FieldValues>({
  name,
  control,
  accept = "image/jpeg,image/jpg,image/png,image/webp",
}: FileInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, name, ref } }) => (
        <input
          type="file"
          accept={accept}
          name={name}
          ref={ref}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.files?.[0])}
          className="w-full text-sm text-text-secondary file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:bg-bg-surface file:text-text-primary file:text-sm file:border-border-strong hover:file:bg-bg-elevated file:transition-all file:duration-300 cursor-pointer file:cursor-pointer"
        />
      )}
    />
  )
}
