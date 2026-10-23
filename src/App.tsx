import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { NewsSection } from './components/NewsSection'
import { OceanTvSection } from './components/OceanTvSection'
import { OpportunitiesSection } from './components/OpportunitiesSection'
import { TrainingSection } from './components/TrainingSection'
import { EventsSection } from './components/EventsSection'
import { PortraitsSection } from './components/PortraitsSection'
import { Footer } from './components/Footer'
import { ArticlePage } from './components/ArticlePage'
import { newsArticles } from './lib/news-content'

function HomePage() {
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(id)
      if (!section) return
      section.focus({ preventScroll: true })
      section.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return <main id="main-content" tabIndex={-1} aria-label="Contenu principal" className="page-main">
    <Hero />
    <NewsSection />
    <OceanTvSection />
    <OpportunitiesSection />
    <TrainingSection />
    <EventsSection />
    <PortraitsSection />
  </main>
}

export default function App() {
  const articleId = window.location.pathname.match(/^\/actualites\/([^/]+)\/?$/)?.[1]
  const article = articleId ? newsArticles.find(item => item.id === articleId) : undefined

  return (
    <MotionConfig reducedMotion="user">
      <Header />
      {article ? <ArticlePage article={article} /> : <HomePage />}
      <Footer />
    </MotionConfig>
  )
}
