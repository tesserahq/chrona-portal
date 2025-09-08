import { PanelLeft } from 'lucide-react'
import { Button } from '../ui/button'

export default function MenuToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button size="icon" variant="ghost" onClick={onClick} className="h-8 w-8">
      <PanelLeft />
    </Button>
  )
}
