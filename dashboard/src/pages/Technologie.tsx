import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Technologie() {
  const { data, loading } = useData('technologie')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgTractors = latest.length ? (latest.reduce((s, d) => s + (Number(d['Tracteurs/1000 ha']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgFert = latest.length ? (latest.reduce((s, d) => s + (Number(d['Engrais chimiques (kg/ha)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgMobile = latest.length ? (latest.reduce((s, d) => s + (Number(d['Mobile farming adoption (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgSemences = latest.length ? (latest.reduce((s, d) => s + (Number(d['Semences améliorées (% util.)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgRD = latest.length ? (latest.reduce((s, d) => s + (Number(d['R&D agricole (% PIB)']) || 0), 0) / latest.length).toFixed(2) : '—'

  const tractorsByYear = aggregateByYear(filtered, 'Tracteurs/1000 ha')
  const fertByYear = aggregateByYear(filtered, 'Engrais chimiques (kg/ha)')
  const mobileByYear = aggregateByYear(filtered, 'Mobile farming adoption (%)')
  const semencesByYear = aggregateByYear(filtered, 'Semences améliorées (% util.)')
  const mobileByRegion = aggregateByRegion(data, 'Mobile farming adoption (%)', yearRange[1])
  const fertByRegion = aggregateByRegion(data, 'Engrais chimiques (kg/ha)', yearRange[1])
  const innovByYear = aggregateByYear(filtered, 'Score innovation agri (0-10)')

  // Multi-line tech evolution
  const techEvol = (() => {
    const map = new Map<number, { mobile: number; semences: number; electric: number; n: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { mobile: 0, semences: 0, electric: 0, n: 0 }
      e.mobile += Number(d['Mobile farming adoption (%)']) || 0
      e.semences += Number(d['Semences améliorées (% util.)']) || 0
      e.electric += Number(d['Accès electricity rurale (%)']) || 0
      e.n++
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y,
      'Mobile farming (%)': Math.round(e.mobile / e.n * 10) / 10,
      [t('tech.legend.seeds')]: Math.round(e.semences / e.n * 10) / 10,
      [t('tech.legend.electricity')]: Math.round(e.electric / e.n * 10) / 10,
    })).sort((a, b) => a.year - b.year)
  })()

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🚜" value={`${avgTractors} ${t('tech.kpi.tractorsUnit')}`} label={t('tech.kpi.tractors')} trend={t('tech.kpi.tractorsTrend')} trendDir="down" />
        <KPICard icon="🧪" value={`${avgFert} kg/ha`} label={t('tech.kpi.fertilizer')} trend={t('tech.kpi.fertilizerTrend')} trendDir="down" />
        <KPICard icon="📱" value={`${avgMobile}%`} label={t('tech.kpi.mobile')} trendDir="up" trend={t('tech.kpi.mobileTrend')} />
        <KPICard icon="🌱" value={`${avgSemences}%`} label={t('tech.kpi.seeds')} />
        <KPICard icon="🔬" value={`${avgRD}%`} label={t('tech.kpi.rd')} trend={t('tech.kpi.rdTrend')} trendDir="down" />
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> {t('tech.chart.seeds')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={techEvol}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="Mobile farming (%)" stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('tech.legend.seeds')} stroke="#FFD600" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('tech.legend.electricity')} stroke="#1E88E5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-truck" /></span> {t('tech.chart.tractors')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tractorsByYear}>
              <defs><linearGradient id="gTract" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FB8C00" stopOpacity={0.3}/><stop offset="95%" stopColor="#FB8C00" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#FB8C00" fill="url(#gTract)" strokeWidth={2} name="/1000ha" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-phone" /></span> {t('tech.chart.mobile')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mobileByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#4CAF50" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-eyedropper" /></span> {t('tech.chart.fertilizer')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={fertByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="kg/ha" fill="#8E24AA" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-lightbulb" /></span> {t('tech.chart.innovation')}</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={innovByYear}>
              <defs><linearGradient id="gInnov" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ACC1" stopOpacity={0.3}/><stop offset="95%" stopColor="#00ACC1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#00ACC1" fill="url(#gInnov)" strokeWidth={2} name="Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
