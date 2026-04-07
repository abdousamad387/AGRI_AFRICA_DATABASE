import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, sumByYear, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Commerce() {
  const { data, loading } = useData('commerce')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const totalExports = latest.reduce((s, d) => s + (Number(d['Exports agri ($Mrd)']) || 0), 0).toFixed(1)
  const totalImports = latest.reduce((s, d) => s + (Number(d['Imports agri ($Mrd)']) || 0), 0).toFixed(1)
  const totalBalance = latest.reduce((s, d) => s + (Number(d['Balance commerciale agri ($Mrd)']) || 0), 0).toFixed(1)
  const avgDepend = latest.length ? (latest.reduce((s, d) => s + (Number(d['Dépendance alimentaire imp. (%)']) || 0), 0) / latest.length).toFixed(1) : '—'

  const exportsByYear = sumByYear(filtered, 'Exports agri ($Mrd)')
  const importsByYear = sumByYear(filtered, 'Imports agri ($Mrd)')
  const balanceByYear = sumByYear(filtered, 'Balance commerciale agri ($Mrd)')

  // Combine exports/imports
  const tradeByYear = exportsByYear.map(e => {
    const imp = importsByYear.find(i => i.year === e.year)
    const bal = balanceByYear.find(b => b.year === e.year)
    return { year: e.year, [t('trade.legend.exports')]: e.value, [t('trade.legend.imports')]: imp?.value || 0, Balance: bal?.value || 0 }
  })

  // Commodity prices
  const priceFields = ['Prix blé international ($/t)', 'Prix maïs int. ($/t)', 'Prix riz int. ($/t)', 'Prix café int. ($/t)', 'Prix cacao int. ($/t)']
  const priceData = (() => {
    const yearMap = new Map<number, any>()
    data.forEach(d => {
      const y = Number(d['Année'])
      if (isNaN(y) || yearMap.has(y)) return
      yearMap.set(y, {
        year: y,
        [t('trade.legend.wheat')]: Number(d['Prix blé international ($/t)']) || null,
        [t('trade.legend.corn')]: Number(d['Prix maïs int. ($/t)']) || null,
        [t('trade.legend.rice')]: Number(d['Prix riz int. ($/t)']) || null,
        [t('trade.legend.coffee')]: Number(d['Prix café int. ($/t)']) || null,
        [t('trade.legend.cocoa')]: Number(d['Prix cacao int. ($/t)']) || null,
      })
    })
    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year)
  })()

  const balanceByRegion = aggregateByRegion(data, 'Balance commerciale agri ($Mrd)', yearRange[1])
  const dependByRegion = aggregateByRegion(data, 'Dépendance alimentaire imp. (%)', yearRange[1])

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="📤" value={`${totalExports} ${t('trade.bn')}`} label={t('trade.kpi.exports')} trendDir="up" />
        <KPICard icon="📥" value={`${totalImports} ${t('trade.bn')}`} label={t('trade.kpi.imports')} trendDir="down" />
        <KPICard icon="💸" value={`${totalBalance} ${t('trade.bn')}`} label={t('trade.kpi.balance')} trendDir={Number(totalBalance) < 0 ? 'down' : 'up'} trend={Number(totalBalance) < 0 ? t('trade.kpi.balanceTrend') : t('trade.kpi.surplusTrend')} />
        <KPICard icon="🔗" value={`${avgDepend}%`} label={t('trade.kpi.dependency')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-bar-chart-line" /></span> {t('trade.chart.exportsImports')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tradeByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey={t('trade.legend.exports')} fill="#4CAF50" radius={[4, 4, 0, 0]} />
              <Bar dataKey={t('trade.legend.imports')} fill="#E53935" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-graph-up" /></span> {t('trade.chart.balance')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tradeByYear}>
              <defs><linearGradient id="gBal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E53935" stopOpacity={0.3}/><stop offset="95%" stopColor="#E53935" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="Balance" stroke="#E53935" fill="url(#gBal)" strokeWidth={2} name={t('trade.chart.balance')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-link-45deg" /></span> {t('trade.chart.dependency')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dependByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="%" fill="#FB8C00" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <div className="chart-title"><span className="icon"><i className="bi bi-currency-dollar" /></span> {t('trade.chart.prices')}</div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey={t('trade.legend.wheat')} stroke="#FFD600" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('trade.legend.corn')} stroke="#4CAF50" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('trade.legend.rice')} stroke="#1E88E5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('trade.legend.coffee')} stroke="#6D4C41" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={t('trade.legend.cocoa')} stroke="#8E24AA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
