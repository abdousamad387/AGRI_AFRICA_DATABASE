import { useState } from 'react'
import { useData, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import KPICard from '../components/KPICard'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, Legend, Cell } from 'recharts'

export default function Analyses() {
  const { data: corrData, loading: lCorr } = useData('correlations')
  const { data: statsData, loading: lStats } = useData('statistiques')
  const [tab, setTab] = useState<'stats' | 'corr'>('stats')
  const { t, lang } = useLanguage()

  if (lCorr || lStats) return <div>{t('loading')}</div>

  const nbObs = statsData.find(d => String(d['Statistique']).includes('Observations'))
  const nbPays = statsData.find(d => String(d['Statistique']).includes('Pays'))
  const nbAnnees = statsData.find(d => String(d['Statistique']).includes('Années'))
  const nbVars = statsData.find(d => String(d['Statistique']).includes('Variables'))

  // correlation matrix heatmap
  const corrMatrix = (() => {
    if (!corrData.length) return []
    const keys = Object.keys(corrData[0]).filter(k => k !== 'Variable')
    return corrData.map(row => {
      const rowName = String(row['Variable'] || '')
      return keys.map(k => ({
        x: k.length > 20 ? k.substring(0, 18) + '…' : k,
        y: rowName.length > 20 ? rowName.substring(0, 18) + '…' : rowName,
        value: Number(row[k]) || 0
      }))
    }).flat()
  })()

  // top positive and negative correlations
  const topCorrelations = (() => {
    if (!corrData.length) return []
    const keys = Object.keys(corrData[0]).filter(k => k !== 'Variable')
    const pairs: { pair: string; value: number }[] = []
    corrData.forEach(row => {
      const rowName = String(row['Variable'] || '')
      keys.forEach(k => {
        const val = Number(row[k]) || 0
        if (rowName !== k && Math.abs(val) !== 1) {
          pairs.push({
            pair: `${rowName.substring(0, 15)} ↔ ${k.substring(0, 15)}`,
            value: Math.round(val * 100) / 100
          })
        }
      })
    })
    // remove duplicates
    const seen = new Set<string>()
    const unique = pairs.filter(p => {
      const key = [p.pair.split(' ↔ ')[0], p.pair.split(' ↔ ')[1]].sort().join('|')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    unique.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    return unique.slice(0, 15)
  })()

  // stats summary
  const statsRows = statsData.filter(d => d['Statistique'])

  return (
    <div>
      <div className="kpi-grid">
        <KPICard icon="📊" value={nbObs ? String(Object.values(nbObs)[1] || '20,000+') : '20,000+'} label={t('ana.kpi.observations')} />
        <KPICard icon="🌍" value={nbPays ? String(Object.values(nbPays)[1] || '64') : '64'} label={t('ana.kpi.countries')} />
        <KPICard icon="📅" value={nbAnnees ? String(Object.values(nbAnnees)[1] || '25') : '25'} label={t('ana.kpi.years')} />
        <KPICard icon="📐" value={nbVars ? String(Object.values(nbVars)[1] || '200+') : '200+'} label={t('ana.kpi.variables')} />
      </div>

      <div className="tab-bar" style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button onClick={() => setTab('stats')} 
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                         background: tab === 'stats' ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                         color: tab === 'stats' ? '#000' : '#a4b0be', fontWeight: 600, fontSize: '14px' }}>
          {t('ana.tab.stats')}
        </button>
        <button onClick={() => setTab('corr')} 
                style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                         background: tab === 'corr' ? 'var(--accent-green)' : 'rgba(255,255,255,0.05)',
                         color: tab === 'corr' ? '#000' : '#a4b0be', fontWeight: 600, fontSize: '14px' }}>
          {t('ana.tab.corr')}
        </button>
      </div>

      {tab === 'stats' && (
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-clipboard" /></span> {t('ana.chart.statsSummary')}</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr>
                  {statsRows.length > 0 && Object.keys(statsRows[0]).map(k => (
                    <th key={k} style={{ background: 'rgba(76,175,80,0.15)', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-green)', fontSize: '11px', fontWeight: 600 }}>
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {statsRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    {Object.values(row).map((v, j) => (
                      <td key={j} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: j === 0 ? '#e2e8f0' : '#a4b0be' }}>
                        {typeof v === 'number' ? v.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 2 }) : String(v)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'corr' && (
        <div className="charts-grid">
          <div className="chart-card full-width">
            <div className="chart-title"><span className="icon"><i className="bi bi-link-45deg" /></span> {t('ana.chart.top15')}</div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topCorrelations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[-1, 1]} />
                <YAxis dataKey="pair" type="category" width={180} stroke="#a4b0be" fontSize={10} />
                <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
                <Bar dataKey="value" name={t('ana.corrLabel')} radius={[0, 4, 4, 0]}>
                  {topCorrelations.map((d, i) => (
                    <Cell key={i} fill={d.value >= 0 ? '#4CAF50' : '#EF5350'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full-width">
            <div className="chart-title"><span className="icon"><i className="bi bi-geo-alt" /></span> {t('ana.chart.corrMatrix')}</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: '11px', margin: '0 auto' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '6px', background: 'rgba(76,175,80,0.1)' }}></th>
                    {corrData.length > 0 && Object.keys(corrData[0]).filter(k => k !== 'Variable').map(k => (
                      <th key={k} style={{ padding: '6px 4px', writingMode: 'vertical-rl', textAlign: 'left', color: '#a4b0be', fontWeight: 500, maxHeight: '140px', background: 'rgba(76,175,80,0.05)' }}>
                        {String(k).length > 20 ? String(k).substring(0, 18) + '…' : k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {corrData.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px 8px', color: '#e2e8f0', fontWeight: 500, whiteSpace: 'nowrap', background: 'rgba(76,175,80,0.05)' }}>
                        {String(row['Variable']).length > 22 ? String(row['Variable']).substring(0, 20) + '…' : String(row['Variable'])}
                      </td>
                      {Object.keys(row).filter(k => k !== 'Variable').map(k => {
                        const val = Number(row[k]) || 0
                        const absVal = Math.abs(val)
                        const bg = val >= 0
                          ? `rgba(76, 175, 80, ${absVal * 0.6})`
                          : `rgba(239, 83, 80, ${absVal * 0.6})`
                        return (
                          <td key={k} style={{
                            padding: '4px 6px', textAlign: 'center',
                            background: bg,
                            color: absVal > 0.5 ? '#fff' : '#a4b0be',
                            fontWeight: absVal > 0.7 ? 700 : 400,
                            borderRadius: '2px'
                          }}>
                            {val.toFixed(2)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
