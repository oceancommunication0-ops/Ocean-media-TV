import type { SVGProps } from 'react'
import { Facebook, Youtube } from 'lucide-react'

function TikTokIcon({ size = 15, ...props }: SVGProps<SVGSVGElement> & { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.6 2h-3.4v13.6a3 3 0 1 1-2.6-3V9.2a6.4 6.4 0 1 0 6 6.4V8.7a8.3 8.3 0 0 0 4.8 1.5V6.8A4.8 4.8 0 0 1 16.6 2Z" />
  </svg>
}

export const socialNetworks = [
  { name: 'Facebook', icon: Facebook, placeholder: 'https://www.facebook.com/votrepage' },
  { name: 'YouTube', icon: Youtube, placeholder: 'https://www.youtube.com/@votrechaine' },
  { name: 'TikTok', icon: TikTokIcon, placeholder: 'https://www.tiktok.com/@votrecompte' },
] as const
