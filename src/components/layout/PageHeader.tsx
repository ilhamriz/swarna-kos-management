import Link from "next/link"
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/Button"
import ButtonBack from "@/components/ui/ButtonBack"
import { OverflowMenu, type OverflowMenuItem } from "@/components/ui/OverflowMenu"
import { cn } from "@/lib/utils"

interface PageHeaderAction {
  label: string
  onClick: () => void
  variant?: ButtonProps["variant"]
  isLoading?: boolean
}

interface PageHeaderLink {
  label: string
  href: string
}

interface PageHeaderProps {
  title: string
  showBack?: boolean
  action?: PageHeaderAction
  link?: PageHeaderLink
  menuItems?: OverflowMenuItem[]
}

export function PageHeader({
  title,
  showBack = false,
  action,
  link,
  menuItems,
}: Readonly<PageHeaderProps>) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {showBack && <ButtonBack />}
      <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
      {menuItems?.length ? (
        <OverflowMenu items={menuItems} className="ml-auto" />
      ) : action ? (
        <Button
          variant={action.variant ?? "ghost"}
          onClick={action.onClick}
          isLoading={action.isLoading}
          className="w-fit ml-auto"
        >
          {action.label}
        </Button>
      ) : link ? (
        <Link
          href={link.href}
          className={cn(buttonVariants({ variant: "ghost" }), "w-fit ml-auto")}
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  )
}
