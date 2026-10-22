import { MotionConfig } from 'framer-motion'
import { Header } from './components/Header'
import { Hero } from './components/Hero'

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
      </main>
    </MotionConfig>
  )
}
