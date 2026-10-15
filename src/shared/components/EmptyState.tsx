import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface Props { icon: ReactNode; title: string; description: string; action?: ReactNode }

/** Mensaje informativo para listas vacías o fuentes aún no disponibles. */
export default function EmptyState({ icon, title, description, action }: Props) {
  return <Box sx={{ py: 5, px: 2, textAlign: 'center', maxWidth: 460, mx: 'auto' }}>
    <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: 'action.hover', color: 'text.secondary', display: 'grid', placeItems: 'center', mx: 'auto', mb: 2 }}>{icon}</Box>
    <Typography variant="subtitle1">{title}</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: action ? 2 : 0 }}>{description}</Typography>
    {action}
  </Box>;
}
