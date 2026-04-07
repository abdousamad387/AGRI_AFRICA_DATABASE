import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  exportPNG, exportSVG, copyToClipboard, exportFullPage,
  zoomIn, zoomOut, resetZoom, toggleFullscreen, enablePan,
  attachWheelZoom, showToast, exportCSV
} from '../utils/chartExport'

// ─── SVG Icons (Plotly/R-style) ───

const ICONS = {
  camera: <svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>,
  download: <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  zoomIn: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  zoomOut: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35M8 11h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  pan: <svg viewBox="0 0 24 24"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  home: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" fill="none" stroke="currentColor" strokeWidth="1.8"/><polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>,
  maximize: <svg viewBox="0 0 24 24"><polyline points="15 3 21 3 21 9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 21 3 21 3 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="3" x2="14" y2="10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="21" x2="10" y2="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  clipboard: <svg viewBox="0 0 24 24"><rect x="9" y="2" width="6" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" fill="none" stroke="currentColor" strokeWidth="1.8"/></svg>,
  svg: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M7 15l3-3 2 2 4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  table: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" strokeWidth="1.8"/><line x1="9" y1="3" x2="9" y2="21" stroke="currentColor" strokeWidth="1.8"/><line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="1.8"/></svg>,
  downloadAll: <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="5" y1="3" x2="19" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
}

type ToolId = 'png' | 'svg' | 'clipboard' | 'csv' | 'zoomIn' | 'zoomOut' | 'pan' | 'reset' | 'fullscreen'

interface ToolDef {
  id: ToolId
  icon: JSX.Element
  label: string
  group: number
}

const TOOLS: ToolDef[] = [
  { id: 'png',       icon: ICONS.camera,    label: 'Download plot as PNG',   group: 0 },
  { id: 'svg',       icon: ICONS.svg,       label: 'Download as SVG vector', group: 0 },
  { id: 'clipboard', icon: ICONS.clipboard, label: 'Copy to clipboard',      group: 0 },
  { id: 'csv',       icon: ICONS.table,     label: 'Export data as CSV',     group: 0 },
  { id: 'zoomIn',    icon: ICONS.zoomIn,    label: 'Zoom in',               group: 1 },
  { id: 'zoomOut',   icon: ICONS.zoomOut,   label: 'Zoom out',              group: 1 },
  { id: 'pan',       icon: ICONS.pan,       label: 'Pan (drag)',             group: 1 },
  { id: 'reset',     icon: ICONS.home,      label: 'Reset axes',            group: 2 },
  { id: 'fullscreen',icon: ICONS.maximize,  label: 'Fullscreen',            group: 2 },
]

// ─── Modebar Component (injected into each chart-card) ───

function Modebar({ card }: { card: Element }) {
  const [panActive, setPanActive] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  const handleClick = useCallback((id: ToolId) => {
    switch (id) {
      case 'png':       exportPNG(card); break
      case 'svg':       exportSVG(card); break
      case 'clipboard': copyToClipboard(card); break
      case 'csv':       exportCSV(card); break
      case 'zoomIn':    zoomIn(card); break
      case 'zoomOut':   zoomOut(card); break
      case 'pan':
        const next = !panActive
        setPanActive(next)
        enablePan(card, next)
        showToast(next ? 'Pan mode ON — drag to move' : 'Pan mode OFF', 'info')
        break
      case 'reset':     resetZoom(card); setPanActive(false); enablePan(card, false); break
      case 'fullscreen': toggleFullscreen(card); break
    }
  }, [card, panActive])

  // Group tools with separators
  let lastGroup = -1

  return (
    <div className="modebar">
      {TOOLS.map(tool => {
        const needsSep = lastGroup >= 0 && tool.group !== lastGroup
        lastGroup = tool.group
        return (
          <div key={tool.id} style={{ display: 'contents' }}>
            {needsSep && <div className="modebar-sep" />}
            <button
              className={`modebar-btn ${tool.id === 'pan' && panActive ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); handleClick(tool.id) }}
              onMouseEnter={() => setHovered(tool.id)}
              onMouseLeave={() => setHovered(null)}
              title={tool.label}
              aria-label={tool.label}
            >
              {tool.icon}
              {hovered === tool.id && <span className="modebar-tooltip">{tool.label}</span>}
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Zoom indicator badge ───

function ZoomBadge({ card }: { card: Element }) {
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const interval = setInterval(() => {
      const wrapper = card.querySelector('.recharts-wrapper') as HTMLElement
      if (!wrapper) return
      const t = wrapper.style.transform || ''
      const m = t.match(/scale\(([0-9.]+)\)/)
      setZoom(m ? Math.round(parseFloat(m[1]) * 100) : 100)
    }, 200)
    return () => clearInterval(interval)
  }, [card])

  if (zoom === 100) return null
  return <div className="zoom-badge">{zoom}%</div>
}

// ─── Page-level Export All button ───

function ExportAllButton() {
  return (
    <button className="export-all-btn" onClick={() => exportFullPage(4)} title="Export all charts on this page">
      {ICONS.downloadAll}
      <span>Export All Plots (PNG 4×)</span>
    </button>
  )
}

// ─── Main Controller ───

export default function ChartExporter() {
  const [cards, setCards] = useState<Element[]>([])
  const [headerEl, setHeaderEl] = useState<Element | null>(null)

  useEffect(() => {
    const scan = () => {
      const found = Array.from(document.querySelectorAll('.chart-card'))
        .filter(c => c.querySelector('svg'))
      setCards(prev => {
        if (prev.length === found.length && prev.every((p, i) => p === found[i])) return prev
        return found
      })
      const h = document.querySelector('.page-header')
      if (h) setHeaderEl(h)
    }
    scan()
    const observer = new MutationObserver(scan)
    observer.observe(document.body, { childList: true, subtree: true })
    const interval = setInterval(scan, 600)
    return () => { observer.disconnect(); clearInterval(interval) }
  }, [])

  // Attach wheel zoom to all chart cards
  useEffect(() => {
    const cleanups = cards.map(card => attachWheelZoom(card))
    return () => cleanups.forEach(fn => fn())
  }, [cards])

  // Mark cards as interactive for CSS overflow handling
  useEffect(() => {
    cards.forEach(card => {
      card.classList.add('has-modebar')
    })
  }, [cards])

  return (
    <>
      {cards.map((card, i) => createPortal(
        <>
          <Modebar card={card} key={`mb-${i}`} />
          <ZoomBadge card={card} key={`zb-${i}`} />
        </>,
        card
      ))}
      {headerEl && cards.length > 0 && createPortal(<ExportAllButton />, headerEl)}
    </>
  )
}
