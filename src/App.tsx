import { lazy, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { Navigate, Outlet, Route, Routes, useLocation, useOutletContext, useParams } from 'react-router-dom'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { NewsSection } from './components/NewsSection'
import { OceanTvSection } from './components/OceanTvSection'
import { OpportunitiesSection } from './components/OpportunitiesSection'
import { TrainingSection } from './components/TrainingSection'
import { EventsSection } from './components/EventsSection'
import { Footer } from './components/Footer'
import { HomeProvider, LoadState, PageSkeleton, SiteProvider, useApi } from './lib/api'
import type { HomeData, SiteData } from '../shared/content'
import { BrandLoader } from './components/BrandLoader'
import { AppLink } from './components/AppLink'
import { RouteScroll } from './components/RouteScroll'

const ArticlePage = lazy(() => import('./components/ArticlePage').then(module => ({ default: module.ArticlePage })))
const NewsIndexPage = lazy(() => import('./components/NewsIndexPage').then(module => ({ default: module.NewsIndexPage })))
const OceanTvPage = lazy(() => import('./components/OceanTvPage').then(module => ({ default: module.OceanTvPage })))
const OpportunitiesPage = lazy(() => import('./components/OpportunitiesPage').then(module => ({ default: module.OpportunitiesPage })))
const TrainingsPage = lazy(() => import('./components/TrainingsPage').then(module => ({ default: module.TrainingsPage })))
const EventsPage = lazy(() => import('./components/EventsPage').then(module => ({ default: module.EventsPage })))
const AdminPage = lazy(() => import('./components/AdminPage').then(module => ({ default: module.AdminPage })))

function HomePage() {
  useEffect(() => { document.title = 'Océan Média TV — Informer · Former · Inspirer' }, [])
  return <main id="main-content" tabIndex={-1} aria-label="Contenu principal" className="page-main">
    <Hero /><NewsSection /><OceanTvSection /><OpportunitiesSection /><TrainingSection /><EventsSection />
  </main>
}
function HomeRoute() {
  const initial = useOutletContext<HomeData | undefined>()
  return <HomeProvider initial={initial}><HomePage /></HomeProvider>
}
function ArticleRoute() {
  const { slug = '' } = useParams()
  return <ArticlePage key={slug} slug={slug} />
}
function NotFound() {
  useEffect(() => { document.title = 'Page introuvable | Océan Média TV' }, [])
  return <main id="main-content" tabIndex={-1} className="api-bootstrap"><h1>Page introuvable</h1><p>Cette adresse ne correspond à aucune page du site.</p><AppLink href="/">Retour à l’accueil</AppLink></main>
}
function PublicLayout() {
  const location = useLocation()
  const [homeLanding] = useState(location.pathname === '/')
  const [opened, setOpened] = useState(false)
  const site = useApi<SiteData>('/site')
  const home = useApi<HomeData>(homeLanding ? '/home' : null)
  const ready = Boolean(site.data && (!homeLanding || home.data))
  useEffect(() => { if (ready) setOpened(true) }, [ready])
  if (!opened && (site.error || home.error)) return <main id="main-content" className="api-bootstrap"><LoadState error={site.error ?? home.error} retry={() => { site.retry(); home.retry() }} /></main>
  if (!site.data || (!opened && homeLanding && !home.data)) return homeLanding ? <BrandLoader light /> : <PageSkeleton />
  return <SiteProvider initial={site.data}><Header /><Suspense fallback={<PageSkeleton />}><Outlet context={home.data} /></Suspense><Footer /></SiteProvider>
}
export default function App() {
  return <MotionConfig reducedMotion="user"><RouteScroll /><Routes>
    <Route path="/admin/*" element={<Suspense fallback={<BrandLoader />}><AdminPage /></Suspense>} />
    <Route element={<PublicLayout />}>
      <Route index element={<HomeRoute />} />
      <Route path="actualites" element={<NewsIndexPage />} />
      <Route path="actualites/:slug" element={<ArticleRoute />} />
      <Route path="ocean-tv" element={<OceanTvPage />} />
      <Route path="opportunites" element={<OpportunitiesPage />} />
      <Route path="opportunites/:slug" element={<Navigate to="/opportunites" replace />} />
      <Route path="formations" element={<TrainingsPage />} />
      <Route path="evenements" element={<EventsPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes></MotionConfig>
}
