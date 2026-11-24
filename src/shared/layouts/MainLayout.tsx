import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingIcon from '@mui/icons-material/LocalShippingOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import StorefrontIcon from '@mui/icons-material/StorefrontOutlined';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../modulos/seguridad_usuarios';
import { BotonComandoVoz, ComandoVozProvider, type EstadoNavegacionVoz } from '../../modulos/reportes_integraciones';
import ThemeModeButton from '../components/ThemeModeButton';
import { FUENTE_TITULOS } from '../styles/publico';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOverOutlined';

const ANCHO_MENU = 280;

interface OpcionMenu {
  texto: string;
  ruta: string;
  icono: ReactNode;
  /**
   * Si se indica, la opción solo aparece para usuarios con ese permiso.
   * Con una lista basta con tener cualquiera de ellos (ej. CU16: agenda completa o propia).
   */
  permiso?: string | string[];
}

interface GrupoMenu {
  titulo: string;
  icono: ReactNode;
  opciones: OpcionMenu[];
}

const INICIO: OpcionMenu = { texto: 'Inicio', ruta: '/', icono: <HomeIcon /> };

// Un grupo por paquete del diagrama de paquetes (7), con sus casos de uso dentro. Cada opción conserva su
// permiso: un grupo sin opciones visibles para el rol no se muestra, y con una sola se muestra como enlace directo.
const GRUPOS: GrupoMenu[] = [
  {
    // Paquete 1: seguridad_usuarios (CU02 es el login, no tiene opción en el menú).
    titulo: 'Seguridad y usuarios', icono: <AdminPanelSettingsIcon />, opciones: [
      { texto: 'Usuarios', ruta: '/usuarios', icono: <PeopleIcon />, permiso: 'USUARIO_GESTIONAR' },
      { texto: 'Roles y permisos', ruta: '/roles', icono: <AdminPanelSettingsIcon />, permiso: 'ROL_ASIGNAR' },
      { texto: 'Bitácora', ruta: '/bitacora', icono: <HistoryIcon />, permiso: 'BITACORA_CONSULTAR' },
      // CU04 Configurar perfil personal: todos los roles con PERFIL_EDITAR.
      { texto: 'Mi perfil', ruta: '/perfil', icono: <AccountCircleIcon />, permiso: 'PERFIL_EDITAR' },
    ],
  },
  {
    // Paquete 2: gestion_clientes (CU07 historial: botón "Historial" dentro de la lista de clientes).
    titulo: 'Gestión de clientes', icono: <PeopleIcon />, opciones: [
      { texto: 'Clientes', ruta: '/clientes', icono: <PeopleIcon />, permiso: 'CLIENTE_CONSULTAR' },
    ],
  },
  {
    // Paquete 3: servicios_reservas (CU14 anticipo se abre desde la cita; CU15 cancela solo las reservas web).
    titulo: 'Servicios y reservas', icono: <CalendarMonthIcon />, opciones: [
      { texto: 'Servicios', ruta: '/servicios', icono: <ContentCutIcon />, permiso: 'SERVICIO_GESTIONAR' },
      { texto: 'Horarios', ruta: '/horarios', icono: <EventAvailableIcon />, permiso: 'USUARIO_GESTIONAR' },
      // CU10: horas libres por servicio y barbero, para agendar.
      { texto: 'Disponibilidad', ruta: '/disponibilidad', icono: <ScheduleIcon />, permiso: 'RESERVA_CREAR' },
      { texto: 'Citas', ruta: '/citas', icono: <EventIcon />, permiso: 'AGENDA_CONSULTAR' },
      // CU12: el cliente solicita su cita en línea.
      { texto: 'Solicitar cita', ruta: '/solicitar-cita', icono: <EventNoteIcon />, permiso: 'RESERVA_SOLICITAR' },
      { texto: 'Mis citas', ruta: '/mis-citas', icono: <EventIcon />, permiso: 'RESERVA_SOLICITAR' },
      // CU13: catálogo de servicios (también público, desde el login) para elegir qué reservar.
      { texto: 'Catálogo de servicios', ruta: '/catalogo', icono: <ContentCutIcon />, permiso: ['RESERVA_SOLICITAR', 'RESERVA_CREAR'] },
      { texto: 'Agenda de citas', ruta: '/agenda', icono: <CalendarMonthIcon />, permiso: ['AGENDA_CONSULTAR', 'AGENDA_CONSULTAR_PROPIA'] },
    ],
  },
  {
    // Paquete 4: gestion_empleados.
    titulo: 'Gestión de empleados', icono: <BadgeIcon />, opciones: [
      { texto: 'Barberos', ruta: '/empleados', icono: <BadgeIcon />, permiso: 'USUARIO_GESTIONAR' },
      { texto: 'Liquidaciones', ruta: '/liquidaciones', icono: <PaymentsIcon />, permiso: 'PAGO_EMPLEADO_GENERAR' },
      { texto: 'Comisiones', ruta: '/comisiones', icono: <PaymentsIcon />, permiso: 'COMISION_CONSULTAR_PROPIA' },
    ],
  },
  {
    // Paquete 5: ventas_caja.
    titulo: 'Ventas y caja', icono: <AccountBalanceWalletIcon />, opciones: [
      { texto: 'Registrar venta', ruta: '/ventas/registrar', icono: <ShoppingCartIcon />, permiso: 'VENTA_REGISTRAR' },
      // CU21 conserva la visibilidad según el permiso de consulta.
      { texto: 'Caja', ruta: '/caja', icono: <AccountBalanceWalletIcon />, permiso: 'CAJA_CONSULTAR' },
    ],
  },
  {
    // Paquete 6: inventario_compras.
    titulo: 'Inventario y compras', icono: <Inventory2Icon />, opciones: [
      // CU22: productos de venta e insumos de consumo interno.
      { texto: 'Productos e insumos', ruta: '/productos', icono: <Inventory2Icon />, permiso: ['PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR'] },
      // CU22/CU23: solo los productos de venta, con imagen y visibilidad en el catálogo público.
      { texto: 'Catálogo de productos', ruta: '/catalogo-productos', icono: <StorefrontIcon />, permiso: ['PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR'] },
      { texto: 'Proveedores', ruta: '/proveedores', icono: <LocalShippingIcon />, permiso: 'PROVEEDOR_GESTIONAR' },
      // CU25: compras a proveedores; suman al stock.
      { texto: 'Compras', ruta: '/compras', icono: <ShoppingCartIcon />, permiso: 'COMPRA_REGISTRAR' },
      // CU26: entradas/salidas manuales, consumo interno, mermas, ajustes por conteo y kardex.
      { texto: 'Movimientos de inventario', ruta: '/inventario/movimientos', icono: <SwapVertIcon />, permiso: 'INVENTARIO_MOVIMIENTO_CONSULTAR' },
    ],
  },
  {
    // Paquete 7: reportes_integraciones.
    titulo: 'Reportes e integraciones', icono: <AssessmentIcon />, opciones: [
      // CU27: ventas, caja, inventario, comisiones, desempeño y visitas; exportables a PDF, Excel y HTML.
      { texto: 'Reportes', ruta: '/reportes', icono: <AssessmentIcon />, permiso: 'REPORTE_GENERAR' },
      // CU28: lista de comandos de voz y prueba escrita; el micrófono está en la barra superior.
      { texto: 'Comandos de voz', ruta: '/comandos-voz', icono: <RecordVoiceOverIcon />, permiso: 'VOZ_USAR' },
      // CU29: cobros con tarjeta (Stripe) y activación de pasarelas.
      { texto: 'Pasarela de pago', ruta: '/pasarela-pago', icono: <CreditCardIcon />, permiso: ['PASARELA_PAGO_COBRAR', 'PASARELA_PAGO_GESTIONAR'] },
    ],
  },
];

