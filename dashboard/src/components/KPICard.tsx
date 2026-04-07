interface KPIProps {
  icon: string
  value: string | number
  label: string
  trend?: string
  trendDir?: 'up' | 'down'
}

export default function KPICard({ icon, value, label, trend, trendDir }: KPIProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <div className="kpi-icon">{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend && (
        <div className={`kpi-trend ${trendDir || ''}`}>
          {trendDir === 'up' && <i className="bi bi-arrow-up-short" />}
          {trendDir === 'down' && <i className="bi bi-arrow-down-short" />}
          {trend}
        </div>
      )}
    </div>
  )
}
