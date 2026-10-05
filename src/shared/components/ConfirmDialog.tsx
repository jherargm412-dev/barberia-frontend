import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  cargando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Diálogo genérico de "¿Estás seguro?". */
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  cargando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Dialog open={abierto} onClose={cargando ? undefined : onCancelar} fullWidth maxWidth="xs" aria-labelledby="confirm-dialog-title">
      <DialogTitle id="confirm-dialog-title">{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText>{mensaje}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelar} disabled={cargando}>
          Cancelar
        </Button>
        <Button onClick={onConfirmar} variant="contained" loading={cargando}>
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
