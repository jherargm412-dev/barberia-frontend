import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { BitacoraResumen } from '../../types/consultar_bitacora';
import { formatearFechaHora } from '../../utils/consultar_bitacora/formatoBitacora';

interface Props {
  /** Oculta el estado vacío mientras carga o se muestra un error. */
  mostrarVacio?: boolean;
  registros: BitacoraResumen[];
  total: number;
  pagina: number;
  tamano: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarTamano: (tamano: number) => void;
  /** Paso 9: el Administrador selecciona un registro. */
  onVerDetalle: (idBitacora: number) => void;
}

/** CU05 paso 8: fecha y hora, usuario, acción, detalle y tabla afectada. */
export default function BitacoraTabla({
  mostrarVacio = true,
  registros,
  total,
  pagina,
  tamano,
  onCambiarPagina,
  onCambiarTamano,
  onVerDetalle,
}: Props) {
  return (
    <Paper elevation={0}>
      <TableContainer>
        {/* Conserva la legibilidad de las columnas; el contenedor permite deslizar. */}
        <Table size="small" sx={{ minWidth: 850 }}>
          <TableHead>
            <TableRow>
              <TableCell>Fecha y hora</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Detalle</TableCell>
              <TableCell>Tabla afectada</TableCell>
              <TableCell>Consulta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.length === 0 && mostrarVacio && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                  No se encontraron registros
                </TableCell>
              </TableRow>
            )}
            {registros.map((r) => (
              // Toda la fila es clicable para abrir el detalle.
              <TableRow key={r.idBitacora} hover onClick={() => onVerDetalle(r.idBitacora)} sx={{ cursor: 'pointer' }}>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatearFechaHora(r.fechaHora)}</TableCell>
                <TableCell>
                  {r.usuario.nombre}
                  <Typography variant="body2" color="text.secondary">
                    {r.usuario.correo}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.accion}</TableCell>
                <TableCell>{r.detalle || '—'}</TableCell>
                <TableCell>{r.tablaAfectada}</TableCell>
                {/* El botón permite abrir el mismo detalle usando teclado. */}
                <TableCell><Button size="small" aria-label={`Ver detalle del registro ${r.idBitacora}`}
                  onClick={(event) => { event.stopPropagation(); onVerDetalle(r.idBitacora); }}>Ver detalle</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* El backend usa páginas desde 0, igual que TablePagination. */}
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        rowsPerPage={tamano}
        rowsPerPageOptions={[20, 50, 100]}
        onPageChange={(_, nuevaPagina) => onCambiarPagina(nuevaPagina)}
        onRowsPerPageChange={(e) => onCambiarTamano(Number(e.target.value))}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}
