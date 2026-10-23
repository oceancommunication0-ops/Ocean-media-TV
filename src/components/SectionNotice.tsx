import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

export function useSectionNotice() {
  const [notice, setNotice] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function showNotice(message: string) {
    if (timer.current) clearTimeout(timer.current)
    setNotice(message)
    timer.current = setTimeout(() => setNotice(''), 5000)
  }
  return { notice, showNotice, clearNotice: () => setNotice('') }
}

export function SectionNotice({ notice, onClose }: { notice: string; onClose: () => void }) {
  return <div className={`closing-notice${notice ? ' is-visible' : ''}`} role="status" aria-live="polite" aria-atomic="true">{notice && <><span>{notice}</span><button type="button" onClick={onClose} aria-label="Fermer la notification"><X size={17} aria-hidden="true" /></button></>}</div>
}
