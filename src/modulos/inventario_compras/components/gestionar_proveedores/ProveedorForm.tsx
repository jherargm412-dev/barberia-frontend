import { useState, type FormEvent } from 'react';
import { Alert, Button, Paper, Stack, TextField } from '@mui/material';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import type { ProveedorRequest } from '../../types/gestionar_proveedores';

interface Props {
  inicial: ProveedorRequest;
  onGuardar: (datos: ProveedorRequest) => Promise<void>;
  onCancelar: () => void;
}

const campos = [
  { campo: 'empresa', label: 'Empresa o razón social', max: 80, requerido: true },
  { campo: 'nit', label: 'NIT', max: 20, requerido: true },
  { campo: 'nombre', label: 'Persona de contacto', max: 80 },
  { campo: 'telefono', label: 'Teléfono', max: 15 },
  { campo: 'correo', label: 'Correo electrónico', max: 100 },
] as const;

export default function ProveedorForm({ inicial, onGuardar, onCancelar }: Props) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    const normalizados = Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, v.trim()])) as unknown as ProveedorRequest;
    const validacion: Record<string, string> = {};
    if (!normalizados.empresa) validacion.empresa = 'Ingrese la empresa o razón social';
    if (!/^[0-9]{1,20}$/.test(normalizados.nit)) validacion.nit = 'Ingrese un NIT de 1 a 20 dígitos';
    if (normalizados.telefono && (!/^[+0-9() .-]{5,15}$/.test(normalizados.telefono) || !/[0-9]/.test(normalizados.telefono))) {
      validacion.telefono = 'Ingrese un teléfono válido de 5 a 15 caracteres';
    }
    if (normalizados.correo && !/^[^\s@]+@[^\s@]+$/.test(normalizados.correo)) validacion.correo = 'Ingrese un correo válido';
    setErrores(validacion);
    setError('');
    if (Object.keys(validacion).length) return;
    setGuardando(true);
    try {
      await onGuardar(normalizados);
    } catch (err) {
      const resultado = obtenerError(err);
      setError(resultado.mensaje);
      setErrores(resultado.campos);
    } finally {
      setGuardando(false);
    }
  }

  return <Paper component="form" onSubmit={enviar} noValidate sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
    <Stack spacing={2.5}>
      {error && <Alert severity="error">{error}</Alert>}
      {campos.map(({ campo, label, max, ...opciones }) => <TextField key={campo} label={label}
        required={'requerido' in opciones && opciones.requerido} value={datos[campo]} disabled={guardando}
        type={campo === 'correo' ? 'email' : campo === 'telefono' ? 'tel' : 'text'}
        slotProps={{ htmlInput: { maxLength: max, ...(campo === 'nit' ? { inputMode: 'numeric' } : {}) } }}
        error={!!errores[campo]} helperText={errores[campo] ?? (campo === 'nit' ? 'Identificación tributaria, sin espacios ni guiones.' : undefined)}
        onChange={(e) => { setDatos((prev) => ({ ...prev, [campo]: e.target.value })); setErrores((prev) => ({ ...prev, [campo]: '' })); }} />)}
      <Stack direction="row" spacing={1.5}>
        <Button type="submit" variant="contained" loading={guardando}>Guardar proveedor</Button>
        <Button onClick={onCancelar} disabled={guardando}>Cancelar</Button>
      </Stack>
    </Stack>
  </Paper>;
}
