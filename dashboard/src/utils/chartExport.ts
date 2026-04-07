/**
 * Chart Export & Interaction Engine — Africa Agri Dashboard
 * R-style / Plotly modebar: PNG HD, SVG, Zoom, Pan, Fullscreen, Clipboard, Data table
 */

const WATERMARK = 'Africa Agri Database 2000–2024 | A. S. Faye'
const FILENAME_PREFIX = 'AfricaAgri'

// ─── Utilities ───

export function getChartTitle(card: Element): string {
  const titleEl = card.querySelector('.chart-title')
  if (!titleEl) return 'chart'
  return (titleEl.textContent || 'chart').trim().replace(/[^a-zA-Z0-9À-ÿ\s]/g, '').trim().replace(/\s+/g, '_').substring(0, 50)
}

function cloneSvgWithStyles(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  const computed = getComputedStyle(svgEl)
  const w = svgEl.clientWidth || parseInt(computed.width)
  const h = svgEl.clientHeight || parseInt(computed.height)
  clone.setAttribute('width', String(w))
  clone.setAttribute('height', String(h))
  clone.setAttribute('viewBox', `0 0 ${w} ${h}`)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

  const allEls = svgEl.querySelectorAll('*')
  const cloneEls = clone.querySelectorAll('*')
  allEls.forEach((el, i) => {
    const cs = getComputedStyle(el)
    const style: string[] = []
    for (let j = 0; j < cs.length; j++) {
      const prop = cs[j]
      style.push(`${prop}:${cs.getPropertyValue(prop)}`)
    }
    ;(cloneEls[i] as SVGElement).setAttribute('style', style.join(';'))
  })
  return clone
}

function addWatermark(svg: SVGSVGElement) {
  const w = parseInt(svg.getAttribute('width') || '800')
  const h = parseInt(svg.getAttribute('height') || '400')
  const wm = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  wm.setAttribute('x', String(w - 10))
  wm.setAttribute('y', String(h - 8))
  wm.setAttribute('text-anchor', 'end')
  wm.setAttribute('style', 'font-size:9px;fill:rgba(164,176,190,0.45);font-family:Inter,sans-serif;letter-spacing:0.3px')
  wm.textContent = WATERMARK
  svg.appendChild(wm)
}

async function svgToCanvas(svgEl: SVGSVGElement, scale: number = 3): Promise<HTMLCanvasElement> {
  const clone = cloneSvgWithStyles(svgEl)
  const w = parseInt(clone.getAttribute('width') || '800')
  const h = parseInt(clone.getAttribute('height') || '400')
  addWatermark(clone)

  const serializer = new XMLSerializer()
  const svgStr = serializer.serializeToString(clone)
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = url
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Toast ───

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const existing = document.querySelector('.modebar-toast')
  if (existing) existing.remove()
  const toast = document.createElement('div')
  toast.className = `modebar-toast modebar-toast-${type}`
  const icons = { success: '✓', error: '✕', info: 'ℹ' }
  toast.innerHTML = `<span class="modebar-toast-icon">${icons[type]}</span><span>${message}</span>`
  document.body.appendChild(toast)
  requestAnimationFrame(() => toast.classList.add('show'))
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => toast.remove(), 400)
  }, 2500)
}

// ─── Export API ───

export async function exportPNG(card: Element) {
  const svg = card.querySelector('.recharts-wrapper svg, svg') as SVGSVGElement | null
  if (!svg) { showToast('No chart found', 'error'); return }
  try {
    const title = getChartTitle(card)
    const canvas = await svgToCanvas(svg, 4) // 4x for ultra HD
    canvas.toBlob(blob => {
      if (blob) {
        downloadBlob(blob, `${FILENAME_PREFIX}_${title}.png`)
        showToast(`PNG 4× exported`)
      }
    }, 'image/png', 1.0)
  } catch { showToast('PNG export failed', 'error') }
}

export function exportSVG(card: Element) {
  const svg = card.querySelector('.recharts-wrapper svg, svg') as SVGSVGElement | null
  if (!svg) { showToast('No chart found', 'error'); return }
  try {
    const title = getChartTitle(card)
    const clone = cloneSvgWithStyles(svg)
    addWatermark(clone)
    const serializer = new XMLSerializer()
    const svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + serializer.serializeToString(clone)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    downloadBlob(blob, `${FILENAME_PREFIX}_${title}.svg`)
    showToast(`SVG vector exported`)
  } catch { showToast('SVG export failed', 'error') }
}

export async function copyToClipboard(card: Element) {
  const svg = card.querySelector('.recharts-wrapper svg, svg') as SVGSVGElement | null
  if (!svg) { showToast('No chart found', 'error'); return }
  try {
    const canvas = await svgToCanvas(svg, 3)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(), 'image/png')
    })
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    showToast('Copied to clipboard')
  } catch { showToast('Clipboard access denied', 'error') }
}

export async function exportFullPage(scale: number = 3) {
  const pageBody = document.querySelector('.page-body')
  if (!pageBody) return
  const cards = pageBody.querySelectorAll('.chart-card')
  let count = 0
  for (const card of cards) {
    const svg = card.querySelector('.recharts-wrapper svg, svg') as SVGSVGElement | null
    if (!svg) continue
    const title = getChartTitle(card)
    try {
      const canvas = await svgToCanvas(svg, scale)
      await new Promise<void>(resolve => {
        canvas.toBlob(blob => {
          if (blob) downloadBlob(blob, `${FILENAME_PREFIX}_${title}.png`)
          count++
          resolve()
        }, 'image/png', 1.0)
      })
    } catch { /* skip */ }
  }
  showToast(`${count} charts exported (PNG HD)`)
}

