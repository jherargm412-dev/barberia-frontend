import { Children, Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import MuiTable, { type TableProps } from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import type { TableCellProps } from '@mui/material/TableCell';

interface Props extends TableProps { columns: string[] }
type ElementProps = { children?: ReactNode; colSpan?: number };

/** Despliega fragmentos sin recrear los controles ni sus eventos. */
function elementos(children: ReactNode): ReactElement<ElementProps>[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<ElementProps>(child)) return [];
    return child.type === Fragment ? elementos(child.props.children) : [child];
  });
}

/** La misma fila es tabla en escritorio y ficha etiquetada en móvil, sin ocultar campos. */
export default function ResponsiveTable({ columns, children, sx, ...props }: Props) {
  const contenido = Children.map(children, (child) => {
    if (!isValidElement<ElementProps>(child) || child.type !== TableBody) return child;
    return cloneElement(child, { role: 'rowgroup' } as ElementProps, elementos(child.props.children).map((row) => {
      let columna = 0;
      return cloneElement(row, { role: 'row' } as ElementProps, elementos(row.props.children).map((cell, index) => {
        const span = cell.props.colSpan ?? 1;
        const etiqueta = span >= columns.length ? '' : columns.slice(columna, columna + span).join(' / ');
        columna += span;
        return cloneElement(cell as ReactElement<TableCellProps>, { key: cell.key ?? index, role: 'cell' }, <>
          {etiqueta && <Box component="span" className="mobile-field-label" sx={{ display: { xs: 'block', sm: 'none' }, fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>{etiqueta}</Box>}
          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere', '& .MuiFormControl-root': { maxWidth: '100%' } }}>{cell.props.children}</Box>
        </>);
      }));
    }));
  });

  return <MuiTable {...props} role="table" sx={[
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
    (theme) => ({ [theme.breakpoints.down('sm')]: {
      display: 'block', minWidth: '0 !important', width: '100%',
      // Conserva los encabezados para lectores de pantalla sin ocupar espacio visual.
      '& > thead': { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap' },
      '& > tbody': { display: 'grid', gap: 2, p: 1.5 },
      '& > tbody > tr': { display: 'block', minWidth: 0, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: 'background.paper' },
      '& > tbody > tr > td': { display: 'block', width: 'auto', minWidth: 0, maxWidth: '100%', border: '0 !important', padding: '8px 0 !important', textAlign: 'left', whiteSpace: 'normal !important', overflowWrap: 'anywhere' },
      '& > tbody > tr > td .MuiButton-root': { whiteSpace: 'normal', maxWidth: '100%' },
      '& > tbody > tr > td .MuiIconButton-root': { verticalAlign: 'middle' },
    } }),
  ]}>{contenido}</MuiTable>;
}
