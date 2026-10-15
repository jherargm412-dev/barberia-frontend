import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface Props { label: string; value: number | null; icon: ReactNode; loading?: boolean; detail: string }

/** Indicador sin cifras inventadas: null representa una fuente no disponible. */
export default function MetricCard({ label, value, icon, loading, detail }: Props) {
  return <Card sx={{ height: '100%' }}><CardContent>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 2, bgcolor: 'action.hover', color: 'primary.main', '& svg': { fontSize: 21 } }}>{icon}</Box>
    </Box>
    {loading ? <Skeleton width={80} height={48} /> : value === null
      ? <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: '48px' }}>Datos no disponibles</Typography>
      : <Typography sx={{ fontSize: 34, lineHeight: '48px', fontWeight: 650, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>}
    <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>{detail}</Typography>
  </CardContent></Card>;
}
