"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "./Button"
import { Kebab } from "./Icon"

export type OverflowMenuItem = {
  label: string
  onClick: () => void
  variant?: "default" | "danger"
}

export type OverflowMenuProps = {
  items: OverflowMenuItem[]
}

export function OverflowMenu({ items }: Readonly<OverflowMenuProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleDocumentClick)
    return () => document.removeEventListener("mousedown", handleDocumentClick)
  }, [])

  return (
    <div ref={containerRef} className="relative inline-flex">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Open overflow menu"
      >
        <Kebab size={20} />
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-35 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-sm py-1">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick()
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 hover:bg-bg-elevated ${
                item.variant === "danger" ? "text-danger" : "text-text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
