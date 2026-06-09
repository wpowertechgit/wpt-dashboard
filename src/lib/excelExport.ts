import type ExcelJS from 'exceljs'
import { imageUrlToBase64, fmtDate, downloadBlob, buildCSV, downloadCSV, inDateRange, todayISO } from './exportUtils'
import { renderChartToBase64 } from './chartRenderer'
import { uploadReport, projectReportPath, batchReportPath } from './reportStorage'

// ── Shared types (mirrors Supabase table shapes) ───────────────────────────────

export interface Proiect {
  id: string; client: string; responsabil: string | null
  prioritate: string; data_start: string | null; data_target: string | null
  data_done: string | null; total_sa: number; buget_ore: number
  status: string; blocaje_active: number
}

export interface Subansamblu {
  id: number; proiect: string; nr: number; nume: string
  status_global: string; progres: string; blocat: boolean; intarziat: boolean
  proiectare: string; laser: string; rolat: string; sudat: string; asamblat: string; vopsit: string
  data_start: string | null; data_due: string | null; data_done: string | null
  proiectare_done: string | null; laser_done: string | null; rolat_done: string | null
  sudat_done: string | null; asamblat_done: string | null; vopsit_done: string | null
  comentarii: string | null; conditionat_de: string | null
}

export interface Blocaj {
  id: string; data_deschidere: string; proiect: string | null; subansamblu: string | null
  departament: string | null; descriere: string; responsabil: string | null
  impact: string | null; status: string; data_rezolvare: string | null
  zile_deschis: number | null; observatii: string | null
}

export interface KpiEchipa {
  id: number; saptamana: string; echipa: string
  sa_intrare: number | null; sa_iesire: number | null; sa_blocate: number | null
  sa_intarziate: number | null; eficienta: number | null; lead_time: number | null; calitate: number | null
}

export interface FluxZilnic {
  id: number; data: string; proiect: string | null; subansamblu: string | null
  dept_origine: string; dept_destinatie: string; echipa: string | null
  validat_de: string | null; observatii: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────────

const C = {
  headerBg: 'FF1565C0',
  headerFg: 'FFFFFFFF',
  titleFg: 'FF1565C0',
  evenRow: 'FFF8FAFC',
  oddRow: 'FFFFFFFF',
  sectionBg: 'FFE3F2FD',
  green: 'FF1B5E20', greenBg: 'FFC8E6C9',
  amber: 'FFE65100', amberBg: 'FFFFF3CD',
  red: 'FFB71C1C', redBg: 'FFFFCDD2',
  muted: 'FF546E7A',
  border: 'FFD0D7DE',
}

const FONT = 'Calibri'

// ── Excel helper utilities ─────────────────────────────────────────────────────

function styleHeader(row: ExcelJS.Row) {
  row.height = 26
  row.eachCell({ includeEmpty: true }, cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.headerBg } }
    cell.font = { bold: true, color: { argb: C.headerFg }, name: FONT, size: 10 }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false }
    cell.border = {
      bottom: { style: 'medium', color: { argb: C.headerBg } },
      right: { style: 'thin', color: { argb: 'FF90A4AE' } },
    }
  })
}

function styleData(row: ExcelJS.Row, even: boolean) {
  row.height = 17
  row.eachCell({ includeEmpty: false }, cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: even ? C.evenRow : C.oddRow } }
    cell.font = { name: FONT, size: 10 }
    cell.alignment = { vertical: 'middle' }
    cell.border = { bottom: { style: 'hair', color: { argb: C.border } } }
  })
}

function setCell(ws: ExcelJS.Worksheet, addr: string, value: string, opts: Partial<ExcelJS.Style> = {}) {
  const cell = ws.getCell(addr)
  cell.value = value
  if (opts.font) cell.font = { name: FONT, ...opts.font }
  if (opts.alignment) cell.alignment = opts.alignment
  if (opts.fill) cell.fill = opts.fill
}

function statusColor(s: string): { fg: string; bg: string } {
  const v = (s ?? '').toUpperCase()
  if (['LIVRAT', 'REZOLVAT', 'FINALIZAT', '✅ FINALIZAT'].some(x => v.includes(x))) return { fg: C.green, bg: C.greenBg }
  if (['BLOCAJ', 'BLOCAT', 'DESCHIS', '⛔'].some(x => v.includes(x))) return { fg: C.red, bg: C.redBg }
  return { fg: C.amber, bg: C.amberBg }
}

