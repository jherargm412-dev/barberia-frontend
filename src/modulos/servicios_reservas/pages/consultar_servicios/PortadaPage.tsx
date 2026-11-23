import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';
import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ANCHO_PUBLICO, FUENTE_TITULOS, sxEtiqueta, sxPildora, sxPrecio, sxTituloSeccion,
} from '../../../../shared/styles/publico';
import { CarruselProductos } from '../../../inventario_compras';
import { listarCatalogo } from '../../api/consultar_servicios/catalogoApi';
import BarraPublica from '../../components/consultar_servicios/BarraPublica';
import PiePublico from '../../components/consultar_servicios/PiePublico';
import ServicioCard from '../../components/consultar_servicios/ServicioCard';
import type { ServicioCatalogo } from '../../types/consultar_servicios';

/** Servicios que muestra la portada (el resto, en el catálogo). */
const MAX_SERVICIOS = 5;

const VENTAJAS = ['Sin crear cuenta', 'Anticipo del 20 % con tarjeta', 'Eliges a tu barbero'];

const PASOS = [
  { titulo: 'Elige el servicio', texto: 'Corte, barba, combos y más, con su precio a la vista.' },
  { titulo: 'Barbero y horario', texto: 'Solo ves las horas en que tu barbero está libre.' },
  { titulo: 'Asegura tu turno', texto: 'Paga el 20 % con tarjeta; el resto, en la barbería.' },
];

const contenedor = { maxWidth: ANCHO_PUBLICO, mx: 'auto', px: { xs: 2, sm: 4 } } as const;

/**
 * Portada pública (lo primero que ve quien entra sin sesión): presenta la barbería, cómo reservar, sus servicios
 * (CU13) y productos (CU23), y lleva a reservar sin cuenta (CU12) o a iniciar sesión. Con sesión, "/" es el panel.
 */
