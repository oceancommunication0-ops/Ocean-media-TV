import { ArrowUpRight } from 'lucide-react'
import { inspiringStories } from '../lib/closing-content'
import { SectionNotice, useSectionNotice } from './SectionNotice'
import './closing.css'

export function PortraitsSection() {
  const { notice, showNotice, clearNotice } = useSectionNotice()
  return <section id="portraits" className="portraits-section" aria-labelledby="portraits-title" tabIndex={-1}>
    <div className="closing-container">
      <div className="portraits-heading">
        <div><p className="closing-eyebrow"><span aria-hidden="true" />INITIATIVES & PORTRAITS</p><h2 id="portraits-title">Ils inspirent<br />{' '}<em>le changement.</em></h2></div>
        <p className="closing-introduction">Découvrez les parcours, les idées et les initiatives de celles et ceux qui contribuent à construire l’avenir.</p>
      </div>
      <div className="portraits-grid">
        {inspiringStories.map((story, index) => <article className={`portrait-story${index === 0 ? ' portrait-story-featured' : ''}`} key={story.id}>
          <a href={`/portraits/${story.id}`} aria-labelledby={`portrait-${story.id}`} onClick={event => { event.preventDefault(); showNotice('La page de ce récit sera bientôt disponible.') }}>
            <div className="portrait-image-wrap">
              <img src={`/images/${story.image}.webp`} srcSet={`/images/${story.image}-480.webp 480w, /images/${story.image}-800.webp 800w, /images/${story.image}.webp 1200w`} sizes={index === 0 ? '(max-width: 899px) calc(100vw - 44px), 40vw' : '(max-width: 575px) calc(100vw - 44px), 30vw'} alt={story.alt} style={{ objectPosition: story.position }} width="1200" height={index === 0 ? 1600 : index === 1 ? 800 : 1860} loading="lazy" decoding="async" />
              <span className="portrait-index" aria-hidden="true">0{index + 1} <span>/ REGARDS</span></span>
              {index === 0 && <div className="portrait-feature-overlay"><p>{story.category}</p><h3 id={`portrait-${story.id}`}>{story.title}</h3></div>}
            </div>
            <div className="portrait-copy">
              {index !== 0 && <><p className="portrait-category">{story.category}</p><h3 id={`portrait-${story.id}`}>{story.title}</h3></>}
              <p className="portrait-excerpt">{story.excerpt}</p>
              <span className="portrait-read" aria-hidden="true">Découvrir le récit <span><ArrowUpRight size={19} strokeWidth={1.5} /></span></span>
            </div>
          </a>
        </article>)}
      </div>
      <p className="portraits-presentation-note">Récits de présentation · Photographies d’illustration.</p>
    </div>
    <SectionNotice notice={notice} onClose={clearNotice} />
  </section>
}
