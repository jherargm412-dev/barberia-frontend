import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useState, type FormEvent } from 'react';
import { listarClientes, registrarCliente, type Cliente } from '../../../gestion_clientes';
import { obtenerError } from '../../../../shared/utils/obtenerError';

interface Props {
  valor: Cliente | null;
  onCambiar: (cliente: Cliente | null) => void;
  error?: string;
  /** Muestra "Cliente nuevo" solo a quien tiene CLIENTE_CREAR (CU06). */
  puedeRegistrar: boolean;
}

/**
 * CU11 paso 1: busca al cliente por nombre o teléfono (CU06) o registra un walk-in rápido
 * (solo nombre y teléfono) sin salir del formulario de la cita.
 */
export default function ClienteSelector({ valor, onCambiar, error, puedeRegistrar }: Props) {
  const [texto, setTexto] = useState('');
  // Solo lo que el usuario escribe; al elegir un cliente el campo muestra su nombre pero no se busca de nuevo.
  const [busqueda, setBusqueda] = useState('');
  const [opciones, setOpciones] = useState<Cliente[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // Busca al escribir, esperando 300 ms para no llamar al backend en cada tecla.
  useEffect(() => {
    let vigente = true;
    const espera = setTimeout(() => {
      setBuscando(true);
      // Sin filtro de estado: CU11 se apoya solo en las columnas de cliente del Script.sql.
      listarClientes({ q: busqueda.trim(), activo: '', page: 0, size: 10 })
        .then((pagina) => vigente && setOpciones(pagina.contenido))
        .catch(() => vigente && setOpciones([]))
        .finally(() => vigente && setBuscando(false));
    }, 300);
    return () => {
      vigente = false;
      clearTimeout(espera);
    };
  }, [busqueda]);

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
      <Autocomplete
        sx={{ flex: 1 }}
        options={valor && !opciones.some((o) => o.idCliente === valor.idCliente) ? [valor, ...opciones] : opciones}
        value={valor}
        onChange={(_, nuevo) => onCambiar(nuevo)}
        inputValue={texto}
        onInputChange={(_, nuevoTexto, motivo) => {
          setTexto(nuevoTexto);
          if (motivo === 'input' || motivo === 'clear') setBusqueda(nuevoTexto);
        }}
        // El backend ya filtra: no volvemos a filtrar en el navegador.
        filterOptions={(x) => x}
        getOptionLabel={(c) => (c.telefono ? `${c.nombre} · ${c.telefono}` : c.nombre)}
        isOptionEqualToValue={(a, b) => a.idCliente === b.idCliente}
        loading={buscando}
        loadingText="Buscando..."
        noOptionsText="No se encontraron clientes"
        renderInput={(params) => (
          <TextField {...params} label="Cliente" required error={!!error} helperText={error ?? 'Buscar por nombre o teléfono'} />
        )}
      />
      {puedeRegistrar && (
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={() => setDialogoAbierto(true)}
          sx={{ height: 56, whiteSpace: 'nowrap' }}
        >
          Cliente nuevo
        </Button>
      )}
      {dialogoAbierto && (
        <ClienteRapidoDialog
          onCerrar={() => setDialogoAbierto(false)}
          onRegistrado={(cliente) => {
            onCambiar(cliente);
            setDialogoAbierto(false);
          }}
        />
      )}
    </Stack>
  );
}

/** Registro walk-in: el mismo POST /clientes de CU06, con solo los datos mínimos. */
function ClienteRapidoDialog({
  onCerrar,
  onRegistrado,
}: {
  onCerrar: () => void;
  onRegistrado: (cliente: Cliente) => void;
}) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [campos, setCampos] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setCampos({ nombre: 'Obligatorio' });
      return;
    }
    setGuardando(true);
    setError('');
    try {
      const respuesta = await registrarCliente({ nombre: nombre.trim(), telefono: telefono.trim() || null });
      onRegistrado(respuesta.cliente);
    } catch (err) {
      const { mensaje, campos: camposBackend } = obtenerError(err);
      setError(mensaje);
      setCampos(camposBackend);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="xs">
      <form onSubmit={guardar} noValidate>
        <DialogTitle>Cliente nuevo (walk-in)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Nombre"
              required
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              error={!!campos.nombre}
              helperText={campos.nombre}
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
            <TextField
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={!!campos.telefono}
              helperText={campos.telefono ?? 'Opcional; sirve para el recordatorio por WhatsApp'}
              slotProps={{ htmlInput: { maxLength: 15, inputMode: 'tel' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
