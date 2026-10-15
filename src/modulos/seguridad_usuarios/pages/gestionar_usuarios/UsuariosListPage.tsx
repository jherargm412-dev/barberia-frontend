import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import PageHeader from '../../../../shared/components/PageHeader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/iniciar_sesion/useAuth';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { listarRoles } from '../../api/gestionar_usuarios/rolesApi';
import { listarUsuarios } from '../../api/gestionar_usuarios/usuariosApi';
import UsuariosFiltros from '../../components/gestionar_usuarios/UsuariosFiltros';
import UsuariosTabla from '../../components/gestionar_usuarios/UsuariosTabla';
import { PERMISOS } from '../../constants/gestionar_usuarios';
import type { FiltrosUsuarios, RolResumen, UsuarioResumen } from '../../types/gestionar_usuarios';

/** CU01 paso 2: listado de usuarios con filtros y paginación. */
export default function UsuariosListPage() {
  const navigate = useNavigate();
  const { tienePermiso } = useAuth();
  const puedeAsignarRoles = tienePermiso(PERMISOS.ASIGNAR_ROL);

  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    q: '',
    estado: '',
    rol: '',
    page: 0,
    size: 10,
  });
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [total, setTotal] = useState(0);
  const [roles, setRoles] = useState<RolResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Roles para el filtro: se cargan una vez.
  useEffect(() => {
    listarRoles().then(setRoles).catch(() => setRoles([]));
  }, []);

  // Cada vez que cambian los filtros o la página, volvemos a pedir la lista.
  useEffect(() => {
    listarUsuarios(filtros)
      .then((pagina) => {
        setUsuarios(pagina.contenido);
        setTotal(pagina.totalElementos);
      })
      .catch((err) => setError(obtenerError(err).mensaje))
      .finally(() => setCargando(false));
  }, [filtros]);

  /** Cambia filtros/página y deja listo el estado de "cargando" para el useEffect. */
  function cambiarFiltros(nuevos: Partial<FiltrosUsuarios>) {
    setFiltros({ ...filtros, ...nuevos });
    setCargando(true);
    setError('');
  }

  return (
    <>
      <PageHeader title="Usuarios" description="Administra las cuentas, sus roles y el acceso al sistema." action={puedeAsignarRoles && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/usuarios/nuevo')}>
            Nuevo usuario
          </Button>
        )} />

      {/* Al buscar volvemos a la primera página. */}
      <UsuariosFiltros roles={roles} onBuscar={(f) => cambiarFiltros({ ...f, page: 0 })} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {cargando && <LinearProgress />}

      <UsuariosTabla mostrarVacio={!cargando && !error}
        usuarios={usuarios}
        total={total}
        pagina={filtros.page}
        tamano={filtros.size}
        puedeEditar={puedeAsignarRoles}
        onCambiarPagina={(page) => cambiarFiltros({ page })}
        onCambiarTamano={(size) => cambiarFiltros({ size, page: 0 })}
      />
    </>
  );
}
