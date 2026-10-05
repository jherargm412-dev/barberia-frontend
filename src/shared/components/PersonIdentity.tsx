import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface Props { name: string; secondary?: string }

/** Identidad compacta con iniciales; el nombre visible identifica el avatar decorativo. */
export default function PersonIdentity({ name, secondary }: Props) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Avatar aria-hidden="true" sx={{ width: 32, height: 32, fontSize: 12,
        bgcolor: 'action.selected', color: 'text.primary', border: 1, borderColor: 'divider' }}>{initials || '?'}</Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
        {secondary && <Typography variant="body2" color="text.secondary">{secondary}</Typography>}
      </Box>
    </Box>
  );
}