async function addLogoHeader(
  wb: ExcelJS.Workbook,
  ws: ExcelJS.Worksheet,
  logoBase64: string,
  title: string,
  subtitle: string,
) {
  // 4-row header area
  for (let r = 1; r <= 4; r++) {
    ws.getRow(r).height = 17
    ws.getRow(r).eachCell({ includeEmpty: true }, cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBBDEFB' } }
    })
  }

  if (logoBase64) {
    const imgId = wb.addImage({ base64: logoBase64, extension: 'png' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ws.addImage(imgId, { tl: { col: 0, row: 0 } as any, ext: { width: 200, height: 64 } })
  }

  // Title in column E (to the right of logo)
  const titleCell = ws.getCell('F1')
  titleCell.value = title
  titleCell.font = { bold: true, size: 14, name: FONT, color: { argb: C.titleFg } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

  ws.mergeCells('F1:F2')

  const subCell = ws.getCell('F3')
  subCell.value = subtitle
  subCell.font = { size: 10, name: FONT, color: { argb: C.muted } }
  subCell.alignment = { vertical: 'middle', horizontal: 'left' }

  const genCell = ws.getCell('F4')
  genCell.value = `Generat: ${todayISO()}`
  genCell.font = { size: 9, name: FONT, color: { argb: C.muted }, italic: true }
  genCell.alignment = { vertical: 'middle', horizontal: 'left' }
}

async function embedChart(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, base64: string, startRow: number, colSpan = 10) {
  if (!base64) return
  const id = wb.addImage({ base64, extension: 'png' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ws.addImage(id, { tl: { col: 0, row: startRow } as any, br: { col: colSpan, row: startRow + 14 } as any })
  for (let r = startRow + 1; r <= startRow + 14; r++) {
    ws.getRow(r).height = 17
  }
}

// ── Sheet builders ─────────────────────────────────────────────────────────────

async function addOverviewSheet(
  wb: ExcelJS.Workbook,
  project: Proiect,
  saList: Subansamblu[],
  blocaje: Blocaj[],
  logoBase64: string,
) {
  const ws = wb.addWorksheet('Prezentare')

  ws.columns = [
    { width: 4 }, { width: 18 }, { width: 24 }, { width: 16 }, { width: 16 },
    { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
  ]

  await addLogoHeader(wb, ws, logoBase64, `Raport Proiect — ${project.id}`, project.client)

  // blank separator
  ws.getRow(5).height = 8

  // Section: Project details
  const sectionRow = ws.addRow(['', 'DETALII PROIECT'])
  sectionRow.height = 22
  sectionRow.getCell(2).font = { bold: true, size: 11, name: FONT, color: { argb: C.titleFg } }
  sectionRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } }

  const detailHeaders = ['', 'ID Proiect', 'Client', 'Responsabil', 'Start', 'Target', 'Finalizat', 'SA Total', 'Buget Ore', 'Prioritate', 'Status']
  const hRow = ws.addRow(detailHeaders)
  styleHeader(hRow)
  hRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }

  const sc = statusColor(project.status)
  const dRow = ws.addRow([
    '', project.id, project.client, project.responsabil ?? '-',
    fmtDate(project.data_start), fmtDate(project.data_target), fmtDate(project.data_done),
    project.total_sa, project.buget_ore, project.prioritate, project.status,
  ])
  styleData(dRow, false)
  dRow.height = 22
  const statusCell = dRow.getCell(11)
  statusCell.font = { bold: true, name: FONT, size: 10, color: { argb: sc.fg } }
  statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } }

  ws.getRow(ws.rowCount).height = 10

  // Section: Production summary
  const finalized = saList.filter(s => (s.progres ?? '').includes('100') || s.status_global?.includes('FINALIZAT')).length
  const blocked = saList.filter(s => s.blocat).length
  const delayed = saList.filter(s => s.intarziat).length
  const inProgress = saList.length - finalized - blocked
  const pct = saList.length > 0 ? ((finalized / saList.length) * 100).toFixed(1) : '0.0'
  const openBlocaje = blocaje.filter(b => b.proiect === project.id && b.status !== 'Rezolvat').length

  const sumSection = ws.addRow(['', 'SUMAR PRODUCTIE'])
  sumSection.height = 22
  sumSection.getCell(2).font = { bold: true, size: 11, name: FONT, color: { argb: C.titleFg } }
  sumSection.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: C.sectionBg } }

  const sumH = ws.addRow(['', 'Total SA', 'Finalizate', 'In Lucru', 'Blocate', 'Intarziate', 'Blocaje Active', 'Progres %'])
  styleHeader(sumH)
  sumH.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }

  const sumD = ws.addRow(['', saList.length, finalized, inProgress, blocked, delayed, openBlocaje, `${pct}%`])
  styleData(sumD, false)
  sumD.height = 22
  sumD.getCell(3).font = { bold: true, name: FONT, size: 10, color: { argb: C.green } }
  if (blocked > 0) sumD.getCell(5).font = { bold: true, name: FONT, size: 10, color: { argb: C.red } }
  if (openBlocaje > 0) sumD.getCell(7).font = { bold: true, name: FONT, size: 10, color: { argb: C.red } }

  ws.getRow(ws.rowCount + 1).height = 12

  // Completion donut chart
  const donutBase64 = await renderChartToBase64('doughnut', {
    labels: ['Finalizate', 'In Lucru', 'Blocate'],
    datasets: [{
      data: [finalized, Math.max(0, inProgress), blocked],
      backgroundColor: ['#1B5E20', '#1565C0', '#B71C1C'],
      borderWidth: 2,
    }],
  }, {
    plugins: {
      legend: { position: 'right', labels: { color: '#374151', font: { family: 'Calibri', size: 11 } } },
      title: { display: true, text: `Progres Subansambluri — ${pct}%`, font: { family: 'Calibri', size: 13 }, color: '#1565C0' },
    },
    cutout: '60%',
  } as Record<string, unknown>, 560, 280)

  await embedChart(wb, ws, donutBase64, ws.rowCount, 10)
}

