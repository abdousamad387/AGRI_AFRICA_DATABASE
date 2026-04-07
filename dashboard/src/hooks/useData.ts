import { useState, useEffect } from 'react'

const cache: Record<string, any[]> = {}

export function useData<T = any>(file: string): { data: T[]; loading: boolean } {
  const [data, setData] = useState<T[]>(cache[file] || [])
  const [loading, setLoading] = useState(!cache[file])

  useEffect(() => {
    if (cache[file]) return
    setLoading(true)
    fetch(`/data/${file}.json`)
      .then(r => r.json())
      .then(d => { cache[file] = d; setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [file])

  return { data, loading }
}

export function getRegions(data: any[]): string[] {
  const set = new Set(data.map(d => d['Région']).filter(Boolean))
  return ['All', ...Array.from(set).sort()]
}

export function getCountries(data: any[], region?: string): string[] {
  let filtered = data
  if (region && region !== 'All') filtered = data.filter(d => d['Région'] === region)
  const set = new Set(filtered.map(d => d['Pays']).filter(Boolean))
  return ['All', ...Array.from(set).sort()]
}

export function getYears(data: any[]): number[] {
  const set = new Set(data.map(d => Number(d['Année'])).filter(n => !isNaN(n)))
  return Array.from(set).sort()
}

export function filterData(data: any[], region: string, country: string, yearRange?: [number, number]) {
  let f = data
  if (region !== 'All') f = f.filter(d => d['Région'] === region)
  if (country !== 'All') f = f.filter(d => d['Pays'] === country)
  if (yearRange) f = f.filter(d => {
    const y = Number(d['Année'])
    return y >= yearRange[0] && y <= yearRange[1]
  })
  return f
}

export function aggregateByYear(data: any[], field: string): { year: number; value: number }[] {
  const map = new Map<number, { sum: number; count: number }>()
  data.forEach(d => {
    const y = Number(d['Année'])
    const v = Number(d[field])
    if (isNaN(y) || isNaN(v)) return
    const entry = map.get(y) || { sum: 0, count: 0 }
    entry.sum += v
    entry.count++
    map.set(y, entry)
  })
  return Array.from(map.entries())
    .map(([year, e]) => ({ year, value: Math.round((e.sum / e.count) * 100) / 100 }))
    .sort((a, b) => a.year - b.year)
}

export function aggregateByRegion(data: any[], field: string, year?: number): { region: string; value: number }[] {
  let filtered = data
  if (year) filtered = data.filter(d => Number(d['Année']) === year)
  const map = new Map<string, { sum: number; count: number }>()
  filtered.forEach(d => {
    const r = d['Région']
    const v = Number(d[field])
    if (!r || isNaN(v)) return
    const entry = map.get(r) || { sum: 0, count: 0 }
    entry.sum += v
    entry.count++
    map.set(r, entry)
  })
  return Array.from(map.entries())
    .map(([region, e]) => ({ region, value: Math.round((e.sum / e.count) * 100) / 100 }))
    .sort((a, b) => b.value - a.value)
}

export function topN(data: any[], field: string, n: number, year?: number): any[] {
  let filtered = year ? data.filter(d => Number(d['Année']) === year) : data
  return filtered
    .filter(d => !isNaN(Number(d[field])))
    .sort((a, b) => Number(b[field]) - Number(a[field]))
    .slice(0, n)
}

export function sumByYear(data: any[], field: string): { year: number; value: number }[] {
  const map = new Map<number, number>()
  data.forEach(d => {
    const y = Number(d['Année'])
    const v = Number(d[field])
    if (isNaN(y) || isNaN(v)) return
    map.set(y, (map.get(y) || 0) + v)
  })
  return Array.from(map.entries())
    .map(([year, value]) => ({ year, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => a.year - b.year)
}

export const COLORS = [
  '#4CAF50', '#FFD600', '#1E88E5', '#E53935', '#FB8C00',
  '#8E24AA', '#00ACC1', '#6D4C41', '#43A047', '#F9A825',
  '#5C6BC0', '#EF5350', '#26A69A', '#EC407A', '#AB47BC'
]

export const REGION_COLORS: Record<string, string> = {
  'Afrique du Nord': '#1E88E5',
  'Afrique Occidentale': '#4CAF50',
  'Afrique Centrale': '#FB8C00',
  'Afrique Orientale': '#E53935',
  'Afrique Australe': '#8E24AA',
}
