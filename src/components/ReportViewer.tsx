import { useState, useEffect, useCallback } from 'react'
import {
  Dialog, DialogTitle, IconButton, Box, Menu, MenuItem,
  Typography, Stack, CircularProgress, Tooltip, Divider, LinearProgress,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import DownloadIcon from '@mui/icons-material/Download'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CloseIcon from '@mui/icons-material/Close'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi'
import {
  listProjectReports, listBatchReports, getSignedUrl, deleteReport,
  fmtBytes, parseReportDate,
} from '../lib/reportStorage'
import type { ReportFile } from '../lib/reportStorage'
import { downloadBlob } from '../lib/exportUtils'

// ── Viewer dialog ──────────────────────────────────────────────────────────────

interface ViewerProps {
  open: boolean
  signedUrl: string
  filename: string
  onClose: () => void
}

export function ReportViewerDialog({ open, signedUrl, filename, onClose }: ViewerProps) {
  const [loaded, setLoaded] = useState(false)
  const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(signedUrl)}`

  useEffect(() => { if (open) setLoaded(false) }, [open])

  async function handleDownload() {
    const res = await fetch(signedUrl)
    const blob = await res.blob()
    downloadBlob(blob, filename)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw', height: '92vh',
          display: 'flex', flexDirection: 'column',
          bgcolor: 'var(--color-surface-2)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2.5, py: 1.5, borderBottom: '1px solid var(--color-hairline)',
        bgcolor: 'var(--color-surface-1)', flexShrink: 0,
      }}>
        <PiMicrosoftExcelLogoFill size={20} color="#1D6F42" />
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)' }}>
          {filename}
        </Typography>
        <Tooltip title="Descarca">
          <IconButton size="small" onClick={handleDownload} sx={{ color: 'var(--color-ink-muted)' }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Deschide in tab nou">
          <IconButton size="small" onClick={() => window.open(viewerUrl, '_blank')} sx={{ color: 'var(--color-ink-muted)' }}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: 'var(--color-hairline)' }} />
        <IconButton size="small" onClick={onClose} sx={{ color: 'var(--color-ink-muted)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {!loaded && <LinearProgress sx={{ flexShrink: 0 }} />}

      <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {!loaded && (
          <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0, bgcolor: 'var(--color-surface-2)', zIndex: 1 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ mt: 1.5, fontSize: 12, color: 'var(--color-ink-muted)' }}>
              Se incarca raportul...
            </Typography>
          </Stack>
        )}
        <iframe
          src={viewerUrl}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          onLoad={() => setLoaded(true)}
          title={filename}
        />
      </Box>
    </Dialog>
  )
}

// ── Per-project reports dropdown button ───────────────────────────────────────

interface ProjectReportsButtonProps {
  projectId: string | null   // null = batch mode (all projects)
  canDelete?: boolean
  refreshKey?: number         // increment from parent after a new export to bust the cache
  label?: string
  sx?: SxProps<Theme>
}

export function ProjectReportsButton({
  projectId,
  canDelete = false,
  refreshKey = 0,
  label,
  sx,
}: ProjectReportsButtonProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [reports, setReports] = useState<ReportFile[] | null>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [viewer, setViewer] = useState<{ url: string; filename: string } | null>(null)

  // Reset cache when refreshKey changes
  useEffect(() => { setReports(null) }, [refreshKey])

  const fetchReports = useCallback(async () => {
    setListLoading(true)
    setFetchErr(null)
    try {
      const data = projectId
        ? await listProjectReports(projectId)
        : await listBatchReports()
      setReports(data)
    } catch (e: unknown) {
      setFetchErr(e instanceof Error ? e.message : 'Eroare')
    } finally {
      setListLoading(false)
    }
  }, [projectId])

  function handleOpen(e: React.MouseEvent<HTMLElement>) {
    setAnchor(e.currentTarget)
    if (reports === null) fetchReports()
  }

  function handleClose() {
    setAnchor(null)
  }

  async function handleView(report: ReportFile) {
    setActionLoading(report.path)
    try {
      const url = await getSignedUrl(report.path)
      setViewer({ url, filename: report.name })
      handleClose()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Eroare la deschidere')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDownload(report: ReportFile) {
    setActionLoading(report.path + '_dl')
    try {
      const url = await getSignedUrl(report.path)
      const res = await fetch(url)
      const blob = await res.blob()
      downloadBlob(blob, report.name)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Eroare la descărcare')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(report: ReportFile) {
    if (!confirm(`Stergi raportul "${report.name}"?`)) return
    setActionLoading(report.path + '_del')
    try {
      await deleteReport(report.path)
      setReports(prev => prev?.filter(r => r.path !== report.path) ?? null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Eroare la ștergere')
    } finally {
      setActionLoading(null)
    }
  }

  const count = reports?.length ?? null
  const open = Boolean(anchor)

  return (
    <>
      <Box
        component="button"
        onClick={handleOpen}
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 0.6,
          px: '10px', py: '8px',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-sm)',
          bgcolor: open ? 'var(--color-surface-1)' : 'transparent',
          color: 'var(--color-ink-muted)',
          cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-sans)',
          fontWeight: 500, letterSpacing: 0,
          transition: 'all 0.15s',
          '&:hover': { borderColor: 'var(--color-primary)', color: 'var(--color-primary)' },
          ...sx,
        }}
      >
        <FolderOpenIcon sx={{ fontSize: 13 }} />
        {label ?? 'Rapoarte'}
        {count !== null && count > 0 && (
          <Box component="span" sx={{
            ml: 0.25, px: '5px', py: '1px',
            bgcolor: 'rgba(21,101,192,0.12)', color: '#1565C0',
            borderRadius: '10px', fontSize: 10, fontWeight: 700, lineHeight: 1.4,
          }}>
            {count}
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 320, maxWidth: 400,
            bgcolor: 'var(--color-surface-2)',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {/* Menu header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid var(--color-hairline)', bgcolor: 'var(--color-surface-1)' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <PiMicrosoftExcelLogoFill size={15} color="#1D6F42" />
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>
              Rapoarte salvate
            </Typography>
            {listLoading && <CircularProgress size={12} sx={{ ml: 'auto' }} />}
            {!listLoading && (
              <IconButton size="small" onClick={() => { setReports(null); fetchReports() }} sx={{ ml: 'auto', p: 0.25, color: 'var(--color-ink-muted)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* List */}
        <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
          {listLoading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
              <CircularProgress size={20} />
            </Stack>
          )}

          {!listLoading && fetchErr && (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" sx={{ fontSize: 11, color: '#f87171' }}>{fetchErr}</Typography>
            </Box>
          )}

          {!listLoading && !fetchErr && reports?.length === 0 && (
            <Stack alignItems="center" justifyContent="center" gap={0.75} sx={{ py: 3 }}>
              <ArticleOutlinedIcon sx={{ fontSize: 28, color: 'var(--color-ink-tertiary)' }} />
              <Typography variant="body2" sx={{ fontSize: 11, color: 'var(--color-ink-muted)' }}>
                Niciun raport salvat inca
              </Typography>
            </Stack>
          )}

          {!listLoading && reports?.map((report, i) => (
            <Box key={report.path}>
              {i > 0 && <Divider sx={{ borderColor: 'var(--color-hairline)' }} />}
              <Box sx={{ px: 2, py: 1.25 }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                  <PiMicrosoftExcelLogoFill size={13} color="#1D6F42" />
                  <Typography sx={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {report.name}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography sx={{ fontSize: 10, color: 'var(--color-ink-subtle)' }}>
                    {parseReportDate(report.name)}
                    {report.size > 0 && ` · ${fmtBytes(report.size)}`}
                  </Typography>
                  <Stack direction="row" gap={0.5}>
                    <Tooltip title="Vizualizeaza">
                      <IconButton
                        size="small"
                        onClick={() => handleView(report)}
                        disabled={actionLoading === report.path}
                        sx={{ p: 0.5, color: '#1565C0', '&:hover': { bgcolor: 'rgba(21,101,192,0.08)' } }}
                      >
                        {actionLoading === report.path
                          ? <CircularProgress size={13} />
                          : <OpenInNewIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Descarca">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(report)}
                        disabled={actionLoading === report.path + '_dl'}
                        sx={{ p: 0.5, color: 'var(--color-ink-muted)', '&:hover': { bgcolor: 'var(--color-surface-2)' } }}
                      >
                        {actionLoading === report.path + '_dl'
                          ? <CircularProgress size={13} />
                          : <DownloadIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>
                    {canDelete && (
                      <Tooltip title="Sterge">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(report)}
                          disabled={actionLoading === report.path + '_del'}
                          sx={{ p: 0.5, color: 'rgba(248,113,113,0.7)', '&:hover': { bgcolor: 'rgba(248,113,113,0.08)', color: '#f87171' } }}
                        >
                          {actionLoading === report.path + '_del'
                            ? <CircularProgress size={13} />
                            : <DeleteOutlineIcon sx={{ fontSize: 14 }} />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      </Menu>

      {viewer && (
        <ReportViewerDialog
          open
          signedUrl={viewer.url}
          filename={viewer.filename}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  )
}