async function addSubansambuluriSheet(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, saList: Subansamblu[], logoBase64: string) {
  ws.columns = [
    { key: 'nr', width: 5 }, { key: 'nume', width: 28 }, { key: 'status', width: 20 },
    { key: 'progres', width: 10 }, { key: 'blocat', width: 8 }, { key: 'intarziat', width: 10 },
    { key: 'proiectare', width: 14 }, { key: 'laser', width: 12 }, { key: 'rulat', width: 12 },
    { key: 'sudat', width: 12 }, { key: 'asamblat', width: 13 }, { key: 'vopsit', width: 12 },
    { key: 'start', width: 12 }, { key: 'termen', width: 12 }, { key: 'finalizat', width: 12 },
    { key: 'comentarii', width: 32 },
  ]

  await addLogoHeader(wb, ws, logoBase64, 'Subansambluri', `${saList.length} subansambluri`)

  ws.getRow(ws.rowCount + 1).height = 6

  const headers = ['Nr', 'Nume', 'Status Global', 'Progres', 'Blocat', 'Intarziat',
    'Proiectare', 'Laser', 'Rulat', 'Sudat', 'Asamblat', 'Vopsit',
    'Start', 'Termen', 'Finalizat', 'Comentarii']
  const hRow = ws.addRow(headers)
  styleHeader(hRow)

  const frozenAt = ws.rowCount
  ws.views = [{ state: 'frozen', ySplit: frozenAt }]

  saList.forEach((sa, i) => {
    const row = ws.addRow([
      sa.nr, sa.nume, sa.status_global, sa.progres,
      sa.blocat ? 'DA' : 'Nu', sa.intarziat ? 'DA' : 'Nu',
      sa.proiectare, sa.laser, sa.rolat, sa.sudat, sa.asamblat, sa.vopsit,
      fmtDate(sa.data_start), fmtDate(sa.data_due), fmtDate(sa.data_done),
      sa.comentarii ?? '',
    ])
    styleData(row, i % 2 === 0)
    const sc = statusColor(sa.status_global)
    row.getCell(3).font = { bold: true, name: FONT, size: 10, color: { argb: sc.fg } }
    row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } }
    if (sa.blocat) {
      row.getCell(5).font = { bold: true, name: FONT, size: 10, color: { argb: C.red } }
    }
    if (sa.intarziat) {
      row.getCell(6).font = { bold: true, name: FONT, size: 10, color: { argb: C.amber } }
    }
  })

  ws.getRow(ws.rowCount + 1).height = 12

  // Stage completion bar chart
  const stages = ['Proiectare', 'Laser', 'Rulat', 'Sudat', 'Asamblat', 'Vopsit']
  const stageDone = stages.map((_, si) => {
    const keys = ['proiectare_done', 'laser_done', 'rolat_done', 'sudat_done', 'asamblat_done', 'vopsit_done'] as const
    return saList.filter(s => s[keys[si]]).length
  })
  const chartBase64 = await renderChartToBase64('bar', {
    labels: stages,
    datasets: [{
      label: 'Subansambluri finalizate pe etapă',
      data: stageDone,
      backgroundColor: ['#1565C0', '#0288D1', '#0097A7', '#00897B', '#388E3C', '#558B2F'],
      borderRadius: 4,
    }],
  }, {
    plugins: {
      title: { display: true, text: 'Finalizate pe Etapă de Producție', font: { family: 'Calibri', size: 13 }, color: '#1565C0' },
    },
    scales: {
      y: { beginAtZero: true, max: saList.length, ticks: { stepSize: 1 } },
    },
  } as Record<string, unknown>, 640, 300)

  await embedChart(wb, ws, chartBase64, ws.rowCount, 15)
}

