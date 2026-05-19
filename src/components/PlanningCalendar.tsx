import { useMemo, useState } from 'react'
import dayjs, { type Dayjs } from 'dayjs'
import { Badge, Box, Card, Eyebrow, PageTitle, Stack, Typography } from './Ui'
import { useLang } from '../lib/i18n'
import { useQuery } from '../lib/useQuery'
import { fetchProiecte, fetchSubansambluri } from '../lib/api'
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { MonthCalendar } from '@mui/x-date-pickers/MonthCalendar'
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import { YearCalendar } from '@mui/x-date-pickers/YearCalendar'
import { buildPlanningBuckets, type PlanningItem, type PlanningTone } from '../lib/planning'
import { formatDateLabel } from '../lib/dateUtils'
import { ErrorBanner } from './StateViews'

function toneColor(tone: PlanningTone) {
  if (tone === 'danger') return '#f87171'
  if (tone === 'success') return '#4ade80'
  return '#fbbf24'
}

function PlanningDay(
  props: PickersDayProps & {
    highlightsByDate?: Record<string, PlanningItem[]>
  },
) {
  const { day, outsideCurrentMonth, highlightsByDate = {}, ...other } = props
  const key = day.format('YYYY-MM-DD')
  const items = highlightsByDate[key] ?? []
  const topTone = items[0]?.tone
  const color = topTone ? toneColor(topTone) : 'transparent'

  return (
    <Box sx={{ position: 'relative' }}>
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          border: topTone ? `1px solid ${color}` : '1px solid transparent',
          bgcolor: topTone ? `${color}18` : undefined,
          color: topTone ? 'var(--color-ink)' : undefined,
        }}
      />
      {items.length > 0 && (
        <Box sx={{ position: 'absolute', right: 4, bottom: 4, width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      )}
    </Box>
  )
}

function SummaryList({ title, rows, emptyLabel }: { title: string; rows: PlanningItem[]; emptyLabel: string }) {
  return (
    <Card>
      <Eyebrow sx={{ mb: 2 }}>{title}</Eyebrow>
      <Stack gap={1}>
        {rows.length === 0 ? <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{emptyLabel}</Typography> : rows.map(row => (
          <Box key={`${row.kind}-${row.date}-${row.title}`} sx={{ borderLeft: `3px solid ${toneColor(row.tone)}`, pl: 1.25, py: 0.25 }}>
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>{row.title}</Typography>
            <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{row.subtitle}</Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  )
}

export default function PlanningCalendar() {
  const { t } = useLang()
  const p = t.planning
  const proiecte = useQuery(fetchProiecte)
  const subansambluri = useQuery(fetchSubansambluri)
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(dayjs())
  const [visibleYear, setVisibleYear] = useState<Dayjs>(dayjs())
  const [loadingMonth, setLoadingMonth] = useState(false)

  const planning = useMemo(() => buildPlanningBuckets({
    today: dayjs().format('YYYY-MM-DD'),
    proiecte: proiecte.data ?? [],
    subansambluri: subansambluri.data ?? [],
  }), [proiecte.data, subansambluri.data])

  const highlightsByDate = useMemo(() => planning.calendarItems.reduce<Record<string, PlanningItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = []
    acc[item.date]!.push(item)
    return acc
  }, {}), [planning.calendarItems])

  const selectedItems = highlightsByDate[selectedDate.format('YYYY-MM-DD')] ?? []
  const err = proiecte.error || subansambluri.error

  return (
    <Stack gap={4}>
      <PageTitle eyebrow={p.eyebrow} title={p.title} subtitle={p.subtitle} />
      {err && <ErrorBanner message={err} />}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1.3fr) minmax(240px, 0.7fr)', gap: 2 }}>
        <Card>
          <Eyebrow sx={{ mb: 2 }}>{p.overview}</Eyebrow>
          <DateCalendar
            value={selectedDate}
            onChange={value => value && setSelectedDate(value)}
            onMonthChange={month => {
              setVisibleMonth(month)
              setLoadingMonth(true)
              setTimeout(() => setLoadingMonth(false), 180)
            }}
            loading={loadingMonth}
            renderLoading={() => <DayCalendarSkeleton />}
            slots={{ day: PlanningDay as any }}
            slotProps={{ day: { highlightsByDate } as any }}
            sx={{ width: '100%', maxWidth: '100%' }}
          />
          <Box sx={{ borderTop: '1px solid var(--color-hairline)', mt: 1.5, pt: 1.5 }}>
            <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>{formatDateLabel(selectedDate.format('YYYY-MM-DD'))}</Typography>
            <Stack gap={1}>
              {selectedItems.length === 0 ? <Typography variant="body2" sx={{ fontSize: 12, color: 'var(--color-ink-subtle)' }}>{p.empty}</Typography> : selectedItems.map(item => (
                <Stack key={`${item.kind}-${item.title}-${item.date}`} direction="row" alignItems="center" gap={1}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: toneColor(item.tone), flexShrink: 0 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 600 }}>{item.title}</Typography>
                    <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>{item.subtitle}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Card>

        <Stack gap={2}>
          <Card>
            <Eyebrow sx={{ mb: 1.5 }}>{p.month}</Eyebrow>
            <MonthCalendar
              value={visibleMonth}
              onChange={value => {
                setVisibleMonth(value)
                setSelectedDate(selectedDate.month(value.month()))
              }}
            />
          </Card>
          <Card>
            <Eyebrow sx={{ mb: 1.5 }}>{p.year}</Eyebrow>
            <YearCalendar
              value={visibleYear}
              onChange={value => {
                setVisibleYear(value)
                setSelectedDate(selectedDate.year(value.year()))
              }}
            />
          </Card>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <SummaryList title={p.overdue} rows={planning.overdue} emptyLabel={p.empty} />
        <SummaryList title={p.upcoming} rows={planning.upcoming} emptyLabel={p.empty} />
        <SummaryList title={p.completed} rows={planning.completed} emptyLabel={p.empty} />
      </Box>
    </Stack>
  )
}
