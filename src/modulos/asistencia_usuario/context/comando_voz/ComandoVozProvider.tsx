import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useColorScheme } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../seguridad_usuarios';
import { registrarComandoVoz } from '../../api/comando_voz/comandoVozApi';
import type { OpcionAbrible, ResultadoComando } from '../../types/comando_voz';
import { interpretarComando } from '../../utils/comando_voz/interpretarComando';
import { ComandoVozContext, type SeveridadAviso } from './ComandoVozContext';

interface Props {
  /** Opciones del menú que el usuario ve: son las únicas que "abrir …" puede abrir. */
  opciones: OpcionAbrible[];
  children: ReactNode;
}

/**
 * Marca que se manda en la navegación cuando el comando abre la misma pantalla con otro filtro. MainLayout
 * la ve junto con la URL nueva y vuelve a montar la pantalla para que lea los filtros nuevos.
 */
export interface EstadoNavegacionVoz {
  comandoVoz: number;
}

interface Aviso {
  texto: string;
  severidad: SeveridadAviso;
  conAyuda: boolean;
  /** Cambia en cada aviso para reiniciar el tiempo de cierre. */
  clave: number;
}

/** CU28: ejecuta los comandos de voz (o escritos) y muestra el resultado en un aviso. */
export default function ComandoVozProvider({ opciones, children }: Props) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { tienePermiso } = useAuth();
  const { setMode } = useColorScheme();
  const [aviso, setAviso] = useState<Aviso | null>(null);

  function avisar(texto: string, severidad: SeveridadAviso = 'info', conAyuda = false) {
    setAviso({ texto, severidad, conAyuda, clave: Date.now() });
  }

  function registrar(resultado: Extract<ResultadoComando, { comando: string }>, texto: string, destino: string) {
    // La bitácora no debe frenar al usuario: si falla, el comando igual ya se ejecutó.
    registrarComandoVoz(resultado.comando, texto, destino).catch(() => undefined);
  }

  function ejecutar(alternativas: string[]): ResultadoComando {
    const contexto = { tienePermiso, opciones, hoy: new Date() };
    const intentos = alternativas.map((texto) => ({ texto, resultado: interpretarComando(texto, contexto) }));
    const elegido = intentos.find((i) => i.resultado.tipo !== 'no-entendido') ?? intentos[0];
    if (!elegido) return { tipo: 'no-entendido', mensaje: 'No se escuchó ningún comando.' };
    const { texto, resultado } = elegido;

    switch (resultado.tipo) {
      case 'navegar': {
        const mismaPantalla = resultado.destino.split('?')[0] === pathname;
        const estado: EstadoNavegacionVoz | undefined = mismaPantalla ? { comandoVoz: Date.now() } : undefined;
        navigate(resultado.destino, { state: estado });
        registrar(resultado, texto, resultado.destino);
        avisar(resultado.mensaje, 'success');
        break;
      }
      case 'tema':
        setMode(resultado.modo);
        registrar(resultado, texto, `${pathname}${search}`);
        avisar(resultado.mensaje, 'success');
        break;
      case 'sin-permiso':
        avisar(resultado.mensaje, 'warning');
        break;
      default:
        avisar(resultado.mensaje, 'info', true);
    }
    return resultado;
  }

  function cerrarAviso() {
    setAviso(null);
  }

  return (
    <ComandoVozContext.Provider value={{ ejecutar, avisar: (t, s) => avisar(t, s), cerrarAviso }}>
      {children}
      <Snackbar
        key={aviso?.clave}
        open={aviso !== null}
        autoHideDuration={aviso?.severidad === 'info' && !aviso.conAyuda ? null : 6000}
        onClose={(_, motivo) => { if (motivo !== 'clickaway') cerrarAviso(); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {aviso ? (
          <Alert
            severity={aviso.severidad}
            variant="filled"
            onClose={cerrarAviso}
            role={aviso.severidad === 'error' || aviso.severidad === 'warning' ? 'alert' : 'status'}
            action={aviso.conAyuda ? (
              <Button color="inherit" size="small" onClick={() => { navigate('/comandos-voz'); cerrarAviso(); }}>
                Ver comandos
              </Button>
            ) : undefined}
            sx={{ alignItems: 'center', maxWidth: 560 }}
          >
            {aviso.texto}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ComandoVozContext.Provider>
  );
}
