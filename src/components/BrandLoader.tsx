import { Brand } from './Brand'
import './brand-loader.css'

export function BrandLoader({ label = 'Chargement d’Océan Média TV…', light = false }: { label?: string; light?: boolean }) {
  return <main id="main-content" className={`brand-loader${light ? ' brand-loader-light' : ''}`} role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    <div className="brand-loader-logo"><Brand /></div>
    <div className="brand-loader-lines" aria-hidden="true"><span /><span /><span /></div>
  </main>
}
