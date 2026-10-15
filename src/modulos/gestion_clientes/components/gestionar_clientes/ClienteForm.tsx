import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import { useState, type FormEvent } from 'react';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import type { ClienteRequest } from '../../types/gestionar_clientes';

interface Props {
  inicial?: ClienteRequest;
  guardar: (datos: ClienteRequest) => Promise<void>;
  cancelar: () => void;
}

/** Formulario compartido por registro y modificación. */
export default function ClienteForm({ inicial, guardar, cancelar }: Props) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [telefono, setTelefono] = useState(inicial?.telefono ?? '');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  /** Valida los campos antes de enviar y muestra los errores del servidor. */
  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const limpio = nombre.trim();
    const tel = telefono.trim();
    if (!limpio) { setError('El nombre del cliente es obligatorio'); return; }
    if (limpio.length > 80) { setError('El nombre admite máximo 80 caracteres'); return; }
    if (tel && (!/^[+0-9() .-]{5,15}$/.test(tel) || !/[0-9]/.test(tel))) {
      setError('El número de teléfono no es válido'); return;
    }
    setError('');
    setOcupado(true);
    try { await guardar({ nombre: limpio, telefono: tel || null }); }
    catch (err) { setError(obtenerError(err).mensaje); }
    finally { setOcupado(false); }
  }

  return (
    <Paper component="form" onSubmit={enviar} sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560, display: 'grid', gap: 2.5 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)}
        required disabled={ocupado} autoComplete="name" slotProps={{ htmlInput: { maxLength: 80 } }} />
      <TextField label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)}
        disabled={ocupado} type="tel" autoComplete="tel" slotProps={{ htmlInput: { maxLength: 15 } }} helperText="Opcional" />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" type="submit" loading={ocupado}>Guardar</Button>
        <Button onClick={cancelar} disabled={ocupado}>Cancelar</Button>
      </Box>
    </Paper>
  );
}
