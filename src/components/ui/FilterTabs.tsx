import { cn } from "@/lib/utils"

interface FilterTab<T extends string> {
  value: T
  label: string
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[]
  value: T
  onChange: (value: T) => void
}

export function FilterTabs<T extends string>({ tabs, value, onChange }: FilterTabsProps<T>) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-300 cursor-pointer",
            value === tab.value
              ? "bg-primary text-white hover:bg-primary-hover"
              : "bg-bg-elevated text-text-secondary hover:bg-border"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
