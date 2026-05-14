import { createTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    fontFamilyMono: string
    fontFamilyDisplay: string
  }

  interface TypographyVariantsOptions {
    fontFamilyMono?: string
    fontFamilyDisplay?: string
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'var(--color-canvas)',
      paper: 'var(--color-surface-1)',
    },
    primary: {
      main: 'var(--color-primary)',
      contrastText: 'var(--color-on-primary)',
    },
    text: {
      primary: 'var(--color-ink)',
      secondary: 'var(--color-ink-subtle)',
    },
    divider: 'var(--color-hairline)',
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: 'var(--font-text)',
    fontFamilyMono: 'var(--font-mono)',
    fontFamilyDisplay: 'var(--font-display)',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'var(--color-surface-1)',
          borderColor: 'var(--color-hairline)',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          width: '100%',
          borderCollapse: 'collapse',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid var(--color-hairline)',
          padding: '10px 12px',
          color: 'var(--color-ink)',
          fontSize: 13,
          fontFamily: 'var(--font-text)',
        },
        head: {
          backgroundColor: 'var(--color-surface-2)',
          color: 'var(--color-ink-subtle)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-text)',
          textTransform: 'none',
          minHeight: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--radius-pill)',
          fontFamily: 'var(--font-text)',
          fontWeight: 600,
        },
        sizeSmall: {
          height: 20,
          fontSize: 11,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
  },
})
