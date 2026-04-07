import { useEffect, useState, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { Layer, PathOptions } from 'leaflet'
import type { Feature, FeatureCollection } from 'geojson'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../i18n'

/* ─── Country name mapping: French data → English GeoJSON ─── */
const frToGeo: Record<string, string> = {
  'Algérie': 'Algeria', 'Angola': 'Angola', 'Bénin': 'Benin', 'Botswana': 'Botswana',
  'Burkina Faso': 'Burkina Faso', 'Burundi': 'Burundi', "Côte d'Ivoire": "Côte d'Ivoire",
  'Cabo Verde': 'Cabo Verde', 'Cameroun': 'Cameroon', 'Centrafrique': 'Central African Rep.',
  'Comores': 'Comoros', 'Congo': 'Congo', 'Djibouti': 'Djibouti', 'Égypte': 'Egypt',
  'Érythrée': 'Eritrea', 'Éthiopie': 'Ethiopia', 'Gabon': 'Gabon', 'Gambie': 'Gambia',
  'Ghana': 'Ghana', 'Guinée': 'Guinea', 'Guinée-Bissau': 'Guinea-Bissau', 'Kenya': 'Kenya',
  'Lesotho': 'Lesotho', 'Libéria': 'Liberia', 'Libye': 'Libya', 'Madagascar': 'Madagascar',
  'Malawi': 'Malawi', 'Mali': 'Mali', 'Maroc': 'Morocco', 'Maurice': 'Mauritius',
  'Mauritanie': 'Mauritania', 'Mozambique': 'Mozambique', 'Namibie': 'Namibia',
  'Niger': 'Niger', 'Nigeria': 'Nigeria', 'Ouganda': 'Uganda', 'RD Congo': 'Dem. Rep. Congo',
  'Rwanda': 'Rwanda', 'Sénégal': 'Senegal', 'Seychelles': 'Seychelles',
  'Sierra Leone': 'Sierra Leone', 'Somalie': 'Somalia', 'Soudan': 'Sudan',
  'Soudan du Sud': 'S. Sudan', 'Afrique du Sud': 'South Africa', 'Tanzanie': 'Tanzania',
  'Tchad': 'Chad', 'Togo': 'Togo', 'Tunisie': 'Tunisia', 'Zambie': 'Zambia',
  'Zimbabwe': 'Zimbabwe', 'eSwatini': 'eSwatini', 'Guinée équatoriale': 'Eq. Guinea',
  'São Tomé-et-Príncipe': 'São Tomé and Príncipe',
}
// Build reverse mapping
const geoToFr: Record<string, string> = {}
Object.entries(frToGeo).forEach(([fr, en]) => { geoToFr[en] = fr })

/* ─── Indicators ─── */
const indicators = [
  { key: 'Production céréales (Mt)', en: 'Cereal Production (Mt)', fr: 'Production céréales (Mt)' },
  { key: 'Rendement céréales (t/ha)', en: 'Cereal Yield (t/ha)', fr: 'Rendement céréales (t/ha)' },
  { key: 'PIB agricole ($Mrd)', en: 'Agricultural GDP ($Bn)', fr: 'PIB agricole ($Mrd)' },
  { key: 'PIB agri (% PIB total)', en: 'Agri GDP (% total GDP)', fr: 'PIB agri (% PIB total)' },
  { key: 'Production viande (kt)', en: 'Meat Production (kt)', fr: 'Production viande (kt)' },
  { key: 'Production lait (kt)', en: 'Milk Production (kt)', fr: 'Production lait (kt)' },
  { key: 'Engrais (kg/ha)', en: 'Fertilizer (kg/ha)', fr: 'Engrais (kg/ha)' },
  { key: 'Terres arables (Mha)', en: 'Arable Land (Mha)', fr: 'Terres arables (Mha)' },
  { key: 'Tracteurs/1000ha', en: 'Tractors/1000ha', fr: 'Tracteurs/1000ha' },
  { key: 'Indice prod. alimentaire (2000=100)', en: 'Food Production Index', fr: 'Indice prod. alimentaire (2000=100)' },
  { key: 'Pertes pré-récolte (%)', en: 'Pre-harvest Losses (%)', fr: 'Pertes pré-récolte (%)' },
  { key: 'Score mécanisation (0-10)', en: 'Mechanization Score (0-10)', fr: 'Score mécanisation (0-10)' },
]

/* ─── Color scale ─── */
const COLORS = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5']

function getColor(value: number, min: number, max: number): string {
  if (max === min) return COLORS[4]
  const ratio = (value - min) / (max - min)
  const idx = Math.min(Math.floor(ratio * COLORS.length), COLORS.length - 1)
  return COLORS[COLORS.length - 1 - idx]
}

export default function WebGIS() {
  const { lang, t } = useLanguage()
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null)
  const [data, setData] = useState<any[]>([])
  const [indicator, setIndicator] = useState(indicators[0].key)
  const [year, setYear] = useState(2024)
  const [hovered, setHovered] = useState<{ name: string; value: number | null } | null>(null)
  const geoRef = useRef<any>(null)

  // Load GeoJSON + production data
  useEffect(() => {
    const base = import.meta.env.BASE_URL
    Promise.all([
      fetch(`${base}data/africa.geojson`).then(r => r.json()),
      fetch(`${base}data/production.json`).then(r => r.json()),
    ]).then(([geo, prod]) => {
      // Filter Africa only
      const africaFeatures = geo.features.filter((f: Feature) =>
        f.properties?.CONTINENT === 'Africa'
      )
      setGeojson({ type: 'FeatureCollection', features: africaFeatures })
      setData(prod)
    })
  }, [])

  // Available years
  const years = useMemo(() => {
    const set = new Set(data.map((d: any) => Number(d['Année'])).filter((n: number) => !isNaN(n)))
    return Array.from(set).sort()
  }, [data])

  // Data for selected year, indexed by GeoJSON country name
  const countryValues = useMemo(() => {
    const map: Record<string, number> = {}
    data
      .filter((d: any) => Number(d['Année']) === year)
      .forEach((d: any) => {
        const frName = d['Pays']
        const geoName = frToGeo[frName]
        if (geoName) {
          const v = parseFloat(String(d[indicator]).replace(',', '.'))
          if (!isNaN(v)) map[geoName] = v
        }
      })
    return map
  }, [data, year, indicator])

  // Min/max for color scale
  const { min, max } = useMemo(() => {
    const vals = Object.values(countryValues)
    if (!vals.length) return { min: 0, max: 1 }
    return { min: Math.min(...vals), max: Math.max(...vals) }
  }, [countryValues])

  // Style each feature
  const style = (feature?: Feature): PathOptions => {
    if (!feature) return {}
    const name = feature.properties?.NAME
    const val = countryValues[name]
    return {
      fillColor: val !== undefined ? getColor(val, min, max) : '#1e293b',
      weight: 1,
      color: '#334155',
      fillOpacity: val !== undefined ? 0.85 : 0.3,
    }
  }

  // Hover/click interaction
  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name = feature.properties?.NAME || ''
    const frName = geoToFr[name] || name
    const val = countryValues[name]
    const displayName = lang === 'fr' ? frName : name

    layer.on({
      mouseover: (e) => {
        const l = e.target
        l.setStyle({ weight: 3, color: '#10b981', fillOpacity: 0.95 })
        l.bringToFront()
        setHovered({ name: displayName, value: val ?? null })
      },
      mouseout: (e) => {
        geoRef.current?.resetStyle(e.target)
        setHovered(null)
      },
    })

    const indLabel = lang === 'fr'
      ? indicators.find(i => i.key === indicator)?.fr
      : indicators.find(i => i.key === indicator)?.en
    layer.bindPopup(
      `<div style="font-family:Inter,sans-serif;min-width:160px">
        <strong style="font-size:14px">${displayName}</strong><br/>
        <span style="color:#94a3b8;font-size:12px">${indLabel}</span><br/>
        <span style="font-size:18px;font-weight:700;color:#10b981">${val !== undefined ? val.toLocaleString() : '—'}</span>
        <br/><span style="color:#64748b;font-size:11px">${year}</span>
      </div>`,
      { className: 'gis-popup' }
    )
  }

  const indLabel = lang === 'fr'
    ? indicators.find(i => i.key === indicator)?.fr
    : indicators.find(i => i.key === indicator)?.en

  // Force GeoJSON re-render when indicator/year/lang changes
  const geoKey = `${indicator}-${year}-${lang}`

  if (!geojson) return <div className="gis-loading"><i className="bi bi-globe-americas" /> {t('gis.loading')}</div>

  return (
    <div className="gis-container">
      {/* Controls */}
      <div className="gis-controls">
        <div className="gis-control-group">
          <label>{t('gis.indicator')}</label>
          <select value={indicator} onChange={e => setIndicator(e.target.value)}>
            {indicators.map(ind => (
              <option key={ind.key} value={ind.key}>
                {lang === 'fr' ? ind.fr : ind.en}
              </option>
            ))}
          </select>
        </div>
        <div className="gis-control-group">
          <label>{t('gis.year')}</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Hover info */}
      {hovered && (
        <div className="gis-hover-info">
          <strong>{hovered.name}</strong>
          <span>{indLabel}: <b>{hovered.value !== null ? hovered.value.toLocaleString() : '—'}</b></span>
        </div>
      )}

      {/* Map */}
      <div className="gis-map-wrapper">
        <MapContainer
          center={[2, 20]}
          zoom={3}
          minZoom={2}
          maxZoom={8}
          style={{ height: '100%', width: '100%', borderRadius: '16px' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <GeoJSON
            key={geoKey}
            ref={geoRef}
            data={geojson}
            style={style}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="gis-legend">
        <div className="gis-legend-title">{indLabel} — {year}</div>
        <div className="gis-legend-bar">
          {COLORS.slice().reverse().map((c, i) => (
            <div key={i} style={{ background: c, flex: 1, height: 12 }} />
          ))}
        </div>
        <div className="gis-legend-labels">
          <span>{min.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