async function addBlocajeSheet(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, blocaje: Blocaj[], logoBase64: string, dateInfo: string) {
  ws.columns = [
    { key: 'id', width: 12 }, { key: 'data_d', width: 14 }, { key: 'proiect', width: 14 },
    { key: 'sub', width: 14 }, { key: 'dept', width: 14 }, { key: 'descriere', width: 36 },
    { key: 'resp', width: 18 }, { key: 'impact', width: 14 }, { key: 'status', width: 14 },
    { key: 'data_r', width: 14 }, { key: 'zile', width: 12 }, { key: 'obs', width: 28 },
  ]

  await addLogoHeader(wb, ws, logoBase64, 'Blocaje', dateInfo)

  ws.getRow(ws.rowCount + 1).height = 6

  const headers = ['ID', 'Data Deschidere', 'Proiect', 'Subansamblu', 'Departament',
    'Descriere', 'Responsabil', 'Impact', 'Status', 'Data Rezolvare', 'Zile Deschis', 'Observatii']
  const hRow = ws.addRow(headers)
  styleHeader(hRow)
  ws.views = [{ state: 'frozen', ySplit: ws.rowCount }]

  blocaje.forEach((b, i) => {
    const row = ws.addRow([
      b.id, fmtDate(b.data_deschidere), b.proiect ?? '-', b.subansamblu ?? '-',
      b.departament ?? '-', b.descriere, b.responsabil ?? '-',
      b.impact ?? '-', b.status, fmtDate(b.data_rezolvare),
      b.zile_deschis ?? '-', b.observatii ?? '',
    ])
    styleData(row, i % 2 === 0)
    const sc = statusColor(b.status)
    row.getCell(9).font = { bold: true, name: FONT, size: 10, color: { argb: sc.fg } }
    row.getCell(9).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } }
  })

  ws.getRow(ws.rowCount + 1).height = 12

  // Status pie
  const open = blocaje.filter(b => b.status !== 'Rezolvat').length
  const resolved = blocaje.length - open

  const deptCounts: Record<string, number> = {}
  blocaje.forEach(b => {
    const d = b.departament ?? 'Necunoscut'
    deptCounts[d] = (deptCounts[d] ?? 0) + 1
  })
  const deptLabels = Object.keys(deptCounts)
  const deptValues = deptLabels.map(l => deptCounts[l])

  const chartBase64 = await renderChartToBase64('bar', {
    labels: deptLabels.length > 0 ? deptLabels : ['N/A'],
    datasets: [{
      label: `Blocaje per Dept — Deschise: ${open} | Rezolvate: ${resolved}`,
      data: deptValues.length > 0 ? deptValues : [0],
      backgroundColor: '#B71C1C',
      borderRadius: 4,
    }],
  }, {
    plugins: {
      title: { display: true, text: 'Blocaje per Departament', font: { family: 'Calibri', size: 13 }, color: '#B71C1C' },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  } as Record<string, unknown>, 640, 300)

  await embedChart(wb, ws, chartBase64, ws.rowCount, 11)
}

