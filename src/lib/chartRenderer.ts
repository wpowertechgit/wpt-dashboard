export interface ChartDataset {
  label?: string
  data: (number | null)[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
  fill?: boolean | string
  tension?: number
  pointRadius?: number
  borderRadius?: number
  [key: string]: unknown
}

export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export type ChartKind = 'bar' | 'line' | 'pie' | 'doughnut'

export async function renderChartToBase64(
  type: ChartKind,
  data: ChartData,
  extraOptions?: Record<string, unknown>,
  width = 640,
  height = 300
): Promise<string> {
  try {
    const { Chart, registerables } = await import('chart.js')
    Chart.register(...registerables)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const chart = new Chart(ctx, {
      type,
      data,
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            labels: { color: '#374151', font: { family: 'Calibri', size: 11 } },
          },
        },
        scales: type === 'pie' || type === 'doughnut' ? undefined : {
          x: { ticks: { color: '#374151', font: { family: 'Calibri', size: 10 } }, grid: { color: '#E5E7EB' } },
          y: { ticks: { color: '#374151', font: { family: 'Calibri', size: 10 } }, grid: { color: '#E5E7EB' } },
        },
        ...(extraOptions ?? {}),
      } as object,
    })

    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => setTimeout(r, 80))
    const base64 = canvas.toDataURL('image/png').split(',')[1]
    chart.destroy()
    return base64
  } catch {
    return ''
  }
}
