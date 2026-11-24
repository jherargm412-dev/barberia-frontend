import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CodeIcon from '@mui/icons-material/Code';
import GridOnIcon from '@mui/icons-material/GridOn';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdfOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { FORMATOS_EXPORTACION } from '../../constants/generar_reportes';
import type { FormatoExportacion, Reporte } from '../../types/generar_reportes';
import { formatearValor } from '../../utils/generar_reportes/reporteFormato';
import GraficoReporte from './GraficoReporte';
import TablaReporte from './TablaReporte';

const ICONOS: Record<FormatoExportacion, ReactNode> = {
  pdf: <PictureAsPdfIcon />,
  xlsx: <GridOnIcon />,
  html: <CodeIcon />,
};
/**
 * Color de cada botón de exportación: PDF rojo, Excel verde y HTML amarillo. Va directo en sx (borde, texto e
 * ícono) porque el tema de la app define su propio estilo para los botones con borde y no usaría la prop color.
 */
const COLORES: Record<FormatoExportacion, string> = { pdf: '#e5534b', xlsx: '#3fb950', html: '#f2c94c' };

interface Props {
  reporte: Reporte;
  /** Formato que se está descargando (deshabilita los botones mientras tanto). */
  exportando: FormatoExportacion | null;
  onExportar: (formato: FormatoExportacion) => void;
  onCambiarFiltros: () => void;
}

/** Paso 2 "Resultado": encabezado con el periodo y los filtros, tarjetas de totales, gráfico y tablas. */
export default function ResultadoReporte({ reporte, exportando, onExportar, onCambiarFiltros }: Props) {
  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="h2">{reporte.titulo}</Typography>
          <Typography variant="body2" color="text.secondary">{reporte.descripcion}</Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 3, rowGap: 0.5, mt: 1 }}>
            <Typography variant="body2"><Box component="span" sx={{ color: 'text.secondary' }}>Periodo: </Box><strong>{reporte.periodo}</strong></Typography>
            {reporte.filtros.map((f) => (
              <Typography key={f.etiqueta} variant="body2">
                <Box component="span" sx={{ color: 'text.secondary' }}>{f.etiqueta}: </Box><strong>{f.valor}</strong>
              </Typography>
            ))}
          </Stack>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {FORMATOS_EXPORTACION.map((f) => (
            <Button key={f.valor} variant="outlined" disabled={exportando !== null}
              sx={{
                color: COLORES[f.valor], borderColor: COLORES[f.valor],
                // Al pasar el mouse: el mismo color de fondo, muy suave ("1f" = 12 % de opacidad en hexadecimal).
                '&:hover': { borderColor: COLORES[f.valor], bgcolor: `${COLORES[f.valor]}1f` },
              }}
              startIcon={exportando === f.valor ? <CircularProgress size={16} /> : ICONOS[f.valor]}
              onClick={() => onExportar(f.valor)}>
              Exportar {f.etiqueta}
            </Button>
          ))}
        </Stack>
      </Box>

      {/* Tarjetas de totales: se acomodan solas según el ancho (mínimo 200 px cada una). */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
        {reporte.indicadores.map((i) => (
          <Card key={i.etiqueta} variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary">{i.etiqueta}</Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 600, fontVariantNumeric: 'tabular-nums', mt: 0.5 }}>
                {formatearValor(i.valor, i.tipo)}
              </Typography>
              {i.detalle && <Typography variant="caption" color="text.secondary">{i.detalle}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>

      {reporte.grafico && <GraficoReporte grafico={reporte.grafico} />}

      {reporte.tablas.map((t) => (
        // La key incluye la fecha de generación: al generar de nuevo, cada tabla vuelve a la página 1.
        <TablaReporte key={`${reporte.generadoEn}-${t.titulo}`} tabla={t} />
      ))}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={onCambiarFiltros}>Cambiar filtros</Button>
        <Typography variant="caption" color="text.secondary">
          Generado por {reporte.generadoPor} el {formatearValor(reporte.generadoEn, 'FECHA_HORA')}
        </Typography>
      </Box>
    </Box>
  );
}