async function addKpiSheet(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, kpi: KpiEchipa[], logoBase64: string, dateInfo: string) {
  ws.columns = [
    { key: 'sapt', width: 14 }, { key: 'echipa', width: 18 },
    { key: 'intrare', width: 12 }, { key: 'iesire', width: 12 },
    { key: 'blocate', width: 12 }, { key: 'intarz', width: 14 },
    { key: 'efic', width: 14 }, { key: 'lead', width: 12 }, { key: 'calit', width: 13 },
  ]

  await addLogoHeader(wb, ws, logoBase64, 'KPI Echipe', dateInfo)

  ws.getRow(ws.rowCount + 1).height = 6

  const headers = ['Saptamana', 'Echipa', 'SA Intrare', 'SA Iesire', 'SA Blocate',
    'SA Intarziate', 'Eficienta %', 'Lead Time', 'Calitate %']
  const hRow = ws.addRow(headers)
  styleHeader(hRow)
  ws.views = [{ state: 'frozen', ySplit: ws.rowCount }]

  kpi.forEach((k, i) => {
    const row = ws.addRow([
      k.saptamana, k.echipa,
      k.sa_intrare ?? '-', k.sa_iesire ?? '-', k.sa_blocate ?? '-', k.sa_intarziate ?? '-',
      k.eficienta != null ? `${k.eficienta}%` : '-',
      k.lead_time ?? '-',
      k.calitate != null ? `${k.calitate}%` : '-',
    ])
    styleData(row, i % 2 === 0)
    if (k.eficienta != null) {
      const c = k.eficienta >= 90 ? C.green : k.eficienta >= 70 ? C.amber : C.red
      row.getCell(7).font = { bold: true, name: FONT, size: 10, color: { argb: c } }
    }
  })

  ws.getRow(ws.rowCount + 1).height = 12

  // Efficiency line chart per team per week
  const weeks = [...new Set(kpi.map(k => k.saptamana))].sort()
  const teams = [...new Set(kpi.map(k => k.echipa))]
  const palette = ['#1565C0', '#B71C1C', '#1B5E20', '#E65100', '#6A1B9A', '#0097A7']

  const datasets = teams.map((team, ti) => ({
    label: team,
    data: weeks.map(w => kpi.find(k => k.saptamana === w && k.echipa === team)?.eficienta ?? null),
    borderColor: palette[ti % palette.length],
    backgroundColor: palette[ti % palette.length] + '33',
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 4,
    fill: false,
  }))

  const chartBase64 = await renderChartToBase64('line', {
    labels: weeks,
    datasets,
  }, {
    plugins: {
      title: { display: true, text: 'Eficienta (%) pe Saptamana si Echipa', font: { family: 'Calibri', size: 13 }, color: '#1565C0' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { callback: (v: unknown) => `${v}%` } },
    },
  } as Record<string, unknown>, 640, 300)

  await embedChart(wb, ws, chartBase64, ws.rowCount, 8)
}

