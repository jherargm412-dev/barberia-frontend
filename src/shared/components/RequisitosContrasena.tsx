import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { REQUISITOS_CONTRASENA } from '../utils/politicaContrasena';

interface Props {
  contrasena: string;
}

/** Lista de requisitos de la contraseña que se marcan en verde a medida que se cumplen (05 §5.1). */
export default function RequisitosContrasena({ contrasena }: Props) {
  return (
    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mt: 0.5 }}>
      {REQUISITOS_CONTRASENA.map((r) => {
        const cumple = r.cumple(contrasena);
        const Icono = cumple ? CheckCircleIcon : RadioButtonUncheckedIcon;
        return (
          <Box component="li" key={r.texto} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Icono sx={{ fontSize: 16 }} color={cumple ? 'success' : 'disabled'} />
            <Typography variant="caption" color={cumple ? 'success.main' : 'text.secondary'}>
              {r.texto}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
