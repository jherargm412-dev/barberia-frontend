import { esES } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';

// Una sola paleta gobierna todos los módulos, sin cambiar los colores semánticos de estado.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: { palette: {
      primary: { main: '#82601F', light: '#C9A45C', dark: '#674A16', contrastText: '#FFFFFF' },
      secondary: { main: '#60616D' },
      background: { default: '#F5F4F1', paper: '#FFFFFF' },
      text: { primary: '#202024', secondary: '#62626D' },
      divider: '#E3E1DB',
      action: { hover: 'rgba(32,32,36,0.04)', selected: 'rgba(130,96,31,0.08)' },
    } },
    dark: { palette: {
      primary: { main: '#C9A45C', light: '#E0BC78', dark: '#AC8945', contrastText: '#17140D' },
      secondary: { main: '#A1A1AA' },
      background: { default: '#0B0B0D', paper: '#1C1C1F' },
      text: { primary: '#F5F5F5', secondary: '#A1A1AA' },
      divider: '#303034',
      action: { hover: 'rgba(255,255,255,0.04)', selected: 'rgba(201,164,92,0.10)' },
    } },
  },
  shape: { borderRadius: 10 },
  typography: {
    // Inter se usa si está instalada; las alternativas evitan una descarga externa obligatoria.
    fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
    fontSize: 14,
    h4: { fontSize: '1.75rem', fontWeight: 650, letterSpacing: '-0.035em', lineHeight: 1.3 },
    h5: { fontSize: '1.625rem', fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1.3 },
    h6: { fontSize: '1.125rem', fontWeight: 600, letterSpacing: '-0.02em' },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.65 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.14em' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: (theme) => ({
      body: { WebkitFontSmoothing: 'antialiased' },
      'a, button, input, select, textarea': { WebkitTapHighlightColor: 'transparent' },
      '::selection': { backgroundColor: 'rgba(201,164,92,0.25)' },
      '*': { scrollbarWidth: 'thin', scrollbarColor: theme.vars.palette.divider + ' transparent' },
      'input[type="date"], input[type="time"]': { colorScheme: 'light', ...theme.applyStyles('dark', { colorScheme: 'dark' }) },
      '@media (prefers-reduced-motion: reduce)': {
        '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
      },
    }) },
    MuiAppBar: {
      defaultProps: { color: 'transparent', elevation: 0 },
      styleOverrides: { root: ({ theme }) => ({
        backgroundColor: '#FFFFFF', color: theme.vars.palette.text.primary,
        borderBottom: '1px solid ' + theme.vars.palette.divider, boxShadow: 'none',
        ...theme.applyStyles('dark', { backgroundColor: '#141416' }),
      }) },
    },
    MuiToolbar: { styleOverrides: { root: { minHeight: '72px !important' } } },
    MuiDrawer: { styleOverrides: { paper: ({ theme }) => ({
      backgroundColor: '#FAF9F6', boxShadow: 'none', borderRight: '1px solid ' + theme.vars.palette.divider,
      ...theme.applyStyles('dark', { backgroundColor: '#141416' }),
    }) } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 42, borderRadius: 8, paddingInline: 18,
          transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1), background-color 150ms ease-out',
          '&:active:not(:disabled)': { transform: 'scale(0.96)' },
          '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: 3 },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&:active': { transform: 'none' } },
        },
        contained: ({ theme }) => ({
          ...theme.applyStyles('dark', { '&.MuiButton-colorPrimary:hover': { backgroundColor: '#E0BC78' } }),
        }),
        outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider, color: theme.vars.palette.text.primary }),
      },
    },
    MuiIconButton: { styleOverrides: { root: {
      minWidth: 44, minHeight: 44, borderRadius: 10,
      '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: 2 },
    } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: ({ theme }) => ({
        backgroundImage: 'none',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.025)',
        ...theme.applyStyles('dark', { boxShadow: '0 0 0 1px rgba(255,255,255,0.055), 0 4px 16px rgba(0,0,0,0.08)' }),
      }) },
    },
    MuiCard: { defaultProps: { elevation: 0 }, styleOverrides: { root: { borderRadius: 16, minWidth: 0 } } },
    MuiCardContent: { styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } } },
    // Los campos, sus etiquetas y Select conservan validación, foco y estados deshabilitados.
    MuiTextField: { defaultProps: { variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: ({ theme }) => ({
      borderRadius: 8, fontSize: 14, backgroundColor: theme.vars.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.divider },
      '&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.text.secondary },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.primary.main, borderWidth: 1.5 },
    }), input: { paddingBlock: 15 } } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 14 } } },
    MuiSelect: { styleOverrides: { select: { minWidth: 0 } } },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 0, marginTop: 6 } } },
    MuiDialog: { styleOverrides: { paper: ({ theme }) => ({
      borderRadius: 18, margin: 16, width: 'calc(100% - 32px)',
      ...theme.applyStyles('dark', { backgroundColor: '#252529' }),
    }) } },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600, fontSize: 20, padding: '24px 24px 16px' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '16px 24px 24px', gap: 8, flexWrap: 'wrap' } } },
    MuiMenu: { styleOverrides: { paper: ({ theme }) => ({
      borderRadius: 12, padding: 4, ...theme.applyStyles('dark', { backgroundColor: '#252529' }),
    }) } },
    MuiMenuItem: { styleOverrides: { root: { minHeight: 40, fontSize: 14, borderRadius: 6 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 500, fontSize: 12 }, sizeSmall: { height: 26 } } },
    MuiTabs: { styleOverrides: { indicator: { height: 2, borderRadius: 2 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 48 } } },
    MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12, borderRadius: 6, padding: '8px 12px' } } },
    MuiAlert: { styleOverrides: { root: { alignItems: 'center', borderRadius: 10 }, message: { minWidth: 0, overflowWrap: 'anywhere' } } },
    MuiSnackbar: { defaultProps: { anchorOrigin: { vertical: 'bottom', horizontal: 'right' } } },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 34, color: 'inherit', '& .MuiSvgIcon-root': { fontSize: 21 } } } },
    MuiListItemButton: { styleOverrides: { root: ({ theme }) => ({
      borderRadius: 8, marginBottom: 4, minHeight: 44, paddingBlock: 7,
      color: theme.vars.palette.text.secondary,
      transition: 'background-color 150ms ease-out, color 150ms ease-out',
      '&.Mui-focusVisible': { outline: '2px solid ' + theme.vars.palette.primary.main, outlineOffset: -2 },
      '&.Mui-selected': {
        backgroundColor: theme.vars.palette.action.selected, color: theme.vars.palette.text.primary,
        ...theme.applyStyles('dark', { backgroundColor: '#252529' }),
        '& .MuiListItemIcon-root': { color: theme.vars.palette.primary.main },
      },
    }) } },
    // Tablas uniformes: el desbordamiento se limita al contenedor y no a la página.
    MuiTableContainer: { styleOverrides: { root: ({ theme }) => ({
      maxWidth: '100%', overflowX: 'auto', border: '1px solid ' + theme.vars.palette.divider,
      borderRadius: 12, boxShadow: 'none',
    }) } },
    MuiTableCell: { styleOverrides: {
      head: ({ theme }) => ({
        fontWeight: 600, fontSize: 12, color: theme.vars.palette.text.secondary,
        backgroundColor: '#F0EFEB', whiteSpace: 'nowrap',
        ...theme.applyStyles('dark', { backgroundColor: '#252529' }),
      }),
      root: ({ theme }) => ({
        paddingBlock: 15, fontSize: 14, fontVariantNumeric: 'tabular-nums',
        borderColor: theme.vars.palette.divider, verticalAlign: 'middle',
      }),
    } },
    MuiTableRow: { styleOverrides: { root: ({ theme }) => ({
      '&:last-child td': { borderBottom: 0 },
      '&:hover td': { backgroundColor: theme.vars.palette.action.hover },
    }) } },
    MuiTablePagination: { styleOverrides: {
      toolbar: ({ theme }) => ({
        minHeight: 64,
        [theme.breakpoints.down('sm')]: { flexWrap: 'wrap', justifyContent: 'flex-end', padding: '8px 12px', rowGap: 4 },
      }),
      spacer: ({ theme }) => ({ [theme.breakpoints.down('sm')]: { display: 'none' } }),
      actions: ({ theme }) => ({ [theme.breakpoints.down('sm')]: { marginLeft: 8 } }),
    } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4, height: 3 } } },
  },
}, esES);
