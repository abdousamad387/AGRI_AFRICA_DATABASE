import { useState } from 'react'
import { LanguageProvider, useLanguage } from './i18n'
import Sidebar from './components/Sidebar'
import ChartExporter from './components/ChartExporter'
import Accueil from './pages/Accueil'
import Production from './pages/Production'
import Comparatif from './pages/Comparatif'
import Climat from './pages/Climat'
import Commerce from './pages/Commerce'
import Securite from './pages/Securite'
import Foncier from './pages/Foncier'
import Finance from './pages/Finance'
import Technologie from './pages/Technologie'
import Social from './pages/Social'
import Durabilite from './pages/Durabilite'
import Indices from './pages/Indices'
import Analyses from './pages/Analyses'
import WebGIS from './pages/WebGIS'

const pageKeys = ['accueil','production','comparatif','climat','commerce','securite','foncier','finance','technologie','social','durabilite','indices','analyses','webgis'] as const
const pageComponents: Record<string, React.FC> = {
  accueil: Accueil, production: Production, comparatif: Comparatif, climat: Climat,
  commerce: Commerce, securite: Securite, foncier: Foncier, finance: Finance,
  technologie: Technologie, social: Social, durabilite: Durabilite, indices: Indices, analyses: Analyses, webgis: WebGIS,
}
const pageIcons: Record<string, string> = {
  accueil: 'bi-house-door', production: 'bi-bar-chart-line', comparatif: 'bi-globe-americas',
  climat: 'bi-cloud-sun', commerce: 'bi-shop', securite: 'bi-shield-check', foncier: 'bi-map',
  finance: 'bi-bank', technologie: 'bi-cpu', social: 'bi-people', durabilite: 'bi-tree',
  indices: 'bi-graph-up-arrow', analyses: 'bi-activity', webgis: 'bi-globe2',
}

function AppContent() {
  const [activePage, setActivePage] = useState('accueil')
  const { t } = useLanguage()
  const PageComponent = pageComponents[activePage]
  const icon = pageIcons[activePage]

  return (
    <div className="app-layout">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-content">
        <div className="page-header">
          <div className="page-header-text">
            <h2><i className={`bi ${icon}`} /> {t(`page.${activePage}.title`)}</h2>
            <p className="page-desc">{t(`page.${activePage}.desc`)}</p>
          </div>
        </div>
        <div className="page-body">
          <PageComponent />
        </div>
      </div>
      <ChartExporter />
    </div>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}
