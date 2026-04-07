import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, COLORS, REGION_COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area, ScatterChart, Scatter, ZAxis } from 'recharts'

export default function Climat() {
  const { data, loading } = useData('climat')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>

  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgPluvio = latest.length ? (latest.reduce((s, d) => s + (Number(d['Pluviométrie (mm/an)']) || 0), 0) / latest.length).toFixed(0) : '—'
  const avgStress = latest.length ? (latest.reduce((s, d) => s + (Number(d['Stress hydrique (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgDrought = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice sécheresse (0-10)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgNDVI = latest.length ? (latest.reduce((s, d) => s + (Number(d['Indice NDVI (végétation 0-1)']) || 0), 0) / latest.length).toFixed(3) : '—'

  const pluvioByYear = aggregateByYear(filtered, 'Pluviométrie (mm/an)')
  const anomalyByYear = aggregateByYear(filtered, 'Anomalie pluviométrique (%)')
  const tempByYear = aggregateByYear(filtered, 'Anomalie température (°C)')
  const ndviByYear = aggregateByYear(filtered, 'Indice NDVI (végétation 0-1)')
  const stressByRegion = aggregateByRegion(data, 'Stress hydrique (%)', yearRange[1])
  const droughtByRegion = aggregateByRegion(data, 'Indice sécheresse (0-10)', yearRange[1])
  const co2ByYear = aggregateByYear(filtered, 'Émissions CO2 agri (MtCO2eq)')
  const deforestByRegion = aggregateByRegion(data, 'Déforestation (000 ha/an)', yearRange[1])

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🌧️" value={`${avgPluvio} mm`} label={t('clim.kpi.rainfall')} />
        <KPICard icon="💧" value={`${avgStress}%`} label={t('clim.kpi.stress')} trendDir={Number(avgStress) > 40 ? 'down' : 'up'} trend={Number(avgStress) > 40 ? t('clim.kpi.stressSevere') : t('clim.kpi.stressModerate')} />
        <KPICard icon="🏜️" value={`${avgDrought}/10`} label={t('clim.kpi.drought')} />
        <KPICard icon="🌿" value={avgNDVI} label={t('clim.kpi.ndvi')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-cloud-rain" /></span> {t('clim.chart.rainfall')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={pluvioByYear}>
              <defs><linearGradient id="gPluvio" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1E88E5" stopOpacity={0.3}/><stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#1E88E5" fill="url(#gPluvio)" strokeWidth={2} name="mm/an" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-down" /></span> {t('clim.chart.anomaly')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={anomalyByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="Anomaly (%)" fill="#FB8C00">
                {anomalyByYear.map((entry, i) => (
                  <rect key={i} fill={entry.value >= 0 ? '#4CAF50' : '#E53935'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-thermometer-half" /></span> {t('clim.chart.temp')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tempByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#E53935" strokeWidth={2} dot={{ r: 3, fill: '#E53935' }} name="°C" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-tree" /></span> {t('clim.chart.ndvi')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={ndviByYear}>
              <defs><linearGradient id="gNDVI" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#43A047" stopOpacity={0.3}/><stop offset="95%" stopColor="#43A047" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} domain={[0, 1]} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#43A047" fill="url(#gNDVI)" strokeWidth={2} name="NDVI" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-droplet" /></span> {t('clim.chart.stressRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stressByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#E53935" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-tree-fill" /></span> {t('clim.chart.deforest')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deforestByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="000 ha/an" fill="#FB8C00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
