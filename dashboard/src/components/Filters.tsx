import { getRegions, getCountries } from '../hooks/useData'
import { useLanguage } from '../i18n'

interface Props {
  data: any[]
  region: string
  country: string
  onRegionChange: (r: string) => void
  onCountryChange: (c: string) => void
  yearRange?: [number, number]
  onYearChange?: (y: [number, number]) => void
  years?: number[]
}

export default function Filters({ data, region, country, onRegionChange, onCountryChange, yearRange, onYearChange, years }: Props) {
  const { t } = useLanguage()
  const regions = getRegions(data)
  const countries = getCountries(data, region)

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <label><i className="bi bi-geo-alt" /> {t('filter.region')}</label>
        <select value={region} onChange={e => { onRegionChange(e.target.value); onCountryChange('All') }}>
          {regions.map(r => <option key={r} value={r}>{r === 'All' ? t('allRegions') : r}</option>)}
        </select>
      </div>
      <div className="filter-group">
        <label><i className="bi bi-flag" /> {t('filter.country')}</label>
        <select value={country} onChange={e => onCountryChange(e.target.value)}>
          {countries.map(c => <option key={c} value={c}>{c === 'All' ? t('allCountries') : c}</option>)}
        </select>
      </div>
      {yearRange && onYearChange && years && years.length > 0 && (
        <>
          <div className="filter-group">
            <label><i className="bi bi-calendar-event" /> {t('filter.startYear')}</label>
            <select value={yearRange[0]} onChange={e => onYearChange([Number(e.target.value), yearRange[1]])}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label><i className="bi bi-calendar-check" /> {t('filter.endYear')}</label>
            <select value={yearRange[1]} onChange={e => onYearChange([yearRange[0], Number(e.target.value)])}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </>
      )}
    </div>
  )
}
