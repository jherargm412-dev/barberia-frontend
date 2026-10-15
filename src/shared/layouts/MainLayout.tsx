import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import BadgeIcon from '@mui/icons-material/BadgeOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import ContentCutIcon from '@mui/icons-material/ContentCutOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
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
import ThemeModeButton from '../components/ThemeModeButton';

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
const PERFIL: OpcionMenu = { texto: 'Mi perfil', ruta: '/perfil', icono: <AccountCircleIcon />, permiso: 'PERFIL_EDITAR' };

// Cada grupo conserva los permisos de sus opciones; si ninguna es visible, se oculta completo.
const GRUPOS: GrupoMenu[] = [
  {
    // Agrupa las nuevas pantallas de reservas conservando sus permisos.
    titulo: 'Citas y horarios', icono: <CalendarMonthIcon />, opciones: [
      // CU12: el cliente solicita su cita en línea.
      { texto: 'Solicitar cita', ruta: '/solicitar-cita', icono: <EventNoteIcon />, permiso: 'RESERVA_SOLICITAR' },
      { texto: 'Mis citas', ruta: '/mis-citas', icono: <EventIcon />, permiso: 'RESERVA_SOLICITAR' },
      { texto: 'Citas', ruta: '/citas', icono: <EventIcon />, permiso: 'AGENDA_CONSULTAR' },
      { texto: 'Agenda de Citas', ruta: '/agenda', icono: <CalendarMonthIcon />, permiso: ['AGENDA_CONSULTAR', 'AGENDA_CONSULTAR_PROPIA'] },
      // CU10: horas libres por servicio y barbero, para agendar.
      { texto: 'Disponibilidad', ruta: '/disponibilidad', icono: <ScheduleIcon />, permiso: 'RESERVA_CREAR' },
      { texto: 'Horarios', ruta: '/horarios', icono: <EventAvailableIcon />, permiso: 'USUARIO_GESTIONAR' },
    ],
  },
  {
    titulo: 'Gestión', icono: <PeopleIcon />, opciones: [
      { texto: 'Clientes', ruta: '/clientes', icono: <PeopleIcon />, permiso: 'CLIENTE_CONSULTAR' },
      { texto: 'Barberos', ruta: '/empleados', icono: <BadgeIcon />, permiso: 'USUARIO_GESTIONAR' },
      { texto: 'Servicios', ruta: '/servicios', icono: <ContentCutIcon />, permiso: 'SERVICIO_GESTIONAR' },
    ],
  },
  {
    titulo: 'Usuarios y permisos', icono: <AdminPanelSettingsIcon />, opciones: [
      { texto: 'Usuarios', ruta: '/usuarios', icono: <PeopleIcon />, permiso: 'USUARIO_GESTIONAR' },
      { texto: 'Roles y permisos', ruta: '/roles', icono: <AdminPanelSettingsIcon />, permiso: 'ROL_ASIGNAR' },
      { texto: 'Bitácora', ruta: '/bitacora', icono: <HistoryIcon />, permiso: 'BITACORA_CONSULTAR' },
    ],
  },
  {
    titulo: 'Ventas y caja', icono: <AccountBalanceWalletIcon />, opciones: [
      // CU21 conserva la visibilidad según el permiso de consulta.
      { texto: 'Caja', ruta: '/caja', icono: <AccountBalanceWalletIcon />, permiso: 'CAJA_CONSULTAR' },
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
  const { pathname } = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(pathname);
  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GRUPOS.map((grupo) => [grupo.titulo, grupo.opciones.some((opcion) => rutaSeleccionada(opcion.ruta, pathname))])),
  );

  // Sincroniza el grupo también al navegar desde enlaces, historial o accesos rápidos.
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname);
    const actual = GRUPOS.find((grupo) => grupo.opciones.some((opcion) => rutaSeleccionada(opcion.ruta, pathname)));
    if (actual) setGruposAbiertos((anteriores) => ({ ...anteriores, [actual.titulo]: true }));
  }

  const gruposVisibles = GRUPOS.map((grupo) => ({
    ...grupo,
    opciones: grupo.opciones.filter((opcion) => !opcion.permiso || (Array.isArray(opcion.permiso) ? opcion.permiso.some((permiso) => tienePermiso(permiso)) : tienePermiso(opcion.permiso))),
  })).filter((grupo) => grupo.opciones.length > 0);

  async function salir() {
    await cerrarSesion();
    navigate('/login', { replace: true });
  }

  function irA(opcion: OpcionMenu) {
    // Mantiene visible el apartado elegido al navegar desde el menú.
    const grupo = GRUPOS.find((actual) => actual.opciones.includes(opcion));
    if (grupo) setGruposAbiertos((anteriores) => ({ ...anteriores, [grupo.titulo]: true }));
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
          pl: anidada ? 3 : 1.5, position: 'relative',
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
        {gruposVisibles.map((grupo) => (
          <Box key={grupo.titulo} sx={{ mt: 1 }}>
            <ListItemButton
              sx={{ color: grupo.opciones.some((opcion) => rutaSeleccionada(opcion.ruta, pathname)) ? 'text.primary' : 'text.secondary' }}
              aria-expanded={Boolean(gruposAbiertos[grupo.titulo])}
              aria-label={`${gruposAbiertos[grupo.titulo] ? 'Contraer' : 'Desplegar'} ${grupo.titulo}`}
              onClick={() => setGruposAbiertos((anteriores) => ({
                ...anteriores, [grupo.titulo]: !anteriores[grupo.titulo],
              }))}
            >
              <ListItemIcon>{grupo.icono}</ListItemIcon>
              <ListItemText primary={grupo.titulo} slotProps={{ primary: { noWrap: true, sx: { fontSize: 13, fontWeight: 600 } } }} />
              <ExpandMoreIcon sx={{ fontSize: 18, transform: gruposAbiertos[grupo.titulo] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)' }} />
            </ListItemButton>
            <Collapse in={Boolean(gruposAbiertos[grupo.titulo])} timeout={180} unmountOnExit>
              <List component="div" disablePadding>
                {grupo.opciones.map((opcion) => opcionMenu(opcion, true))}
              </List>
            </Collapse>
          </Box>
        ))}
        {(!PERFIL.permiso || (Array.isArray(PERFIL.permiso) ? PERFIL.permiso.some((permiso) => tienePermiso(permiso)) : tienePermiso(PERFIL.permiso))) && opcionMenu(PERFIL)}
      </List>
    </>
  );

  return (
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
            <Box sx={{ width: 34, height: 34, border: 1, borderColor: 'divider', borderRadius: 1, display: { xs: 'none', sm: 'grid' }, placeItems: 'center', color: 'primary.main' }}><ContentCutIcon sx={{ fontSize: 20 }} /></Box>
            <Typography noWrap sx={{ fontWeight: 750, fontSize: { xs: 14, sm: 16 }, letterSpacing: '0.035em' }}>
              HOUSE <Box component="span" sx={{ fontWeight: 400, color: 'text.secondary', fontSize: '0.85em' }}>of</Box> CUT
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
        <Box sx={{ maxWidth: 1440, mx: 'auto' }}><Outlet /></Box>
      </Box>
    </Box>
  );
}
