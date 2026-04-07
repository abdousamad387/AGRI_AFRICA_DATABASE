import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Durabilite() {
  const { data, loading } = useData('durabilite')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgPertes = latest.length ? (latest.reduce((s, d) => s + (Number(d['Pertes post-récolte (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgAgroeco = latest.length ? (latest.reduce((s, d) => s + (Number(d['Score agroécologie (0-10)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgDurab = latest.length ? (latest.reduce((s, d) => s + (Number(d['Score durabilité globale (0-10)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgMalabo = latest.length ? (latest.reduce((s, d) => s + (Number(d['Objectifs Malabo 2025 progression (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgBio = latest.length ? (latest.reduce((s, d) => s + (Number(d['Certification biologique (% terres)']) || 0), 0) / latest.length).toFixed(2) : '—'

  const pertesByYear = aggregateByYear(filtered, 'Pertes post-récolte (%)')
  const agroecoByYear = aggregateByYear(filtered, 'Score agroécologie (0-10)')
  const durabByYear = aggregateByYear(filtered, 'Score durabilité globale (0-10)')
  const pertesByRegion = aggregateByRegion(data, 'Pertes post-récolte (%)', yearRange[1])
  const agroecoByRegion = aggregateByRegion(data, 'Score agroécologie (0-10)', yearRange[1])
  const adaptByYear = aggregateByYear(filtered, 'Score adaptation climatique (0-10)')
  const malaboByRegion = aggregateByRegion(data, 'Objectifs Malabo 2025 progression (%)', yearRange[1])

  // Emissions multi-line
  const emissions = (() => {
    const map = new Map<number, { n2o: number; ch4: number; n: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { n2o: 0, ch4: 0, n: 0 }
      e.n2o += Number(d['Émissions N2O agri (kt)']) || 0
      e.ch4 += Number(d['Émissions méthane agri (kt)']) || 0
      e.n++
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y, 'N2O (kt)': Math.round(e.n2o), [t('dur.legend.methane')]: Math.round(e.ch4)
    })).sort((a, b) => a.year - b.year)
  })()

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="📦" value={`${avgPertes}%`} label={t('dur.kpi.losses')} trendDir="down" trend={t('dur.kpi.lossesTrend')} />
        <KPICard icon="🌿" value={`${avgAgroeco}/10`} label={t('dur.kpi.agroeco')} />
        <KPICard icon="♻️" value={`${avgDurab}/10`} label={t('dur.kpi.sustainability')} />
        <KPICard icon="🎯" value={`${avgMalabo}%`} label={t('dur.kpi.malabo')} />
        <KPICard icon="🌱" value={`${avgBio}%`} label={t('dur.kpi.organic')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-box-seam" /></span> {t('dur.chart.losses')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pertesByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#E53935" strokeWidth={2} dot={false} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-tree" /></span> {t('dur.chart.scores')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={agroecoByYear.map((d, i) => ({ ...d, durabilite: durabByYear[i]?.value || 0, adaptation: adaptByYear[i]?.value || 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={2} dot={false} name={t('dur.legend.agroeco')} />
              <Line type="monotone" dataKey="durabilite" stroke="#1E88E5" strokeWidth={2} dot={false} name={t('dur.legend.sustainability')} />
              <Line type="monotone" dataKey="adaptation" stroke="#FB8C00" strokeWidth={2} dot={false} name={t('dur.legend.adaptation')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-box-seam" /></span> {t('dur.chart.lossesRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pertesByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#E53935" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bullseye" /></span> {t('dur.chart.malaboRegion')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={malaboByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#FFD600" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-building" /></span> {t('dur.chart.emissions')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={emissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="N2O (kt)" stroke="#FB8C00" fill="#FB8C00" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey={t('dur.legend.methane')} stroke="#8E24AA" fill="#8E24AA" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
