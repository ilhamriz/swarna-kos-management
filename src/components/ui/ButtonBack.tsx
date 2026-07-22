import { Button } from "./Button"
import { ArrowLeft } from "./Icon"
import { useRouter } from "next/navigation"

export default function ButtonBack() {
  const router = useRouter()

  return (
    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-text-muted">
      <ArrowLeft size={20} />
    </Button>
  )
}
