import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, topN, getYears, COLORS, REGION_COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from 'recharts'

export default function Production() {
  const { data, loading } = useData('production')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>

  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  // KPIs
  const avgYield = latest.length ? (latest.reduce((s, d) => s + (Number(d['Rendement céréales (t/ha)']) || 0), 0) / latest.length).toFixed(2) : '—'
  const totalProd = latest.reduce((s, d) => s + (Number(d['Production céréales (Mt)']) || 0), 0).toFixed(1)
  const avgFPI = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice prod. alimentaire (2000=100)']) || 0), 0) / latest.length).toFixed(0) : '—'
  const avgFert = latest.length ? (latest.reduce((s, d) => s + (Number(d['Engrais (kg/ha)']) || 0), 0) / latest.length).toFixed(1) : '—'

  // Charts data
  const yieldByYear = aggregateByYear(filtered, 'Rendement céréales (t/ha)')
  const fpiByYear = aggregateByYear(filtered, 'Indice prod. alimentaire (2000=100)')
  const yieldByRegion = aggregateByRegion(data, 'Rendement céréales (t/ha)', yearRange[1])
  const prodByRegion = aggregateByRegion(data, 'Production céréales (Mt)', yearRange[1])
  const top10 = topN(data, 'Production céréales (Mt)', 10, yearRange[1])

  // Multi-line: cereals, roots, cash crops by year
  const multiProd = (() => {
    const map = new Map<number, { cereales: number; racines: number; rente: number; n: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { cereales: 0, racines: 0, rente: 0, n: 0 }
      e.cereales += Number(d['Production céréales (Mt)']) || 0
      e.racines += Number(d['Production racines/tubercules (Mt)']) || 0
      e.rente += Number(d['Production cultures rente (Mt)']) || 0
      e.n++
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y, [t('prod.legend.cereals')]: Math.round(e.cereales * 10) / 10,
      [t('prod.legend.roots')]: Math.round(e.racines * 10) / 10,
      [t('prod.legend.cash')]: Math.round(e.rente * 10) / 10,
    })).sort((a, b) => a.year - b.year)
  })()

  // Livestock data
  const livestock = (() => {
    const map = new Map<number, { viande: number; lait: number; poisson: number }>()
    filtered.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y)) return
      const e = map.get(y) || { viande: 0, lait: 0, poisson: 0 }
      e.viande += Number(d['Production viande (kt)']) || 0
      e.lait += Number(d['Production lait (kt)']) || 0
      e.poisson += Number(d['Production poisson (kt)']) || 0
      map.set(y, e)
    })
    return Array.from(map.entries()).map(([y, e]) => ({
      year: y, [t('prod.legend.meat')]: Math.round(e.viande), [t('prod.legend.milk')]: Math.round(e.lait), [t('prod.legend.fish')]: Math.round(e.poisson)
    })).sort((a, b) => a.year - b.year)
  })()

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🌾" value={`${avgYield} t/ha`} label={t('prod.kpi.yield')} />
        <KPICard icon="📦" value={`${totalProd} Mt`} label={t('prod.kpi.total')} />
        <KPICard icon="📈" value={avgFPI} label={t('prod.kpi.fpi')} />
        <KPICard icon="🧪" value={`${avgFert} kg/ha`} label={t('prod.kpi.fert')} />
      </div>

      <div className="charts-grid">
        {/* Rendement céréalier par année */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> {t('prod.chart.yieldTrend')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yieldByYear}>
              <defs>
                <linearGradient id="gYield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#4CAF50" fill="url(#gYield)" strokeWidth={2} name="Yield (t/ha)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* FPI par année */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bar-chart-line" /></span> {t('prod.chart.fpi')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fpiByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#FFD600" strokeWidth={2} dot={false} name="FPI" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Production multi-filières */}
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-tree" /></span> {t('prod.chart.multiCrop')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={multiProd}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey={t('prod.legend.cereals')} stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey={t('prod.legend.roots')} stroke="#FB8C00" fill="#FB8C00" fillOpacity={0.2} strokeWidth={2} />
              <Area type="monotone" dataKey={t('prod.legend.cash')} stroke="#8E24AA" fill="#8E24AA" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Rendement par région */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-geo-alt" /></span> {t('prod.chart.yieldRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yieldByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="t/ha" radius={[0, 4, 4, 0]}>
                {yieldByRegion.map((entry, i) => (
                  <rect key={i} fill={REGION_COLORS[entry.region] || COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 10 producteurs */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-trophy" /></span> {t('prod.chart.top10')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10.map(d => ({ pays: d['Pays'], value: Number(d['Production céréales (Mt)']) }))} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="pays" type="category" width={100} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" fill="#FFD600" name="Mt" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Élevage */}
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-heart-pulse" /></span> {t('prod.chart.livestock')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={livestock}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey={t('prod.legend.meat')} stroke="#E53935" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('prod.legend.milk')} stroke="#1E88E5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('prod.legend.fish')} stroke="#00ACC1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
