import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Securite() {
  const { data, loading } = useData('securite')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgFSI = latest.length ? (latest.reduce((s, d) => s + (Number(d['Score sécurité alimentaire (0-100)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgUndernut = latest.length ? (latest.reduce((s, d) => s + (Number(d['Sous-nutrition (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const totalUndernut = latest.reduce((s, d) => s + (Number(d['Personnes sous-nourries (M)']) || 0), 0).toFixed(0)
  const avgStunting = latest.length ? (latest.reduce((s, d) => s + (Number(d['Retard croissance enfants <5 ans (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgCalories = latest.length ? (latest.reduce((s, d) => s + (Number(d['Apport calorique/hab/jour (kcal)']) || 0), 0) / latest.length).toFixed(0) : '—'

  const fsiByYear = aggregateByYear(filtered, 'Score sécurité alimentaire (0-100)')
  const undernutByYear = aggregateByYear(filtered, 'Sous-nutrition (%)')
  const stuntingByYear = aggregateByYear(filtered, 'Retard croissance enfants <5 ans (%)')
  const caloriesByYear = aggregateByYear(filtered, 'Apport calorique/hab/jour (kcal)')
  const fsiByRegion = aggregateByRegion(data, 'Score sécurité alimentaire (0-100)', yearRange[1])
  const undernutByRegion = aggregateByRegion(data, 'Sous-nutrition (%)', yearRange[1])
  const oddByRegion = aggregateByRegion(data, 'ODD2 score progression (0-10)', yearRange[1])

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🍽️" value={`${avgFSI}/100`} label={t('sec.kpi.score')} trend={t('sec.kpi.stagnation')} trendDir="down" />
        <KPICard icon="⚠️" value={`${avgUndernut}%`} label={t('sec.kpi.undernutrition')} trend={t('sec.kpi.undernutritionTrend')} />
        <KPICard icon="👥" value={`${totalUndernut}M`} label={t('sec.kpi.undernourished')} trendDir="down" trend={t('sec.kpi.undernourishedTrend')} />
        <KPICard icon="👶" value={`${avgStunting}%`} label={t('sec.kpi.stunting')} trend={t('sec.kpi.stuntingTrend')} />
        <KPICard icon="🔥" value={`${avgCalories} kcal`} label={t('sec.kpi.caloric')} trend={t('sec.kpi.caloricTrend')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> {t('sec.chart.scoreTrend')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fsiByYear}>
              <defs><linearGradient id="gFSI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/><stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#4CAF50" fill="url(#gFSI)" strokeWidth={2} name="FSI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-exclamation-triangle" /></span> {t('sec.chart.undernutrition')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={undernutByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#E53935" strokeWidth={2} dot={{ r: 3, fill: '#E53935' }} name="%" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-person" /></span> {t('sec.chart.stunting')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stuntingByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#FB8C00" strokeWidth={2} dot={false} name="Stunting %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-fire" /></span> {t('sec.chart.caloric')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={caloriesByYear}>
              <defs><linearGradient id="gCal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFD600" stopOpacity={0.3}/><stop offset="95%" stopColor="#FFD600" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#FFD600" fill="url(#gCal)" strokeWidth={2} name="kcal" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-geo-alt" /></span> {t('sec.chart.scoreRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fsiByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="FSI" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bullseye" /></span> SDG2 Progress by Region ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={oddByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[0, 10]} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="SDG2 Score" fill="#1E88E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
