import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { useAuth } from '../../../seguridad_usuarios';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import ServicioCard from '../../components/consultar_servicios/ServicioCard';
import { PERMISOS as PERMISOS_CITAS } from '../../constants/gestionar_citas';
import { PERMISOS_SOLICITUD } from '../../constants/solicitar_cita';
import type { FiltrosCatalogo, ServicioCatalogo } from '../../types/consultar_servicios';

const SIN_FILTROS: FiltrosCatalogo = { q: '', precioMin: '', precioMax: '' };

/**
 * CU13: Consultar Servicios. Vista pública (con o sin sesión) del catálogo de servicios activos:
 * 1) tarjetas con nombre, descripción y precio; 2) búsqueda por texto y rango de precio;
 * 3) "Reservar" lleva a CU12 (cliente) o CU11 (recepción); sin sesión, primero al login.
 */
export default function ConsultarServiciosPage() {
  const navigate = useNavigate();
  const { usuario, tienePermiso } = useAuth();

  // Lo que se escribe en el formulario y lo último que se consultó (se aplica con "Buscar").
  const [escritos, setEscritos] = useState<FiltrosCatalogo>(SIN_FILTROS);
  const [filtros, setFiltros] = useState<FiltrosCatalogo>(SIN_FILTROS);
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogo(filtros)
      .then((data) => vigente && setServicios(data))
      .catch((err) => {
        if (!vigente) return;
        // Un filtro inválido (p. ej. mínimo mayor que el máximo) trae su campo; si no, error de conexión.
        const { mensaje, campos } = obtenerError(err);
        setError(Object.keys(campos).length > 0 ? mensaje : 'No se pudo cargar el catálogo de servicios. Intente nuevamente.');
        setServicios([]);
      })
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [filtros]);

  function buscar(e: FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError('');
    setFiltros({ ...escritos });
  }

  function limpiar() {
    setEscritos(SIN_FILTROS);
    setCargando(true);
    setError('');
    setFiltros(SIN_FILTROS);
  }

  /** Paso 3: a CU12 si es cliente, a CU11 si es recepción; sin sesión, al login y luego a CU12. */
  function reservar(servicio: ServicioCatalogo) {
    const solicitar = `/solicitar-cita?servicio=${servicio.idServicio}`;
    if (!usuario) {
      navigate('/login', { state: { desde: solicitar } });
    } else if (tienePermiso(PERMISOS_SOLICITUD.SOLICITAR)) {
      navigate(solicitar);
    } else if (tienePermiso(PERMISOS_CITAS.CREAR)) {
      navigate(`/citas/nueva?servicio=${servicio.idServicio}`);
    }
  }

  const hayFiltros = filtros.q.trim() !== '' || filtros.precioMin !== '' || filtros.precioMax !== '';
  const puedeReservar = !usuario || tienePermiso(PERMISOS_SOLICITUD.SOLICITAR) || tienePermiso(PERMISOS_CITAS.CREAR);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado: botón volver + título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(usuario ? '/' : '/login')}>
          Volver al inicio
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Nuestros Servicios
        </Typography>
      </Box>

      {/* Paso 2: búsqueda por texto y rango de precio */}
      <Paper
        component="form"
        onSubmit={buscar}
        noValidate
        sx={{ p: 2, mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
      >
        <TextField
          label="Buscar servicio"
          placeholder="Nombre o descripción"
          value={escritos.q}
          onChange={(e) => setEscritos({ ...escritos, q: e.target.value })}
          sx={{ flex: '1 1 240px' }}
        />
        <TextField
          label="Precio mínimo (Bs)"
          type="number"
          value={escritos.precioMin}
          onChange={(e) => setEscritos({ ...escritos, precioMin: e.target.value })}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ width: { xs: '100%', sm: 170 } }}
        />
        <TextField
          label="Precio máximo (Bs)"
          type="number"
          value={escritos.precioMax}
          onChange={(e) => setEscritos({ ...escritos, precioMax: e.target.value })}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ width: { xs: '100%', sm: 170 } }}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Buscar
        </Button>
        {hayFiltros && <Button onClick={limpiar}>Limpiar filtros</Button>}
      </Paper>

      {/* Estado de carga */}
      {cargando && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error de conexión o de filtros (p. ej. mínimo mayor que el máximo) */}
      {!cargando && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Flujo 3a: sin servicios disponibles / sin resultados de la búsqueda */}
      {!cargando && !error && servicios.length === 0 && (
        <Alert severity="info">
          {hayFiltros
            ? 'Ningún servicio coincide con la búsqueda.'
            : 'No hay servicios disponibles por el momento.'}
        </Alert>
      )}

      {!cargando && !error && servicios.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {servicios.map((servicio) => (
            <ServicioCard
              key={servicio.idServicio}
              servicio={servicio}
              onReservar={puedeReservar ? reservar : undefined}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
