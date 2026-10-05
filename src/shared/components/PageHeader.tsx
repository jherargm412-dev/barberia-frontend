import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Encabezado común: en celular la acción baja para dejar espacio al título. */
export default function PageHeader({ title, description, action }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' },
      gap: 2, pb: 3, mb: 3, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
        <Typography component="h1" variant="h5">{title}</Typography>
        {description && <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>{description}</Typography>}
      </Box>
      {action && <Box sx={{ flexShrink: 0, '& > button': { width: { xs: '100%', sm: 'auto' } } }}>{action}</Box>}
    </Box>
  );
}