export default function PortadaPage() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [servicios, setServicios] = useState<ServicioCatalogo[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    listarCatalogo()
      .then((data) => vigente && setServicios(data))
      .catch(() => vigente && setError('No se pudo cargar el catálogo de servicios. Intente nuevamente.'));
    return () => {
      vigente = false;
    };
  }, []);

  // "Cómo reservar" en la barra lleva a /#como-reservar: se desplaza a la sección al llegar.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  const reservar = (servicio: ServicioCatalogo) => navigate(`/reservar-sin-cuenta?servicio=${servicio.idServicio}`);
  // El catálogo llega del más caro al más barato: el primero es el más completo y va destacado.
  const [destacado, ...otros] = servicios ?? [];
  const visibles = otros.slice(0, MAX_SERVICIOS - 1);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <BarraPublica />

      {/* Presentación */}
      <Box component="section" sx={{ ...contenedor, py: { xs: 6, md: 11 }, display: 'flex', flexWrap: 'wrap', gap: { xs: 5, md: 7 },
        alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 460px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <Typography component="span" sx={sxEtiqueta}>Barbería · Reserva en línea</Typography>
          <Typography component="h1" sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, textTransform: 'uppercase',
            lineHeight: 1.02, letterSpacing: '0.01em', fontSize: { xs: '3.1rem', sm: '4rem', md: '4.75rem' } }}>
            Tu corte,<br />
            <Box component="span" sx={{ color: 'primary.main' }}>a la hora</Box><br />
            que elijas.
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: 16, md: 19 }, lineHeight: 1.6, maxWidth: 520 }}>
            Elige el servicio, el barbero y un horario libre. Asegura tu turno con un anticipo del 20 % pagado con
            tarjeta; el resto lo pagas en la barbería.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.75, flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={<EventAvailableIcon />}
              onClick={() => navigate('/reservar-sin-cuenta')}
              sx={{ ...sxPildora, py: 1.75, px: 3.5, fontSize: 16, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
              Reservar sin cuenta
            </Button>
            <Button variant="outlined" size="large" component={RouterLink} to="/catalogo"
              sx={{ ...sxPildora, py: 1.75, px: 3.5, fontSize: 16, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
              Ver servicios y precios
            </Button>
          </Box>
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', gap: { xs: 1.5, sm: 3.5 }, flexWrap: 'wrap',
            color: 'text.secondary', fontSize: 14 }}>
            {VENTAJAS.map((v) => (
              <Box component="li" key={v} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckIcon sx={{ fontSize: 18, color: 'primary.main' }} />{v}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Panel decorativo con el servicio más completo (dato real del catálogo). */}
        <Box sx={{ flex: '1 1 400px', minWidth: 0, position: 'relative', borderRadius: '28px', border: 1, borderColor: 'divider',
          overflow: 'hidden', minHeight: { xs: 300, md: 460 }, display: 'flex', alignItems: 'flex-end', p: { xs: 2.5, md: 4 },
          background: (t) => `radial-gradient(120% 90% at 85% 10%, rgba(201,164,92,0.22) 0%, transparent 55%), ${(t.vars ?? t).palette.background.paper}` }}>
          <ContentCutIcon aria-hidden sx={{ position: 'absolute', top: { xs: 24, md: 40 }, right: { xs: 16, md: 40 },
            fontSize: { xs: 150, md: 240 }, color: 'primary.main', opacity: 0.14, transform: 'rotate(-20deg)' }} />
          {destacado ? (
            <Box sx={{ position: 'relative', width: '100%', bgcolor: 'background.default', border: 1, borderColor: 'divider',
              borderRadius: '20px', p: { xs: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="overline" color="text.secondary">Nuestro servicio más completo</Typography>
              <Typography sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, textTransform: 'uppercase', fontSize: { xs: 24, md: 30 },
                lineHeight: 1.1 }}>
                {destacado.nombre}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                <Typography sx={[sxPrecio, { fontSize: { xs: 30, md: 36 }, color: 'primary.main' }]}>
                  Bs {destacado.precio.toFixed(2)}
                </Typography>
                {destacado.reservable && (
                  <Button variant="contained" onClick={() => reservar(destacado)} sx={sxPildora}>Reservarlo</Button>
                )}
              </Box>
            </Box>
          ) : (
            !error && <Skeleton variant="rounded" height={140} sx={{ width: '100%', borderRadius: '20px' }} />
          )}
        </Box>
      </Box>

      {/* Cómo reservar */}
      <Box component="section" id="como-reservar" aria-labelledby="titulo-como-reservar"
        sx={{ bgcolor: 'background.paper', borderTop: 1, borderBottom: 1, borderColor: 'divider', scrollMarginTop: 72 }}>
        <Typography id="titulo-como-reservar" component="h2" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Cómo reservar
        </Typography>
        <Box sx={{ ...contenedor, py: { xs: 4, md: 6 }, display: 'grid', gap: { xs: 3, md: 4 },
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' } }}>
          {PASOS.map((paso, i) => (
            <Box key={paso.titulo} sx={{ display: 'flex', gap: 2.25, alignItems: 'flex-start' }}>
              <Typography aria-hidden sx={{ fontFamily: FUENTE_TITULOS, fontSize: { xs: 34, md: 42 }, lineHeight: 1, color: 'primary.main' }}>
                {String(i + 1).padStart(2, '0')}
              </Typography>
              <Box>
                <Typography component="h3" sx={{ fontWeight: 600, fontSize: 17 }}>{paso.titulo}</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 15, mt: 0.5 }}>{paso.texto}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Servicios (CU13) */}
      <Box component="section" aria-labelledby="titulo-servicios" sx={{ ...contenedor, width: '100%', boxSizing: 'border-box',
        pt: { xs: 7, md: 12 }, pb: { xs: 4, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap', mb: { xs: 3.5, md: 5 } }}>
          <Box sx={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography component="span" sx={sxEtiqueta}>Servicios</Typography>
            <Typography id="titulo-servicios" component="h2" sx={sxTituloSeccion}>Lo que hacemos</Typography>
          </Box>
          <Link component={RouterLink} to="/catalogo" underline="none"
            sx={{ fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 1, py: 1 }}>
            Ver todos los servicios <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </Link>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {!servicios && !error && (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
            {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: '22px' }} />)}
          </Box>
        )}
        {servicios?.length === 0 && <Alert severity="info">No hay servicios disponibles por el momento.</Alert>}
        {destacado && (
          <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' } }}>
            <Box sx={{ gridColumn: { sm: 'span 2' } }}>
              <ServicioCard servicio={destacado} onReservar={reservar} destacado />
            </Box>
            {visibles.map((s) => <ServicioCard key={s.idServicio} servicio={s} onReservar={reservar} />)}
          </Box>
        )}
      </Box>

      {/* Productos (CU23): fila deslizable; no aparece si no hay productos visibles. */}
      <Box sx={{ ...contenedor, width: '100%', boxSizing: 'border-box', pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 12 } }}>
        <CarruselProductos />
      </Box>

      {/* Cierre */}
      <Box component="section" sx={{ ...contenedor, width: '100%', boxSizing: 'border-box', pb: { xs: 7, md: 12 } }}>
        <Box sx={{ borderRadius: '28px', border: 1, borderColor: 'divider', p: { xs: 3.5, md: 7 }, display: 'flex', flexWrap: 'wrap',
          gap: 3, alignItems: 'center', justifyContent: 'space-between',
          background: (t) => `radial-gradient(80% 140% at 100% 0%, rgba(201,164,92,0.18) 0%, transparent 60%), ${(t.vars ?? t).palette.background.paper}` }}>
          <Box sx={{ flex: '1 1 380px' }}>
            <Typography component="h2" sx={sxTituloSeccion}>¿Listo para tu próximo corte?</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: { xs: 15, md: 17 } }}>
              Reserva en un par de minutos, sin crear cuenta. Si ya eres cliente, ingresa para ver tus citas.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
            <Button variant="contained" size="large" onClick={() => navigate('/reservar-sin-cuenta')}
              sx={{ ...sxPildora, py: 1.75, fontSize: 16, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
              Reservar mi cita
            </Button>
            <Button variant="outlined" size="large" component={RouterLink} to="/login"
              sx={{ ...sxPildora, py: 1.75, fontSize: 16, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
              Ingresar
            </Button>
          </Box>
        </Box>
      </Box>

      <PiePublico />
    </Box>
  );
}