async function addFluxSheet(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, flux: FluxZilnic[], logoBase64: string, dateInfo: string) {
  ws.columns = [
    { key: 'data', width: 13 }, { key: 'proiect', width: 14 }, { key: 'sub', width: 18 },
    { key: 'origine', width: 16 }, { key: 'dest', width: 18 },
    { key: 'echipa', width: 14 }, { key: 'validat', width: 18 }, { key: 'obs', width: 32 },
  ]

  await addLogoHeader(wb, ws, logoBase64, 'Flux Zilnic', dateInfo)

  ws.getRow(ws.rowCount + 1).height = 6

  const headers = ['Data', 'Proiect', 'Subansamblu', 'Dept Origine', 'Dept Destinatie', 'Echipa', 'Validat De', 'Observatii']
  const hRow = ws.addRow(headers)
  styleHeader(hRow)
  ws.views = [{ state: 'frozen', ySplit: ws.rowCount }]

  flux.forEach((f, i) => {
    const row = ws.addRow([
      fmtDate(f.data), f.proiect ?? '-', f.subansamblu ?? '-',
      f.dept_origine, f.dept_destinatie,
      f.echipa ?? '-', f.validat_de ?? '-', f.observatii ?? '',
    ])
    styleData(row, i % 2 === 0)
  })

  ws.getRow(ws.rowCount + 1).height = 12

  // Flow by dept-origin chart
  const origCounts: Record<string, number> = {}
  flux.forEach(f => { origCounts[f.dept_origine] = (origCounts[f.dept_origine] ?? 0) + 1 })
  const origLabels = Object.keys(origCounts)
  const origVals = origLabels.map(l => origCounts[l])

  const chartBase64 = await renderChartToBase64('bar', {
    labels: origLabels.length > 0 ? origLabels : ['N/A'],
    datasets: [{
      label: 'Intrari flux per departament',
      data: origVals.length > 0 ? origVals : [0],
      backgroundColor: ['#1565C0', '#0288D1', '#0097A7', '#00897B', '#388E3C', '#558B2F'],
      borderRadius: 4,
    }],
  }, {
    plugins: {
      title: { display: true, text: 'Flux Zilnic — Intrari per Departament', font: { family: 'Calibri', size: 13 }, color: '#1565C0' },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  } as Record<string, unknown>, 640, 300)

  await embedChart(wb, ws, chartBase64, ws.rowCount, 7)
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function buildPerProjectExcel(
  project: Proiect,
  saList: Subansamblu[],
  blocaje: Blocaj[],
  kpiData: KpiEchipa[],
  fluxData: FluxZilnic[],
  dateRange: { from: string; to: string },
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WPT Dashboard'
  wb.created = new Date()

  const dateInfo = `Perioada: ${dateRange.from} — ${dateRange.to}`
  const logoBase64 = await imageUrlToBase64('/wpt logo-01.png')

  const projSa = saList.filter(s => s.proiect === project.id)
  const projBlocaje = blocaje.filter(b =>
    b.proiect === project.id && inDateRange(b.data_deschidere, dateRange.from, dateRange.to)
  )
  const filteredKpi = kpiData.filter(k => inDateRange(k.saptamana, dateRange.from, dateRange.to))
  const projFlux = fluxData.filter(f =>
    f.proiect === project.id && inDateRange(f.data, dateRange.from, dateRange.to)
  )

  await addOverviewSheet(wb, project, projSa, blocaje, logoBase64)
  await addSubansambuluriSheet(wb, wb.addWorksheet('Subansambluri'), projSa, logoBase64)
  await addBlocajeSheet(wb, wb.addWorksheet('Blocaje'), projBlocaje, logoBase64, dateInfo)
  await addKpiSheet(wb, wb.addWorksheet('KPI Echipe'), filteredKpi, logoBase64, dateInfo)
  await addFluxSheet(wb, wb.addWorksheet('Flux Zilnic'), projFlux, logoBase64, dateInfo)

  const buffer = await wb.xlsx.writeBuffer()
  const { path, filename } = projectReportPath(project.id)
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename
  )
  uploadReport(path, buffer as ArrayBuffer).catch(e => console.warn('Report upload failed:', e))
}

export async function buildBatchExcel(
  projects: Proiect[],
  allSa: Subansamblu[],
  allBlocaje: Blocaj[],
  allKpi: KpiEchipa[],
  dateRange: { from: string; to: string },
): Promise<void> {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'WPT Dashboard'
  wb.created = new Date()

  const dateInfo = `Perioada: ${dateRange.from} — ${dateRange.to}`
  const logoBase64 = await imageUrlToBase64('/wpt logo-01.png')

  // ── Sheet 1: All projects summary ──
  const wsProj = wb.addWorksheet('Proiecte')
  wsProj.columns = [
    { width: 14 }, { width: 22 }, { width: 18 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 10 }, { width: 10 }, { width: 14 }, { width: 14 }, { width: 18 }, { width: 14 },
  ]

  await addLogoHeader(wb, wsProj, logoBase64, 'Raport Toate Proiectele', `${projects.length} proiecte · ${dateInfo}`)
  wsProj.getRow(wsProj.rowCount + 1).height = 6

  const projHeaders = ['ID', 'Client', 'Responsabil', 'Start', 'Target', 'Finalizat',
    'SA Total', 'SA Final', 'Buget Ore', 'Prioritate', 'Status', 'Blocaje Active']
  const phRow = wsProj.addRow(projHeaders)
  styleHeader(phRow)
  wsProj.views = [{ state: 'frozen', ySplit: wsProj.rowCount }]

  projects.forEach((p, i) => {
    const projSa = allSa.filter(s => s.proiect === p.id)
    const finalized = projSa.filter(s => (s.progres ?? '').includes('100') || s.status_global?.includes('FINALIZAT')).length
    const row = wsProj.addRow([
      p.id, p.client, p.responsabil ?? '-',
      fmtDate(p.data_start), fmtDate(p.data_target), fmtDate(p.data_done),
      projSa.length || p.total_sa, finalized, p.buget_ore, p.prioritate, p.status, p.blocaje_active,
    ])
    styleData(row, i % 2 === 0)
    const sc = statusColor(p.status)
    row.getCell(11).font = { bold: true, name: FONT, size: 10, color: { argb: sc.fg } }
    row.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: sc.bg } }
    if (p.blocaje_active > 0) {
      row.getCell(12).font = { bold: true, name: FONT, size: 10, color: { argb: C.red } }
    }
  })

  wsProj.getRow(wsProj.rowCount + 1).height = 12

  // Status distribution pie
  const statusCounts: Record<string, number> = {}
  projects.forEach(p => { statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1 })
  const pieBase64 = await renderChartToBase64('doughnut', {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#1B5E20', '#1565C0', '#B71C1C', '#E65100'],
      borderWidth: 2,
      label: 'Status Proiecte',
    }],
  }, {
    plugins: {
      title: { display: true, text: 'Distributie Status Proiecte', font: { family: 'Calibri', size: 13 }, color: '#1565C0' },
      legend: { position: 'right' },
    },
    cutout: '55%',
  } as Record<string, unknown>, 560, 280)

  await embedChart(wb, wsProj, pieBase64, wsProj.rowCount, 11)

  // ── Sheet 2: Active blockages ──
  const activeBlocaje = allBlocaje.filter(b =>
    b.status !== 'Rezolvat' && inDateRange(b.data_deschidere, dateRange.from, dateRange.to)
  )
  await addBlocajeSheet(wb, wb.addWorksheet('Blocaje Active'), activeBlocaje, logoBase64, dateInfo)

  // ── Sheet 3: KPI all teams ──
  const filteredKpi = allKpi.filter(k => inDateRange(k.saptamana, dateRange.from, dateRange.to))
  await addKpiSheet(wb, wb.addWorksheet('KPI Echipe'), filteredKpi, logoBase64, dateInfo)

  const buffer = await wb.xlsx.writeBuffer()
  const { path, filename } = batchReportPath()
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    filename
  )
  uploadReport(path, buffer as ArrayBuffer).catch(e => console.warn('Batch report upload failed:', e))
}