// ─── Zoom / Pan Engine ───

interface ZoomState {
  scale: number
  panX: number
  panY: number
  isPanning: boolean
  startX: number
  startY: number
}

const zoomStates = new WeakMap<Element, ZoomState>()

function getZoomState(card: Element): ZoomState {
  let state = zoomStates.get(card)
  if (!state) {
    state = { scale: 1, panX: 0, panY: 0, isPanning: false, startX: 0, startY: 0 }
    zoomStates.set(card, state)
  }
  return state
}

function applyTransform(card: Element) {
  const state = getZoomState(card)
  const wrapper = card.querySelector('.recharts-wrapper') as HTMLElement
  if (!wrapper) return
  wrapper.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`
  wrapper.style.transformOrigin = 'center center'
  wrapper.style.transition = 'transform 0.2s ease'
}

export function zoomIn(card: Element) {
  const state = getZoomState(card)
  state.scale = Math.min(state.scale * 1.3, 5)
  applyTransform(card)
  showToast(`Zoom ${Math.round(state.scale * 100)}%`, 'info')
}

export function zoomOut(card: Element) {
  const state = getZoomState(card)
  state.scale = Math.max(state.scale / 1.3, 0.5)
  applyTransform(card)
  showToast(`Zoom ${Math.round(state.scale * 100)}%`, 'info')
}

export function resetZoom(card: Element) {
  const state = getZoomState(card)
  state.scale = 1
  state.panX = 0
  state.panY = 0
  applyTransform(card)
  showToast('View reset', 'info')
}

export function autoScale(card: Element) {
  // Fit content to container
  const state = getZoomState(card)
  state.scale = 1
  state.panX = 0
  state.panY = 0
  applyTransform(card)
  showToast('Auto-scaled', 'info')
}

export function enablePan(card: Element, _active: boolean) {
  const wrapper = card.querySelector('.recharts-wrapper') as HTMLElement
  if (!wrapper) return
  const state = getZoomState(card)

  if (_active) {
    wrapper.style.cursor = 'grab'
    const onDown = (e: MouseEvent) => {
      if (state.scale <= 1) return
      state.isPanning = true
      state.startX = e.clientX - state.panX
      state.startY = e.clientY - state.panY
      wrapper.style.cursor = 'grabbing'
      wrapper.style.transition = 'none'
    }
    const onMove = (e: MouseEvent) => {
      if (!state.isPanning) return
      state.panX = e.clientX - state.startX
      state.panY = e.clientY - state.startY
      wrapper.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`
    }
    const onUp = () => {
      state.isPanning = false
      wrapper.style.cursor = 'grab'
      wrapper.style.transition = 'transform 0.2s ease'
    }
    wrapper.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    ;(wrapper as any).__panCleanup = () => {
      wrapper.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  } else {
    wrapper.style.cursor = 'default'
    ;(wrapper as any).__panCleanup?.()
  }
}

// ─── Fullscreen ───

export function toggleFullscreen(card: Element) {
  if (document.fullscreenElement === card) {
    document.exitFullscreen()
    showToast('Exited fullscreen', 'info')
  } else {
    (card as HTMLElement).requestFullscreen()
    showToast('Fullscreen — ESC to exit', 'info')
  }
}

// ─── Mouse Wheel Zoom ───

export function attachWheelZoom(card: Element) {
  const handler = (e: Event) => {
    const we = e as WheelEvent
    if (!we.ctrlKey) return
    we.preventDefault()
    const state = getZoomState(card)
    if (we.deltaY < 0) {
      state.scale = Math.min(state.scale * 1.1, 5)
    } else {
      state.scale = Math.max(state.scale / 1.1, 0.5)
    }
    const wrapper = card.querySelector('.recharts-wrapper') as HTMLElement
    if (wrapper) {
      wrapper.style.transition = 'transform 0.1s ease'
      wrapper.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`
    }
  }
  card.addEventListener('wheel', handler, { passive: false })
  return () => card.removeEventListener('wheel', handler)
}

// ─── Data Table (extract SVG data) ───

export function extractChartData(card: Element): string[][] | null {
  const svg = card.querySelector('.recharts-wrapper svg, svg')
  if (!svg) return null

  // Try to extract data from Recharts dots / bars / text
  const rows: string[][] = []

  // Axis tick texts
  const xTicks = Array.from(svg.querySelectorAll('.recharts-xAxis .recharts-cartesian-axis-tick-value'))
    .map(el => el.textContent || '')
  const yTicks = Array.from(svg.querySelectorAll('.recharts-yAxis .recharts-cartesian-axis-tick-value'))
    .map(el => el.textContent || '')

  // Legend items
  const legends = Array.from(svg.querySelectorAll('.recharts-legend-item-text'))
    .map(el => el.textContent || '')

  if (xTicks.length > 0 || yTicks.length > 0) {
    rows.push(['Axis X values', ...xTicks])
    if (yTicks.length > 0) rows.push(['Axis Y values', ...yTicks])
    if (legends.length > 0) rows.push(['Series', ...legends])
  }

  // Tooltip data from bar/line data attributes
  const bars = svg.querySelectorAll('.recharts-bar-rectangle, .recharts-line-dot')
  if (bars.length > 0) {
    rows.push(['Data points', String(bars.length)])
  }

  return rows.length > 0 ? rows : null
}

export function exportCSV(card: Element) {
  const data = extractChartData(card)
  if (!data) { showToast('No data to export', 'error'); return }
  const title = getChartTitle(card)
  const csv = data.map(row => row.map(c => `"${c}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `${FILENAME_PREFIX}_${title}.csv`)
  showToast('CSV exported')
}
