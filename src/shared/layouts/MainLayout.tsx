import ContentCutIcon from '@mui/icons-material/ContentCut';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

const OPCIONES: OpcionMenu[] = [
  { texto: 'Inicio', ruta: '/', icono: <HomeIcon /> },
  // La opción de CU06 solo aparece para usuarios que pueden consultar clientes.
  { texto: 'Clientes', ruta: '/clientes', icono: <PeopleIcon />, permiso: 'CLIENTE_CONSULTAR' },
  { texto: 'Usuarios', ruta: '/usuarios', icono: <PeopleIcon />, permiso: 'USUARIO_GESTIONAR' },
  { texto: 'Servicios', ruta: '/servicios', icono: <ContentCutIcon />, permiso: 'SERVICIO_GESTIONAR' },
  { texto: 'Bitácora', ruta: '/bitacora', icono: <HistoryIcon />, permiso: 'BITACORA_CONSULTAR' },
];

/** Estructura de las páginas privadas: barra superior + menú lateral + contenido. */
export default function MainLayout() {
  const { usuario, cerrarSesion, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const opcionesVisibles = OPCIONES.filter((o) => !o.permiso || tienePermiso(o.permiso));

  async function salir() {
    await cerrarSesion();
    navigate('/login', { replace: true });
  }

  const menu = (
    <>
      <Toolbar />
      <List>
        {opcionesVisibles.map((opcion) => (
          <ListItemButton
            key={opcion.ruta}
            // "/usuarios/5" también marca "Usuarios" como seleccionado
            selected={opcion.ruta === '/' ? pathname === '/' : pathname.startsWith(opcion.ruta)}
            onClick={() => {
              navigate(opcion.ruta);
              setMenuMovilAbierto(false);
            }}
          >
            <ListItemIcon>{opcion.icono}</ListItemIcon>
            <ListItemText primary={opcion.texto} />
          </ListItemButton>
        ))}
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
