import { useState } from 'react'
import { useData, filterData, aggregateByYear, aggregateByRegion, getYears, COLORS } from '../hooks/useData'
import { useLanguage } from '../i18n'
import Filters from '../components/Filters'
import KPICard from '../components/KPICard'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts'

export default function Finance() {
  const { data, loading } = useData('finance')
  const [region, setRegion] = useState('All')
  const [country, setCountry] = useState('All')
  const years = getYears(data)
  const [yearRange, setYearRange] = useState<[number, number]>([2000, 2024])
  const { t } = useLanguage()

  if (loading) return <div>{t('loading')}</div>
  const filtered = filterData(data, region, country, yearRange)
  const latest = filtered.filter(d => Number(d['Année']) === yearRange[1])

  const avgCredit = latest.length ? (latest.reduce((s, d) => s + (Number(d['Crédit agricole (% PIB agri)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgBudget = latest.length ? (latest.reduce((s, d) => s + (Number(d['Budget agri public (% budget total)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgTaux = latest.length ? (latest.reduce((s, d) => s + (Number(d['Taux intérêt prêts agri (%)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgAssurance = latest.length ? (latest.reduce((s, d) => s + (Number(d['Assurance récolte (% agriculteurs)']) || 0), 0) / latest.length).toFixed(1) : '—'
  const avgInclusion = latest.length ? (latest.reduce((s, d) => s + (Number(d['Taux inclusion financière rurale (%)']) || 0), 0) / latest.length).toFixed(1) : '—'

  const creditByYear = aggregateByYear(filtered, 'Crédit agricole (% PIB agri)')
  const budgetByYear = aggregateByYear(filtered, 'Budget agri public (% budget total)')
  const budgetByRegion = aggregateByRegion(data, 'Budget agri public (% budget total)', yearRange[1])
  const creditByRegion = aggregateByRegion(data, 'Crédit agricole (% PIB agri)', yearRange[1])
  const inclusionByYear = aggregateByYear(filtered, 'Taux inclusion financière rurale (%)')
  const fdiByYear = aggregateByYear(filtered, 'FDI secteur agricole ($M)')

  return (
    <div>
      <Filters data={data} region={region} country={country}
        onRegionChange={setRegion} onCountryChange={setCountry}
        yearRange={yearRange} onYearChange={setYearRange} years={years} />

      <div className="kpi-grid">
        <KPICard icon="🏦" value={`${avgCredit}%`} label={t('fin.kpi.credit')} trend={t('fin.kpi.creditTrend')} trendDir="down" />
        <KPICard icon="📋" value={`${avgBudget}%`} label={t('fin.kpi.budget')} trend={t('fin.kpi.budgetTrend')} trendDir={Number(avgBudget) >= 10 ? 'up' : 'down'} />
        <KPICard icon="📈" value={`${avgTaux}%`} label={t('fin.kpi.interest')} trendDir="down" trend={t('fin.kpi.interestTrend')} />
        <KPICard icon="🛡️" value={`${avgAssurance}%`} label={t('fin.kpi.insurance')} trend={t('fin.kpi.insuranceTrend')} />
        <KPICard icon="📱" value={`${avgInclusion}%`} label={t('fin.kpi.inclusion')} trend={t('fin.kpi.inclusionTrend')} />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-bank" /></span> {t('fin.chart.creditTrend')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={creditByYear}>
              <defs><linearGradient id="gCredit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3}/><stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#4CAF50" fill="url(#gCredit)" strokeWidth={2} name="% agri GDP" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-clipboard" /></span> {t('fin.chart.budget')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={budgetByYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Line type="monotone" dataKey="value" stroke="#FFD600" strokeWidth={2} dot={false} name="Budget %" />
              {/* CAADP target line */}
              <Line type="monotone" dataKey={() => 10} stroke="#E53935" strokeWidth={1} strokeDasharray="8 4" dot={false} name={t('fin.caadpTarget')} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-geo-alt" /></span> {t('fin.chart.creditRegion')} ({yearRange[1]})</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByRegion} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#a4b0be" fontSize={11} />
              <YAxis dataKey="region" type="category" width={130} stroke="#a4b0be" fontSize={10} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Bar dataKey="value" name="% budget" fill="#FFD600" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title"><span className="icon"><i className="bi bi-phone" /></span> {t('fin.chart.inclusion')}</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={inclusionByYear}>
              <defs><linearGradient id="gIncl" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1E88E5" stopOpacity={0.3}/><stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#a4b0be" fontSize={11} />
              <YAxis stroke="#a4b0be" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#1E88E5" fill="url(#gIncl)" strokeWidth={2} name="%" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
