import { MotionConfig } from 'framer-motion'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { NewsSection } from './components/NewsSection'
import { OceanTvSection } from './components/OceanTvSection'
import { OpportunitiesSection } from './components/OpportunitiesSection'
import { TrainingSection } from './components/TrainingSection'
import { EventsSection } from './components/EventsSection'
import { PortraitsSection } from './components/PortraitsSection'
import { CommunicationSection } from './components/CommunicationSection'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Header />
      <main
        id="main-content"
        tabIndex={-1}
        aria-label="Contenu principal"
        className="page-main"
      >
        <Hero />
        <NewsSection />
        <OceanTvSection />
        <OpportunitiesSection />
        <TrainingSection />
        <EventsSection />
        <PortraitsSection />
        <CommunicationSection />
      </main>
      <Footer />
    </MotionConfig>
  )
}
