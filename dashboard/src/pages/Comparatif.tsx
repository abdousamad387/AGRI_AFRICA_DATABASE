import { useState } from 'react'
import { useData, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis } from 'recharts'

const COMPARE_COUNTRIES = ['China', 'India', 'USA', 'France', 'Brazil', 'Russia', 'Australia', 'Netherlands']
const COUNTRY_COLORS: Record<string, string> = {
  'China': '#E53935', 'India': '#FB8C00', 'USA': '#1E88E5', 'France': '#8E24AA',
  'Brazil': '#43A047', 'Russia': '#5C6BC0', 'Australia': '#00ACC1', 'Netherlands': '#FFD600'
}

export default function Comparatif() {
  const { data, loading } = useData('comparatif')
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['China', 'India', 'USA', 'France'])
  const [indicator, setIndicator] = useState('Rendement céréales (t/ha)')
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>

  // Africa average per year
  const africaData = data.filter(d => !COMPARE_COUNTRIES.includes(d['Pays']))
  const worldData = data.filter(d => COMPARE_COUNTRIES.includes(d['Pays']))

  const indicators = ['Rendement céréales (t/ha)', 'Engrais (kg/ha)', 'Irrigation (%)', 'FPI (2000=100)', 'Sous-nutrition (%)', 'Tracteurs/1000ha']

  // Build comparison lines
  const yearSet = new Set<number>()
  data.forEach(d => yearSet.add(Number(d['Année'])))
  const years = Array.from(yearSet).sort()

  const lineData = years.map(y => {
    const row: any = { year: y }
    // Africa average
    const afr = africaData.filter(d => Number(d['Année']) === y)
    row[t('comp.legend.africaAvg')] = afr.length ? Math.round(afr.reduce((s, d) => s + (Number(d[indicator]) || 0), 0) / afr.length * 100) / 100 : null

    selectedCountries.forEach(c => {
      const cd = worldData.find(d => d['Pays'] === c && Number(d['Année']) === y)
      row[c] = cd ? Number(cd[indicator]) || null : null
    })
    return row
  })

  // Radar for latest year
  const latestYear = Math.max(...years)
  const radarFields = ['Rendement céréales (t/ha)', 'Engrais (kg/ha)', 'Irrigation (%)', 'FPI (2000=100)', 'Tracteurs/1000ha']
  const radarData = radarFields.map(field => {
    const afr = africaData.filter(d => Number(d['Année']) === latestYear)
    const afrVal = afr.length ? afr.reduce((s, d) => s + (Number(d[field]) || 0), 0) / afr.length : 0
    const allVals = data.filter(d => Number(d['Année']) === latestYear).map(d => Number(d[field]) || 0)
    const maxVal = Math.max(...allVals, 1)
    const row: any = { field: field.replace(/\s*\(.*\)/, ''), [t('comp.table.africa')]: Math.round(afrVal / maxVal * 100) }
    selectedCountries.forEach(c => {
      const cd = worldData.find(d => d['Pays'] === c && Number(d['Année']) === latestYear)
      row[c] = cd ? Math.round((Number(cd[field]) || 0) / maxVal * 100) : 0
    })
    return row
  })

  // Gap table
  const gapData = (() => {
    const afr = africaData.filter(d => Number(d['Année']) === latestYear)
    return [
      { ind: t('comp.gap.yield'), unit: 't/ha', afrique: avg(afr, 'Rendement céréales (t/ha)'), monde: '3.58', ecart: '' },
      { ind: t('comp.gap.fertilizer'), unit: 'kg/ha', afrique: avg(afr, 'Engrais (kg/ha)'), monde: '135', ecart: '' },
      { ind: t('comp.gap.irrigation'), unit: '%', afrique: avg(afr, 'Irrigation (%)'), monde: '34', ecart: '' },
      { ind: t('comp.gap.tractors'), unit: '/1000ha', afrique: avg(afr, 'Tracteurs/1000ha'), monde: '19', ecart: '' },
      { ind: t('comp.gap.undernutrition'), unit: '%', afrique: avg(afr, 'Sous-nutrition (%)'), monde: '8.9', ecart: '' },
    ].map(r => ({ ...r, ecart: `${r.monde !== '0' ? Math.round((Number(r.afrique) / Number(r.monde) - 1) * 100) : 0}%` }))
  })()

  function avg(arr: any[], field: string) {
    const vals = arr.map(d => Number(d[field])).filter(v => !isNaN(v))
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '0'
  }

  const toggleCountry = (c: string) => {
    setSelectedCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  return (
    <div>
      <div className="filters-bar">
        <div className="filter-group">
          <label>{t('comp.filter.indicator')}</label>
          <select value={indicator} onChange={e => setIndicator(e.target.value)}>
            {indicators.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>{t('comp.filter.countries')}</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COMPARE_COUNTRIES.map(c => (
              <span key={c} onClick={() => toggleCountry(c)}
                style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
                  background: selectedCountries.includes(c) ? COUNTRY_COLORS[c] + '33' : 'rgba(255,255,255,0.05)',
                  color: selectedCountries.includes(c) ? COUNTRY_COLORS[c] : '#a4b0be',
                  border: `1px solid ${selectedCountries.includes(c) ? COUNTRY_COLORS[c] : 'transparent'}` }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Line comparison */}
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-down" /></span> {indicator} — {t('comp.chart.vsWorld')}</div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey={t('comp.legend.africaAvg')} stroke="#4CAF50" strokeWidth={3} dot={false} />
              {selectedCountries.map(c => (
                <Line key={c} type="monotone" dataKey={c} stroke={COUNTRY_COLORS[c]} strokeWidth={2} dot={false} strokeDasharray="5 5" />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-diagram-3" /></span> {t('comp.chart.radar')} ({latestYear})</div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="field" stroke="#a4b0be" fontSize={10} />
              <PolarRadiusAxis stroke="#a4b0be" fontSize={9} />
              <Radar name={t('comp.table.africa')} dataKey={t('comp.table.africa')} stroke="#4CAF50" fill="#4CAF50" fillOpacity={0.2} strokeWidth={2} />
              {selectedCountries.slice(0, 3).map(c => (
                <Radar key={c} name={c} dataKey={c} stroke={COUNTRY_COLORS[c]} fill={COUNTRY_COLORS[c]} fillOpacity={0.1} strokeWidth={1} />
              ))}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Gap table */}
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bar-chart-line" /></span> {t('comp.chart.gap')} ({latestYear})</div>
          <table className="data-table">
            <thead>
              <tr><th>{t('comp.table.indicator')}</th><th>{t('comp.table.africa')}</th><th>{t('comp.table.world')}</th><th>{t('comp.table.gap')}</th></tr>
            </thead>
            <tbody>
              {gapData.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{r.ind}</td>
                  <td>{r.afrique} {r.unit}</td>
                  <td>{r.monde} {r.unit}</td>
                  <td><span className={`badge ${Number(r.ecart.replace('%','')) < 0 ? 'red' : 'green'}`}>{r.ecart}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