function rutaSeleccionada(ruta: string, pathname: string) {
  return ruta === '/' ? pathname === '/' : pathname === ruta || pathname.startsWith(`${ruta}/`);
}

/** Estructura de las páginas privadas: barra superior + menú lateral + contenido. */
export default function MainLayout() {
  const { usuario, cerrarSesion, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const { pathname } = ubicacion;
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  // CU28: cuando un comando de voz abre la misma pantalla con otro filtro llega una marca nueva en la
  // navegación; entonces se vuelve a montar la pantalla (en el mismo render que la URL nueva) para que lea
  // los filtros. Si la marca desaparece en una navegación posterior, no se vuelve a montar.
  const marcaVoz = (ubicacion.state as Partial<EstadoNavegacionVoz> | null)?.comandoVoz;
  const [versionPantalla, setVersionPantalla] = useState(0);
  const [ultimaMarcaVoz, setUltimaMarcaVoz] = useState(marcaVoz);
  if (marcaVoz !== undefined && marcaVoz !== ultimaMarcaVoz) {
    setUltimaMarcaVoz(marcaVoz);
    setVersionPantalla((v) => v + 1);
  }

  const gruposVisibles = GRUPOS.map((grupo) => ({
    ...grupo,
    opciones: grupo.opciones.filter((opcion) => !opcion.permiso || (Array.isArray(opcion.permiso) ? opcion.permiso.some((permiso) => tienePermiso(permiso)) : tienePermiso(opcion.permiso))),
  })).filter((grupo) => grupo.opciones.length > 0);
  // Lo que "abrir …" puede abrir por voz: exactamente lo que el menú muestra a este usuario.
  const opcionesVoz = [INICIO, ...gruposVisibles.flatMap((grupo) => grupo.opciones)]
    .map(({ texto, ruta }) => ({ texto, ruta }));

  // Grupos desplegados (se pueden abrir varios). El de la pantalla actual se abre solo, también al llegar
  // por un comando de voz; después el usuario puede cerrarlo.
  const grupoDeRuta = (ruta: string) =>
    gruposVisibles.find((grupo) => grupo.opciones.some((opcion) => rutaSeleccionada(opcion.ruta, ruta)))?.titulo;
  const [abiertos, setAbiertos] = useState<string[]>(() => {
    const actual = grupoDeRuta(pathname);
    return actual ? [actual] : [];
  });
  const [rutaAnterior, setRutaAnterior] = useState(pathname);
  if (pathname !== rutaAnterior) {
    setRutaAnterior(pathname);
    const actual = grupoDeRuta(pathname);
    if (actual && !abiertos.includes(actual)) setAbiertos([...abiertos, actual]);
  }

  function alternarGrupo(titulo: string) {
    setAbiertos((actuales) => actuales.includes(titulo) ? actuales.filter((t) => t !== titulo) : [...actuales, titulo]);
  }

  async function salir() {
    await cerrarSesion();
    navigate('/login', { replace: true });
  }

  function irA(opcion: OpcionMenu) {
    navigate(opcion.ruta);
    setMenuMovilAbierto(false);
  }

  function opcionMenu(opcion: OpcionMenu, anidada = false) {
    return (
      <ListItemButton
        key={opcion.ruta}
        selected={rutaSeleccionada(opcion.ruta, pathname)}
        aria-current={rutaSeleccionada(opcion.ruta, pathname) ? 'page' : undefined}
        onClick={() => irA(opcion)}
        sx={{
          pl: anidada ? 1.75 : 1.5, position: 'relative',
          '&.Mui-selected::before': { content: '""', position: 'absolute', left: 0, top: 11, bottom: 11, width: 3, bgcolor: 'primary.main', borderRadius: 2 },
        }}
      >
        <ListItemIcon>{opcion.icono}</ListItemIcon>
        <ListItemText primary={opcion.texto} slotProps={{ primary: { noWrap: true, sx: { fontSize: 13, fontWeight: rutaSeleccionada(opcion.ruta, pathname) ? 600 : 400 } } }} />
      </ListItemButton>
    );
  }

  const menu = (
    <>
      <Toolbar sx={{ flexShrink: 0 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="overline" color="text.secondary">Espacio de trabajo</Typography>
        <IconButton aria-label="Cerrar menú de navegación" onClick={() => setMenuMovilAbierto(false)} sx={{ display: { md: 'none' } }}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      <List component="nav" aria-label="Navegación principal" sx={{ px: 1.5, pb: 3 }}>
        {opcionMenu(INICIO)}
        <Typography component="h2" sx={{ px: 1.5, pt: 2, pb: 0.75, fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'text.secondary', opacity: 0.85 }}>
          Módulos
        </Typography>
        {/* Un grupo desplegable por paquete; con una sola opción visible se muestra como enlace directo. */}
        {gruposVisibles.map((grupo) => {
          if (grupo.opciones.length === 1) return opcionMenu(grupo.opciones[0]);
          const abierto = abiertos.includes(grupo.titulo);
          const idLista = `grupo-${grupo.titulo.replace(/\s+/g, '-').toLowerCase()}`;
          return (
            <Box key={grupo.titulo} component="section" aria-label={grupo.titulo}>
              <ListItemButton onClick={() => alternarGrupo(grupo.titulo)} aria-expanded={abierto} aria-controls={idLista} sx={{ pl: 1.5 }}>
                <ListItemIcon>{grupo.icono}</ListItemIcon>
                <ListItemText primary={grupo.titulo} slotProps={{ primary: { noWrap: true, sx: { fontSize: 13.5, fontWeight: 600 } } }} />
                {abierto ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
              </ListItemButton>
              <Collapse in={abierto} timeout="auto" unmountOnExit>
                {/* Línea vertical a la izquierda, como en un árbol: marca qué opciones son del grupo. */}
                <List id={idLista} component="div" disablePadding sx={{ ml: 2.75, pl: 0.5, borderLeft: 1, borderColor: 'divider' }}>
                  {grupo.opciones.map((opcion) => opcionMenu(opcion, true))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
    </>
  );

  return (
    <ComandoVozProvider opciones={opcionesVoz}>
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menú de navegación"
            onClick={() => setMenuMovilAbierto(true)}
            sx={{ mr: { xs: 0.5, sm: 2 }, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ width: 34, height: 34, border: 1, borderColor: 'primary.main', borderRadius: '50%', display: { xs: 'none', sm: 'grid' }, placeItems: 'center', color: 'primary.main' }}><ContentCutIcon sx={{ fontSize: 18 }} /></Box>
            <Typography noWrap sx={{ fontFamily: FUENTE_TITULOS, fontWeight: 600, fontSize: { xs: 16, sm: 18 }, letterSpacing: '0.14em' }}>
              HOUSE <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>of</Box> CUT
            </Typography>
          </Box>
          {/* Identidad de la sesión actual; los roles se leen de la autenticación existente. */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.25, pr: 2, mr: 1, borderRight: 1, borderColor: 'divider' }}>
            <Avatar sx={{ width: 36, height: 36, fontSize: 12, fontWeight: 600, bgcolor: 'action.selected', color: 'primary.main', border: 1, borderColor: 'divider' }}>
              {usuario?.nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, maxWidth: 180 }}>
              <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{usuario?.nombre}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="p">{usuario?.roles.join(' · ')}</Typography>
            </Box>
          </Box>
          <BotonComandoVoz />
          <ThemeModeButton />
          <Tooltip title="Cerrar sesión">
            <Button color="inherit" onClick={salir} aria-label="Cerrar sesión"
              sx={{ flexShrink: 0, minWidth: { xs: 44, sm: 80 }, px: { xs: 1, sm: 1.5 }, gap: 1, color: 'text.secondary' }}>
              <LogoutIcon sx={{ fontSize: 20 }} /><Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Salir</Box>
            </Button>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Menú en celular: se abre con el botón hamburguesa. */}
      <Drawer
        variant="temporary"
        open={menuMovilAbierto}
        onClose={() => setMenuMovilAbierto(false)}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: ANCHO_MENU } }}
      >
        {menu}
      </Drawer>

      {/* Menú en escritorio: siempre visible. */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: ANCHO_MENU,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: ANCHO_MENU, boxSizing: 'border-box' },
        }}
      >
        {menu}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, lg: 4 }, minWidth: 0 }}>
        <Toolbar />
        {/* Aquí React Router pinta la página de la ruta actual. */}
        <Box key={versionPantalla} sx={{ maxWidth: 1440, mx: 'auto' }}><Outlet /></Box>
      </Box>
    </Box>
    </ComandoVozProvider>
  );
}
