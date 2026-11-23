import KeyboardIcon from '@mui/icons-material/KeyboardOutlined';
import MicNoneIcon from '@mui/icons-material/MicNoneOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState, type FormEvent } from 'react';
import PageHeader from '../../../../shared/components/PageHeader';
import ResponsiveTable from '../../../../shared/components/ResponsiveTable';
import { useAuth } from '../../../seguridad_usuarios';
import { COMANDOS_VOZ } from '../../constants/comando_voz';
import { useComandoVoz } from '../../context/comando_voz/useComandoVoz';
import { contextoSeguro, vozDisponible } from '../../utils/comando_voz/reconocimientoVoz';

const COLUMNAS = ['Comando', 'Ejemplo', 'Qué hace'];

/**
 * CU28 Comando de Voz: lista de comandos que el rol del usuario puede usar y una caja para probarlos
 * escribiendo (útil sin micrófono o en un navegador sin reconocimiento de voz).
 */
export default function ComandosVozPage() {
  const { tienePermiso } = useAuth();
  const { ejecutar } = useComandoVoz();
  const [texto, setTexto] = useState('');
  const disponible = vozDisponible();
  const seguro = contextoSeguro();

  const comandos = COMANDOS_VOZ.filter((c) => !c.permisos || c.permisos.some((p) => tienePermiso(p)));

  function probar(evento: FormEvent) {
    evento.preventDefault();
    if (!texto.trim()) return;
    const resultado = ejecutar([texto]);
    // Si abrió otra pantalla esta se desmonta; si no, se deja el texto para corregirlo.
    if (resultado.tipo === 'tema') setTexto('');
  }

  return (
    <>
      <PageHeader
        title="Comandos de voz"
        description="Presione el micrófono de la barra superior y diga uno de estos comandos. Los comandos solo buscan y abren pantallas: nunca registran, cobran, modifican ni anulan nada."
      />

      {!seguro ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Los navegadores solo permiten el micrófono en páginas con https (o en localhost). Abra el sistema con
          su dirección https o escriba el comando abajo.
        </Alert>
      ) : !disponible && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Este navegador es demasiado antiguo para usar el micrófono. Actualícelo o escriba el comando abajo.
        </Alert>
      )}

      <Paper sx={{ overflow: 'hidden', mb: 3 }}>
        <TableContainer>
          <ResponsiveTable columns={COLUMNAS} aria-label="Comandos de voz disponibles para su rol">
            <TableHead>
              <TableRow>{COLUMNAS.map((c) => <TableCell key={c}>{c}</TableCell>)}</TableRow>
            </TableHead>
            <TableBody>
              {comandos.map((c) => (
                <TableRow key={c.codigo}>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: { lg: 'nowrap' } }}>{c.comando}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {c.ejemplos.map((e) => (
                        <Box key={e} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'primary.main', whiteSpace: { lg: 'nowrap' } }}>
                          <MicNoneIcon sx={{ fontSize: 16 }} aria-hidden />
                          <span>"{e}"</span>
                        </Box>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{c.descripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </TableContainer>
      </Paper>

      <Paper component="form" onSubmit={probar} sx={{ p: { xs: 2, sm: 3 }, mb: 3 }} aria-labelledby="probar-comando">
        <Typography id="probar-comando" component="h2" variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Probar sin micrófono
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Escriba el comando tal como lo diría y presione Ejecutar.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label="Comando"
            placeholder='Ejemplo: agenda de mañana'
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            size="small"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
          <Button type="submit" variant="contained" startIcon={<KeyboardIcon />} disabled={!texto.trim()} sx={{ flexShrink: 0 }}>
            Ejecutar
          </Button>
        </Stack>
      </Paper>

      <Typography variant="body2" color="text.secondary">
        Funciona en cualquier navegador actual. La primera vez, el navegador pedirá permiso para usar el
        micrófono. En Chrome, Edge y Safari la voz se procesa en el servicio de reconocimiento de Google, Microsoft
        o Apple; en los demás (Firefox, Brave, Opera…) se usa el reconocedor propio del sistema, que descarga unos
        40 MB la primera vez y procesa la voz sin que salga del equipo. No dicte contraseñas ni datos de pago.
        Cada comando ejecutado queda registrado en la bitácora.
      </Typography>
    </>
  );
}