// ── CSV exports ────────────────────────────────────────────────────────────────

export function exportProjectCSV(project: Proiect, saList: Subansamblu[]): void {
  const projSa = saList.filter(s => s.proiect === project.id)
  const csv = buildCSV(
    ['Nr', 'Nume', 'Status', 'Progres', 'Blocat', 'Intarziat',
      'Proiectare', 'Laser', 'Rulat', 'Sudat', 'Asamblat', 'Vopsit',
      'Start', 'Termen', 'Finalizat', 'Comentarii'],
    projSa.map(s => [
      s.nr, s.nume, s.status_global, s.progres,
      s.blocat ? 'DA' : 'Nu', s.intarziat ? 'DA' : 'Nu',
      s.proiectare, s.laser, s.rolat, s.sudat, s.asamblat, s.vopsit,
      s.data_start ?? '', s.data_due ?? '', s.data_done ?? '',
      s.comentarii ?? '',
    ])
  )
  downloadCSV(csv, `WPT_${project.id}_Subansambluri_${todayISO()}.csv`)
}

export function exportBatchCSV(projects: Proiect[], allSa: Subansamblu[]): void {
  const csv = buildCSV(
    ['ID', 'Client', 'Responsabil', 'Start', 'Target', 'Finalizat',
      'SA Total', 'SA Finalizate', 'Buget Ore', 'Prioritate', 'Status', 'Blocaje Active'],
    projects.map(p => {
      const projSa = allSa.filter(s => s.proiect === p.id)
      const finalized = projSa.filter(s => (s.progres ?? '').includes('100') || s.status_global?.includes('FINALIZAT')).length
      return [
        p.id, p.client, p.responsabil ?? '',
        p.data_start ?? '', p.data_target ?? '', p.data_done ?? '',
        projSa.length || p.total_sa, finalized, p.buget_ore,
        p.prioritate, p.status, p.blocaje_active,
      ]
    })
  )
  downloadCSV(csv, `WPT_AllProjects_${todayISO()}.csv`)
}
