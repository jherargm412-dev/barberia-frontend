import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Permiso } from '../../types/gestionar_roles_permisos';
import { agruparPermisos } from '../../utils/gestionar_roles_permisos/rolForm';

interface Props {
  catalogo: Permiso[];
  seleccionados: string[];
  onCambiar: (seleccionados: string[]) => void;
  /** Rol Administrador: se muestran sus permisos pero no se pueden cambiar. */
  soloLectura?: boolean;
}

/** CU03 paso 3: catálogo de permisos agrupado por área, con "marcar todo" por grupo. */
export default function PermisosSelector({ catalogo, seleccionados, onCambiar, soloLectura = false }: Props) {
  const marcados = new Set(seleccionados);

  // Un permiso inactivo solo se muestra si el rol ya lo tiene (para poder quitarlo).
  const visibles = catalogo.filter((p) => p.activo || marcados.has(p.accion));

  function alternar(accion: string) {
    const nuevos = new Set(marcados);
    if (nuevos.has(accion)) nuevos.delete(accion);
    else nuevos.add(accion);
    onCambiar([...nuevos]);
  }

  function alternarGrupo(permisos: Permiso[], marcar: boolean) {
    const nuevos = new Set(marcados);
    for (const p of permisos) {
      if (marcar && p.activo) nuevos.add(p.accion);
      if (!marcar) nuevos.delete(p.accion);
    }
    onCambiar([...nuevos]);
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Permisos{' '}
        <Typography component="span" color="text.secondary">
          ({seleccionados.length} de {catalogo.filter((p) => p.activo).length} seleccionados)
        </Typography>
      </Typography>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
        {agruparPermisos(visibles).map((grupo) => {
          const cantidad = grupo.permisos.filter((p) => marcados.has(p.accion)).length;
          const todos = cantidad === grupo.permisos.length;
          return (
            <Paper key={grupo.titulo} variant="outlined" sx={{ p: 2 }}>
              <FormControlLabel
                label={<Typography sx={{ fontWeight: 600 }}>{grupo.titulo}</Typography>}
                control={
                  <Checkbox
                    checked={todos}
                    indeterminate={cantidad > 0 && !todos}
                    disabled={soloLectura}
                    onChange={() => alternarGrupo(grupo.permisos, !todos)}
                  />
                }
              />
              <Box sx={{ pl: 3, display: 'flex', flexDirection: 'column' }}>
                {grupo.permisos.map((p) => (
                  <FormControlLabel
                    key={p.accion}
                    sx={{ alignItems: 'flex-start', my: 0.25 }}
                    control={
                      <Checkbox
                        size="small"
                        sx={{ pt: 0.25 }}
                        checked={marcados.has(p.accion)}
                        disabled={soloLectura}
                        onChange={() => alternar(p.accion)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">
                          {p.descripcion ?? p.accion}{' '}
                          {!p.activo && <Chip label="Inactivo" size="small" sx={{ ml: 0.5 }} />}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {p.accion}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
