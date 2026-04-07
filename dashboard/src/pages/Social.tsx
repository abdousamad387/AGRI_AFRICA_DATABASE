import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Social() {
  const { data, loading } = useData('social')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgMO = latest.length ? (latest.reduce((s, d) => s + (Number(d["Main d'œuvre agri (% total)"]) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgFemmes = latest.length ? (latest.reduce((s, d) => s + (Number(d['Femmes en agriculture (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgRevenu = latest.length ? (latest.reduce((s, d) => s + (Number(d['Revenu mensuel agri moyen ($)']) || 0), 0) / latest.length).toFixed(0) : '—'
  const avgPauvrete = latest.length ? (latest.reduce((s, d) => s + (Number(d['Pauvreté rurale (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgJeunes = latest.length ? (latest.reduce((s, d) => s + (Number(d['Jeunes agriculteurs < 35 ans (%)']) || 0), 0) / latest.length).toFixed(1) : '—'

  const moByYear = aggregateByYear(filtered, "Main d'œuvre agri (% total)")
  const revenuByYear = aggregateByYear(filtered, 'Revenu mensuel agri moyen ($)')
  const pauvreteByYear = aggregateByYear(filtered, 'Pauvreté rurale (%)')
  const femmesByRegion = aggregateByRegion(data, 'Femmes en agriculture (%)', yearRange[1])
  const pauvreteByRegion = aggregateByRegion(data, 'Pauvreté rurale (%)', yearRange[1])
  const genreByYear = aggregateByYear(filtered, 'Score genre agriculture (0-10)')

  // Multi-line social indicators
  const socialEvol = (() => {
    const map = new Map<number, { femmes: number; jeunes: number; formel: number; n: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { femmes: 0, jeunes: 0, formel: 0, n: 0 }
      e.femmes += Number(d['Femmes en agriculture (%)']) || 0
      e.jeunes += Number(d['Jeunes agriculteurs < 35 ans (%)']) || 0
      e.formel += Number(d['Emplois agri formels (%)']) || 0
      e.n++
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y,
      [t('soc.legend.women')]: Math.round(e.femmes / e.n * 10) / 10,
      [t('soc.legend.youth')]: Math.round(e.jeunes / e.n * 10) / 10,
      [t('soc.legend.formal')]: Math.round(e.formel / e.n * 10) / 10,
    })).sort((a, b) => a.year - b.year)
  })()

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="👷" value={`${avgMO}%`} label={t('soc.kpi.labor')} />
        <KPICard icon="👩" value={`${avgFemmes}%`} label={t('soc.kpi.women')} />
        <KPICard icon="👶" value={`${avgJeunes}%`} label={t('soc.kpi.youth')} />
        <KPICard icon="💵" value={`${avgRevenu}${t('soc.incomeUnit')}`} label={t('soc.kpi.income')} trendDir="down" trend={t('soc.kpi.incomeTrend')} />
        <KPICard icon="📉" value={`${avgPauvrete}%`} label={t('soc.kpi.poverty')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-people" /></span> {t('soc.chart.indicators')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={socialEvol}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey={t('soc.legend.women')} stroke="#EC407A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('soc.legend.youth')} stroke="#FFD600" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('soc.legend.formal')} stroke="#1E88E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-cash" /></span> {t('soc.chart.income')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenuByYear}>
              <defs><linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/><stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#4CAF50" fill="url(#gRev)" strokeWidth={2} name={t('soc.incomeUnit')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-down" /></span> {t('soc.chart.poverty')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pauvreteByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#E53935" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-gender-ambiguous" /></span> {t('soc.chart.gender')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={genreByYear}>
              <defs><linearGradient id="gGenre" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EC407A" stopOpacity={0.3}/><stop offset="95%" stopColor="#EC407A" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#EC407A" fill="url(#gGenre)" strokeWidth={2} name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-person-workspace" /></span> {t('soc.chart.womenRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={femmesByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#EC407A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-person-badge" /></span> {t('soc.chart.labor')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#FB8C00" strokeWidth={2} dot={false} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
