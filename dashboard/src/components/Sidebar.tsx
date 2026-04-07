import { useLanguage } from '../i18n'

interface Props {
  activePage: string
  onNavigate: (page: string) => void
}

const navIds = ['accueil','production','comparatif','climat','commerce','securite','foncier','finance','technologie','social','durabilite','indices','analyses']
const navIcons: Record<string, string> = {
  accueil: 'bi-house-door', production: 'bi-bar-chart-line', comparatif: 'bi-globe-americas',
  climat: 'bi-cloud-sun', commerce: 'bi-shop', securite: 'bi-shield-check', foncier: 'bi-map',
  finance: 'bi-bank', technologie: 'bi-cpu', social: 'bi-people', durabilite: 'bi-tree',
  indices: 'bi-graph-up-arrow', analyses: 'bi-activity',
}

export default function Sidebar({ activePage, onNavigate }: Props) {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <i className="bi bi-flower1" />
          </div>
        </div>
        <h1>AFRICA AGRI</h1>
        <div className="subtitle">Database 2000–2024</div>
        <div className="lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'fr' ? 'active' : ''} onClick={() => setLang('fr')}>FR</button>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navIds.map(id => (
          <div
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <span className="nav-icon"><i className={`bi ${navIcons[id]}`} /></span>
            <span className="nav-label">{t(`nav.${id}`)}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="author">Abdou Samad Faye</span> — {t('sidebar.month')} 2026<br />
        <span>{t('sidebar.sources')}</span>
      </div>
    </div>
  )
}
