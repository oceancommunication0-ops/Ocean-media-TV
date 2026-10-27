import { type SocialNetwork } from '../lib/site-config'
import { useSite } from '../lib/api'
import { socialNetworks } from './SocialIcon'

export function SocialLinks({ onUnavailable }: { onUnavailable: (name: SocialNetwork) => void }) {
  const { socialLinks } = useSite()
  return (
    <div className="social-links" aria-label="Réseaux sociaux">
      {socialNetworks.map(({ name, icon: Icon }) => {
        const url = socialLinks[name]
        return url ? (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer" aria-label={`${name} — nouvel onglet`} className="social-link">
            <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
          </a>
        ) : (
          <button key={name} type="button" className="social-link" aria-label={`${name} — lien officiel à venir`} onClick={() => onUnavailable(name)}>
            <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
          </button>
        )
      })}
    </div>
  )
}
