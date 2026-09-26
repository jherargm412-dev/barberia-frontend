import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export default function NoEncontradoPage() {
  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Página no encontrada
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Ir al inicio
      </Button>
    </Box>
  );
}
