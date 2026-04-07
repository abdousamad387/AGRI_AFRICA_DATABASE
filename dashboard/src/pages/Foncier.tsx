import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Foncier() {
  const { data, loading } = useData('foncier')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const totalArables = latest.reduce((s, d) => s + (Number(d['Terres arables totales (Mha)']) || 0), 0).toFixed(1)
  const totalIrrig = latest.reduce((s, d) => s + (Number(d['Terres irriguées (Mha)']) || 0), 0).toFixed(1)
  const avgIrrigPct = latest.length ? (latest.reduce((s, d) => s + (Number(d['Terres irrigées (% arables)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgDegrad = latest.length ? (latest.reduce((s, d) => s + (Number(d['Terres dégradées (% surface agri)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const totalLandGrab = latest.reduce((s, d) => s + (Number(d['Accaparement terres étrangères (Mha)']) || 0), 0).toFixed(1)

  const arablesByYear = aggregateByYear(filtered, 'Terres arables totales (Mha)')
  const irrigByYear = aggregateByYear(filtered, 'Terres irriguées (Mha)')
  const degradByRegion = aggregateByRegion(data, 'Terres dégradées (% surface agri)', yearRange[1])
  const irrigByRegion = aggregateByRegion(data, 'Terres irrigées (% arables)', yearRange[1])
  const genreByRegion = aggregateByRegion(data, 'Femmes propriétaires foncier (%)', yearRange[1])

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🌍" value={`${totalArables} Mha`} label={t('land.kpi.arable')} trend={t('land.kpi.arableTrend')} />
        <KPICard icon="💧" value={`${totalIrrig} Mha`} label={t('land.kpi.irrigated')} trend={t('land.kpi.irrigatedTrend')} />
        <KPICard icon="🏜️" value={`${avgDegrad}%`} label={t('land.kpi.degraded')} trend={t('land.kpi.degradedTrend')} trendDir="down" />
        <KPICard icon="🏗️" value={`${totalLandGrab} Mha`} label={t('land.kpi.grabbing')} trendDir="down" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-droplet" /></span> Irrigation by Region (% Arable) ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={irrigByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="% Irrigated" fill="#1E88E5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-sun" /></span> Soil Degradation by Region ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={degradByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="% Degraded" fill="#E53935" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-person" /></span> Women Land Owners by Region ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#EC407A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> Irrigated Land Trend (Mha)</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={irrigByYear}>
              <defs><linearGradient id="gIrrig" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1E88E5" stopOpacity={0.3}/><stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#1E88E5" fill="url(#gIrrig)" strokeWidth={2} name="Mha" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
