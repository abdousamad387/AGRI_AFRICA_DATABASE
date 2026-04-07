import { useData } from '../hooks/useData'
import { useLanguage } from '../i18n'
import KPICard from '../components/KPICard'

export default function Accueil() {
  const { t } = useLanguage()
  const { data: prod } = useData('production')
  const { data: securite } = useData('securite')
  const { data: commerce } = useData('commerce')

  const latest = prod.filter(d => d['Année'] === '2024' || d['Année'] === 2024)
  const nbPays = new Set(prod.map(d => d['Pays'])).size
  const avgYield = latest.length > 0
    ? (latest.reduce((s, d) => s + (Number(d['Rendement céréales (t/ha)']) || 0), 0) / latest.length).toFixed(2)
    : '—'
  const totalProd = latest.reduce((s, d) => s + (Number(d['Production céréales (Mt)']) || 0), 0).toFixed(1)
  const avgFSI = securite.filter(d => d['Année'] === '2024' || d['Année'] === 2024)
  const fsiVal = avgFSI.length > 0
    ? (avgFSI.reduce((s, d) => s + (Number(d['Score sécurité alimentaire (0-100)']) || 0), 0) / avgFSI.length).toFixed(1)
    : '—'
  const balance = commerce.filter(d => d['Année'] === '2024' || d['Année'] === 2024)
  const totalBalance = balance.reduce((s, d) => s + (Number(d['Balance commerciale agri ($Mrd)']) || 0), 0).toFixed(1)

  return (
    <div>
      <div className="accueil-hero">
        <h1>AFRICA AGRI DATABASE</h1>
        <p className="tagline">{t('accueil.tagline')}</p>
      </div>

      <div className="stats-highlight">
        <div className="stat-item">
          <div className="number">{nbPays}</div>
          <div className="label">{t('accueil.stat.countries')}</div>
        </div>
        <div className="stat-item">
          <div className="number">25</div>
          <div className="label">{t('accueil.stat.years')}</div>
        </div>
        <div className="stat-item">
          <div className="number">14</div>
          <div className="label">{t('accueil.stat.dimensions')}</div>
        </div>
        <div className="stat-item">
          <div className="number">20 000+</div>
          <div className="label">{t('accueil.stat.observations')}</div>
        </div>
        <div className="stat-item">
          <div className="number">200+</div>
          <div className="label">{t('accueil.stat.variables')}</div>
        </div>
        <div className="stat-item">
          <div className="number">9</div>
          <div className="label">{t('accueil.stat.sources')}</div>
        </div>
      </div>

      <div className="kpi-grid">
        <KPICard icon="🌾" value={`${avgYield} t/ha`} label={t('accueil.kpi.yield')} trend={t('accueil.kpi.yieldTrend')} trendDir="down" />
        <KPICard icon="📦" value={`${totalProd} Mt`} label={t('accueil.kpi.prod')} trend={t('accueil.kpi.prodTrend')} trendDir="up" />
        <KPICard icon="🍽️" value={`${fsiVal}/100`} label={t('accueil.kpi.fsi')} trend={t('accueil.kpi.fsiTrend')} trendDir="down" />
        <KPICard icon="💸" value={`${totalBalance} Bn$`} label={t('accueil.kpi.balance')} trend={t('accueil.kpi.balanceTrend')} trendDir="down" />
        <KPICard icon="🧪" value="18 kg/ha" label={t('accueil.kpi.fertilizer')} trend={t('accueil.kpi.fertilizerTrend')} trendDir="down" />
        <KPICard icon="📱" value="45%" label={t('accueil.kpi.mobile')} trend={t('accueil.kpi.mobileTrend')} trendDir="up" />
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-journal-text" /></span> {t('accueil.table.title')}</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('accueil.table.tab')}</th>
                <th>{t('accueil.table.obs')}</th>
                <th>{t('accueil.table.vars')}</th>
                <th>{t('accueil.table.content')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [t('accueil.row.production'), '1 275', '24', t('accueil.row.productionContent')],
                [t('accueil.row.comparatif'), '1 525', '19', t('accueil.row.comparatifContent')],
                [t('accueil.row.climat'), '1 275', '21', t('accueil.row.climatContent')],
                [t('accueil.row.commerce'), '1 275', '20', t('accueil.row.commerceContent')],
                [t('accueil.row.securite'), '1 275', '21', t('accueil.row.securiteContent')],
                [t('accueil.row.foncier'), '1 275', '20', t('accueil.row.foncierContent')],
                [t('accueil.row.finance'), '1 275', '21', t('accueil.row.financeContent')],
                [t('accueil.row.technologie'), '1 275', '23', t('accueil.row.technologieContent')],
                [t('accueil.row.social'), '1 275', '20', t('accueil.row.socialContent')],
                [t('accueil.row.durabilite'), '1 275', '20', t('accueil.row.durabiliteContent')],
                [t('accueil.row.indices'), '1 275', '18', t('accueil.row.indicesContent')],
              ].map(([name, obs, vars, content], i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: '#4CAF50' }}>{name}</td>
                  <td>{obs}</td>
                  <td>{vars}</td>
                  <td>{content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
