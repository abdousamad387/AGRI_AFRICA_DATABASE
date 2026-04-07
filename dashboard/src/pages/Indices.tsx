import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, topN, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

export default function Indices() {
  const { data, loading } = useData('indices')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgCompet = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice compétitivité agri (0-100)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgMeca = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice mécanisation (0-100)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgCAADP = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice CAADP/Malabo (0-100)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgResilience = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice résilience agri (0-10)']) || 0), 0) / latest.length).toFixed(1) : '—'

  const competByYear = aggregateByYear(filtered, 'Indice compétitivité agri (0-100)')
  const competByRegion = aggregateByRegion(data, 'Indice compétitivité agri (0-100)', yearRange[1])
  const caadpByRegion = aggregateByRegion(data, 'Indice CAADP/Malabo (0-100)', yearRange[1])
  const top10 = topN(data, 'Indice compétitivité agri (0-100)', 10, yearRange[1])

  // Radar: all indices for regions
  const radarData = (() => {
    const regions = [...new Set(data.filter(d => Number(d['Année']) === yearRange[1]).map(d => d['Région']))]
    const fields = ['Indice compétitivité agri (0-100)', 'Indice mécanisation (0-100)', 'Indice inclusion financière rurale (0-100)', 'Indice CAADP/Malabo (0-100)']
    return fields.map(f => {
      const row: any = { field: f.replace(/\s*\(.*\)/, '').replace('Indice ', '') }
      regions.forEach(r => {
        const rd = data.filter(d => d['Région'] === r && Number(d['Année']) === yearRange[1])
        row[r as string] = rd.length ? Math.round(rd.reduce((s, d) => s + (Number(d[f]) || 0), 0) / rd.length) : 0
      })
      return row
    })
  })()

  const regions = [...new Set(data.map(d => d['Région']).filter(Boolean))]

  // Multi-score evolution
  const multiScore = (() => {
    const map = new Map<number, { compet: number; meca: number; resilience: number; n: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { compet: 0, meca: 0, resilience: 0, n: 0 }
      e.compet += Number(d['Indice compétitivité agri (0-100)']) || 0
      e.meca += Number(d['Indice mécanisation (0-100)']) || 0
      e.resilience += (Number(d['Indice résilience agri (0-10)']) || 0) * 10
      e.n++
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y,
      [t('idx.legend.competitiveness')]: Math.round(e.compet / e.n * 10) / 10,
      [t('idx.legend.mechanization')]: Math.round(e.meca / e.n * 10) / 10,
      [t('idx.legend.resilience')]: Math.round(e.resilience / e.n * 10) / 10,
    })).sort((a, b) => a.year - b.year)
  })()

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🏅" value={`${avgCompet}/100`} label={t('idx.kpi.competitiveness')} />
        <KPICard icon="🚜" value={`${avgMeca}/100`} label={t('idx.kpi.mechanization')} />
        <KPICard icon="🎯" value={`${avgCAADP}/100`} label={t('idx.kpi.caadp')} />
        <KPICard icon="🛡️" value={`${avgResilience}/10`} label={t('idx.kpi.resilience')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> {t('idx.chart.composite')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={multiScore}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey={t('idx.legend.competitiveness')} stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('idx.legend.mechanization')} stroke="#FB8C00" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('idx.legend.resilience')} stroke="#1E88E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-diagram-3" /></span> {t('idx.chart.radarRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="field" stroke="#a4b0be" fontSize={10} />
              <PolarRadiusAxis stroke="#a4b0be" fontSize={9} />
              {regions.map((r, i) => (
                <Radar key={r} name={r as string} dataKey={r as string} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} strokeWidth={2} />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-trophy" /></span> {t('idx.chart.top10')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={top10.map(d => ({ pays: d['Pays'], value: Number(d['Indice compétitivité agri (0-100)']) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="pays" type="category" width={100} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#FFD600" name="/100" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bullseye" /></span> {t('idx.chart.caadpRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={caadpByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="/100" fill="#8E24AA" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
