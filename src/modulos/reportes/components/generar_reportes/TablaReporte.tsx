import Paper from '@mui/material/Paper';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Table from '../../../../shared/components/ResponsiveTable';
import { FILAS_POR_PAGINA } from '../../constants/generar_reportes';
import type { Tabla } from '../../types/generar_reportes';
import { esNumerica, formatearValor } from '../../utils/generar_reportes/reporteFormato';

/**
 * Una tabla del reporte, paginada en pantalla (las exportaciones traen todas las filas).
 * La fila de totales suma TODAS las filas, no solo las de la página visible.
 */
export default function TablaReporte({ tabla }: { tabla: Tabla }) {
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(FILAS_POR_PAGINA[0]);
  const titulos = tabla.columnas.map((c) => c.titulo);
  const visibles = tabla.filas.slice(pagina * filasPorPagina, (pagina + 1) * filasPorPagina);

  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, px: 2, pt: 2 }}>{tabla.titulo}</Typography>
      {tabla.descripcion && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>{tabla.descripcion}</Typography>
      )}
      <TableContainer sx={{ mt: 1 }}>
        <Table columns={titulos} size="small" sx={{ minWidth: Math.min(1000, titulos.length * 100) }}>
          <TableHead>
            <TableRow>
              {tabla.columnas.map((c) => (
                <TableCell key={c.titulo} align={esNumerica(c.tipo) ? 'right' : 'left'} sx={{ whiteSpace: 'nowrap' }}>
                  {c.titulo}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tabla.filas.length === 0 && (
              <TableRow>
                <TableCell colSpan={titulos.length} align="center" sx={{ color: 'text.secondary', py: 3 }}>
                  Sin datos en el periodo
                </TableCell>
              </TableRow>
            )}
            {visibles.map((fila, i) => (
              <TableRow key={pagina * filasPorPagina + i} hover>
                {tabla.columnas.map((c, j) => (
                  <TableCell key={c.titulo} align={esNumerica(c.tipo) ? 'right' : 'left'}
                    sx={{ whiteSpace: esNumerica(c.tipo) || c.tipo.startsWith('FECHA') ? 'nowrap' : undefined }}>
                    {formatearValor(fila[j], c.tipo)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {tabla.totales && tabla.filas.length > 0 && (
              <TableRow sx={{ '& td': { fontWeight: 700, borderTop: 2, borderColor: 'divider' } }}>
                {tabla.columnas.map((c, j) => (
                  <TableCell key={c.titulo} align={esNumerica(c.tipo) ? 'right' : 'left'} sx={{ whiteSpace: 'nowrap' }}>
                    {j === 0 && tabla.totales![0] === null ? 'Total' : formatearValor(tabla.totales![j], c.tipo)}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {tabla.filas.length > FILAS_POR_PAGINA[0] && (
        <TablePagination
          component="div"
          count={tabla.filas.length}
          page={pagina}
          onPageChange={(_, nueva) => setPagina(nueva)}
          rowsPerPage={filasPorPagina}
          onRowsPerPageChange={(e) => {
            setFilasPorPagina(Number(e.target.value));
            setPagina(0);
          }}
          rowsPerPageOptions={FILAS_POR_PAGINA}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        />
      )}
    </Paper>
  );
}
