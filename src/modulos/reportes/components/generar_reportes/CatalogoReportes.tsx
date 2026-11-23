import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { GRUPOS_REPORTES, REPORTES } from '../../constants/generar_reportes';
import { ICONOS_REPORTE } from './iconosReporte';

/** Pantalla inicial: una tarjeta por reporte, agrupadas en Operativos (RF29) y Gestión (RF30). */
export default function CatalogoReportes({ onElegir }: { onElegir: (clave: string) => void }) {
  return (
    <>
      {GRUPOS_REPORTES.map((grupo) => (
        <Box key={grupo.nombre} sx={{ mb: 3 }}>
          <Typography variant="overline" color="text.secondary">{grupo.nombre} · {grupo.detalle}</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2, mt: 1 }}>
            {REPORTES.filter((r) => r.grupo === grupo.nombre).map((r) => (
              <Card key={r.clave} variant="outlined">
                <CardActionArea onClick={() => onElegir(r.clave)} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', mb: 0.5 }}>
                      {ICONOS_REPORTE[r.clave]}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>{r.titulo}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{r.descripcion}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
}
