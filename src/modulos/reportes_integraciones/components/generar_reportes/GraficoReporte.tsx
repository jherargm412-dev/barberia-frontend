import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { BarChart } from '@mui/x-charts/BarChart';
import type { Grafico } from '../../types/generar_reportes';
import { formatearValor } from '../../utils/generar_reportes/reporteFormato';

/**
 * Gráfico de barras del reporte (librería @mui/x-charts).
 * Series largas (los días de un mes) van en barras verticales; rankings cortos (top de barberos, clientes…)
 * van en barras horizontales para que los nombres se lean completos.
 */
export default function GraficoReporte({ grafico }: { grafico: Grafico }) {
  const theme = useTheme();
  const formato = (valor: number | null) => formatearValor(valor, grafico.tipo);
  const horizontal = grafico.etiquetas.length <= 10;
  // Barras con el color principal del tema (el mismo dorado de los botones).
  const serie = [{ data: grafico.valores, label: grafico.titulo, valueFormatter: formato, color: theme.palette.primary.main }];
  // Eje de valores: unas 6 marcas; si son conteos (ENTERO), sin marcas intermedias como 0.5 que se verían repetidas.
  const ejeValores = { valueFormatter: formato, tickNumber: 6, tickMinStep: grafico.tipo === 'ENTERO' ? 1 : undefined };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{grafico.titulo}</Typography>
      {horizontal ? (
        <BarChart
          layout="horizontal"
          height={Math.max(160, grafico.etiquetas.length * 38 + 50)}
          yAxis={[{ scaleType: 'band', data: grafico.etiquetas, width: 'auto' }]}
          xAxis={[ejeValores]}
          series={serie}
          hideLegend
        />
      ) : (
        <BarChart
          height={300}
          xAxis={[{ scaleType: 'band', data: grafico.etiquetas, tickLabelStyle: { fontSize: 11 } }]}
          yAxis={[{ ...ejeValores, width: 'auto' }]}
          series={serie}
          hideLegend
        />
      )}
    </Paper>
  );
}
