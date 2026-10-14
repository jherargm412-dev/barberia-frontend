import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import RequisitosContrasena from '../../../../shared/components/RequisitosContrasena';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { cumplePoliticaContrasena } from '../../../../shared/utils/politicaContrasena';
import { cambiarContrasena } from '../../api/gestionar_usuarios/usuariosApi';

interface Props {
  abierto: boolean;
  idUsuario: number;
  onCerrar: () => void;
  onExito: () => void;
}

/** CU01 3b: el administrador restablece la contraseña de un usuario (y así levanta un bloqueo por intentos). */
export default function CambiarContrasenaDialog({ abierto, idUsuario, onCerrar, onExito }: Props) {
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cerrar() {
    setContrasena('');
    setError('');
    onCerrar();
  }

  async function guardar() {
    if (!contrasena) {
      setError('Ingresa la nueva contraseña');
      return;
    }
    if (!cumplePoliticaContrasena(contrasena)) {
      setError('La contraseña no cumple los requisitos de seguridad');
      return;
    }
    setEnviando(true);
    try {
      await cambiarContrasena(idUsuario, contrasena);
      setContrasena('');
      setError('');
      onExito();
    } catch (err) {
      setError(obtenerError(err).mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="xs">
      <DialogTitle>Restablecer contraseña</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          fullWidth
          autoFocus
          sx={{ mt: 1 }}
        />
        <RequisitosContrasena contrasena={contrasena} />
      </DialogContent>
      <DialogActions>
        <Button onClick={cerrar} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={guardar} variant="contained" disabled={enviando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
