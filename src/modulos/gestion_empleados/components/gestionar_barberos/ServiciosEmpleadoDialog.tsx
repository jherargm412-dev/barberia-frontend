import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';
import { listarServiciosHabilitados } from '../../../servicios_reservas';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { asignarServicios, consultarEmpleado } from '../../api/gestionar_barberos/empleadosApi';

interface Props {
  /** Empleado cuyos servicios se editan. La página monta el diálogo solo mientras está abierto. */
  idEmpleado: number;
  nombre: string;
  onCerrar: () => void;
  onGuardado: (mensaje: string) => void;
}

interface Opcion {
  idServicio: number;
  nombre: string;
  precio: number;
  activoEnCatalogo: boolean;
}

/**
 * CU17 paso 4: servicios que el barbero está capacitado para realizar. Muestra el catálogo
 * habilitado (CU08) más los que el barbero ya tenía aunque luego se inhabilitaran en el catálogo.
 */
export default function ServiciosEmpleadoDialog({ idEmpleado, nombre, onCerrar, onGuardado }: Props) {
  const [opciones, setOpciones] = useState<Opcion[] | null>(null);
  const [marcados, setMarcados] = useState<Set<number>>(new Set());
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Promise.all([listarServiciosHabilitados(), consultarEmpleado(idEmpleado)])
      .then(([catalogo, empleado]) => {
        const lista: Opcion[] = catalogo.map((s) => ({ ...s, activoEnCatalogo: true }));
        for (const asignado of empleado.servicios) {
          if (!lista.some((o) => o.idServicio === asignado.idServicio)) lista.push(asignado);
        }
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setOpciones(lista);
        setMarcados(new Set(empleado.servicios.map((s) => s.idServicio)));
      })
      .catch((err) => setError(obtenerError(err).mensaje));
  }, [idEmpleado]);

  function alternar(id: number) {
    const nuevos = new Set(marcados);
    if (nuevos.has(id)) nuevos.delete(id);
    else nuevos.add(id);
    setMarcados(nuevos);
  }

  async function guardar() {
    setGuardando(true);
    setError('');
    try {
      const respuesta = await asignarServicios(idEmpleado, [...marcados]);
      onGuardado(respuesta.mensaje);
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Servicios de {nombre}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        {!opciones && !error && <CircularProgress />}
        {opciones && opciones.length === 0 && <Alert severity="info">No hay servicios habilitados en el catálogo.</Alert>}
        {opciones && (
          <List dense>
            {opciones.map((o) => (
              <ListItemButton key={o.idServicio} onClick={() => alternar(o.idServicio)}>
                <ListItemIcon>
                  <Checkbox edge="start" checked={marcados.has(o.idServicio)} tabIndex={-1} disableRipple />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <>
                      {o.nombre}{' '}
                      {!o.activoEnCatalogo && <Chip label="Inhabilitado en el catálogo" size="small" sx={{ ml: 1 }} />}
                    </>
                  }
                  secondary={`Bs ${o.precio.toFixed(2)}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={guardar} disabled={guardando || !opciones}>
          {guardando ? 'Guardando...' : `Guardar (${marcados.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
