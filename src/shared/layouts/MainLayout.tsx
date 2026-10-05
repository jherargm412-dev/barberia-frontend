import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
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

const ANCHO_MENU = 240;

interface OpcionMenu {
  texto: string;
  ruta: string;
  icono: ReactNode;
  /** Si se indica, la opción solo aparece para usuarios con ese permiso. */
  permiso?: string;
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
  const [gruposAbiertos, setGruposAbiertos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(GRUPOS.map((grupo) => [grupo.titulo, grupo.opciones.some((opcion) => rutaSeleccionada(opcion.ruta, pathname))])),
  );

  const gruposVisibles = GRUPOS.map((grupo) => ({
    ...grupo,
    opciones: grupo.opciones.filter((opcion) => !opcion.permiso || tienePermiso(opcion.permiso)),
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
        onClick={() => irA(opcion)}
        sx={anidada ? { pl: 4 } : undefined}
      >
        <ListItemIcon>{opcion.icono}</ListItemIcon>
        <ListItemText primary={opcion.texto} />
      </ListItemButton>
    );
  }

  const menu = (
    <>
      <Toolbar />
      <List>
        {opcionMenu(INICIO)}
        {gruposVisibles.map((grupo) => (
          <Box key={grupo.titulo}>
            <ListItemButton
              aria-expanded={Boolean(gruposAbiertos[grupo.titulo])}
              aria-label={`${gruposAbiertos[grupo.titulo] ? 'Contraer' : 'Desplegar'} ${grupo.titulo}`}
              onClick={() => setGruposAbiertos((anteriores) => ({
                ...anteriores, [grupo.titulo]: !anteriores[grupo.titulo],
              }))}
            >
              <ListItemIcon>{grupo.icono}</ListItemIcon>
              <ListItemText primary={grupo.titulo} />
              {gruposAbiertos[grupo.titulo] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={Boolean(gruposAbiertos[grupo.titulo])} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {grupo.opciones.map((opcion) => opcionMenu(opcion, true))}
              </List>
            </Collapse>
          </Box>
        ))}
        {(!PERFIL.permiso || tienePermiso(PERFIL.permiso)) && opcionMenu(PERFIL)}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMenuMovilAbierto(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Barbería
          </Typography>
          <Typography sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>{usuario?.nombre}</Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={salir}>
            Salir
          </Button>
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

      <Box component="main" sx={{ flexGrow: 1, p: 3, minWidth: 0 }}>
        <Toolbar />
        {/* Aquí React Router pinta la página de la ruta actual. */}
        <Outlet />
      </Box>
    </Box>
  );
}
