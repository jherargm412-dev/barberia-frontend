import { esES } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';

// Colores comunes para todos los módulos; los estados conservan sus colores semánticos.
export const theme = createTheme(
  {
    cssVariables: { colorSchemeSelector: 'class' },
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#171717', contrastText: '#ffffff' },
          secondary: { main: '#525252' },
          background: { default: '#ffffff', paper: '#fafafa' },
          text: { primary: '#171717', secondary: '#525252' },
          divider: '#e5e5e5',
        },
      },
      dark: {
        palette: {
          primary: { main: '#f5f5f5', contrastText: '#171717' },
          secondary: { main: '#a3a3a3' },
          background: { default: '#000000', paper: '#141414' },
          text: { primary: '#f5f5f5', secondary: '#a3a3a3' },
          divider: '#333333',
        },
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
      h5: { fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.3 },
      h6: { fontWeight: 600, letterSpacing: '-0.015em' },
      body2: { lineHeight: 1.6 },
    },
    components: {
      // Cabecera y tablas siguen el tema sin introducir fondos fijos en cada página.
      MuiAppBar: {
        defaultProps: { color: 'transparent', elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.vars.palette.background.paper,
            color: theme.vars.palette.text.primary,
            borderBottom: `1px solid ${theme.vars.palette.divider}`,
          }),
        },
      },
      // Respuesta breve al pulsar; respeta la preferencia de movimiento reducido.
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: {
          minHeight: 40, paddingInline: 16,
          transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms ease-out',
          '&:active:not(:disabled)': { transform: 'scale(0.96)' },
          '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: 3 },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:active': { transform: 'none' } },
        } },
      },
      MuiIconButton: {
        styleOverrides: { root: {
          minWidth: 44, minHeight: 44,
          '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: 2 },
        } },
      },
      // Une las superficies con sombras suaves; conserva divisores y bordes de campos.
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: ({ theme }) => ({
          backgroundImage: 'none',
          boxShadow: '0 0 0 1px oklch(0 0 0 / 0.06), 0 1px 2px -1px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)',
          ...theme.applyStyles('dark', { boxShadow: '0 0 0 1px oklch(1 0 0 / 0.08)' }),
        }) },
      },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px', gap: 8, flexWrap: 'wrap' } } },
      MuiAlert: { styleOverrides: { root: { alignItems: 'center' } } },
      // Un mismo ritmo visual para navegación, filtros y listados de los módulos.
      MuiListItemIcon: { styleOverrides: { root: { minWidth: 36, color: 'inherit' } } },
      MuiListItemButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 6, marginBottom: 4, minHeight: 44,
            '&.Mui-selected': { backgroundColor: theme.vars.palette.action.selected },
          }),
        },
      },
      MuiTableContainer: {
        styleOverrides: { root: ({ theme }) => ({ border: `1px solid ${theme.vars.palette.divider}`, borderRadius: 8, boxShadow: 'none' }) },
      },
      // En pantallas estrechas la paginación ocupa varias filas sin perder controles.
      MuiTablePagination: {
        styleOverrides: {
          toolbar: ({ theme }) => ({
            [theme.breakpoints.down('sm')]: { flexWrap: 'wrap', justifyContent: 'flex-end', padding: '8px 12px', rowGap: 4 },
          }),
          spacer: ({ theme }) => ({ [theme.breakpoints.down('sm')]: { display: 'none' } }),
          actions: ({ theme }) => ({ [theme.breakpoints.down('sm')]: { marginLeft: 8 } }),
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { border: 0, borderRadius: 16 } },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({ fontWeight: 600, backgroundColor: theme.vars.palette.background.paper }),
          root: { paddingBlock: 16, fontVariantNumeric: 'tabular-nums' },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          'body': { WebkitFontSmoothing: 'antialiased' },
          'a, button, input, select, textarea': { WebkitTapHighlightColor: 'transparent' },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
          },
        },
      },
    },
  },
  esES,
);
