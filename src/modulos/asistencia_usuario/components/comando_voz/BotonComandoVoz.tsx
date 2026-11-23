import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffIcon from '@mui/icons-material/MicOffOutlined';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { keyframes } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../seguridad_usuarios';
import { IDIOMA_VOZ, PERMISO_VOZ } from '../../constants/comando_voz';
import { useComandoVoz } from '../../context/comando_voz/useComandoVoz';
import { precargarModeloLocal, ReconocedorLocal } from '../../utils/comando_voz/reconocedorLocal';
import {
  contextoSeguro,
  crearReconocedor,
  descartarMotorNavegador,
  leerResultado,
  mensajeErrorVoz,
  motorVoz,
  vozDisponible,
  type ReconocedorVoz,
} from '../../utils/comando_voz/reconocimientoVoz';

/** Errores del servicio de voz del navegador (no del micrófono): se pasa al reconocedor propio. */
const FALLOS_DEL_SERVICIO = ['network', 'service-not-allowed', 'language-not-supported'];

const pulso = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.55); }
  70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
  100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
`;

/**
 * CU28 paso 1: micrófono de la barra superior. Al presionarlo escucha una frase, la muestra mientras se
 * habla y, al terminar, la ejecuta como comando. Presionarlo de nuevo deja de escuchar. Usa el reconocedor
 * del navegador y, si no hay o no responde, el propio (funciona en todos los navegadores).
 */
export default function BotonComandoVoz() {
  const { tienePermiso } = useAuth();
  const { ejecutar, avisar, cerrarAviso } = useComandoVoz();
  const [escuchando, setEscuchando] = useState(false);
  const reconocedor = useRef<ReconocedorVoz | null>(null);
  const detenidoPorUsuario = useRef(false);
  const disponible = vozDisponible();
  const seguro = contextoSeguro();

  // Al salir de la pantalla (cerrar sesión, etc.) se suelta el micrófono.
  useEffect(() => () => reconocedor.current?.abort(), []);

  if (!tienePermiso(PERMISO_VOZ)) return null;

  function detener() {
    detenidoPorUsuario.current = true;
    reconocedor.current?.stop();
  }

  /** Con el reconocedor propio, el modelo empieza a bajar apenas el puntero se acerca al micrófono. */
  function prepararse() {
    if (motorVoz() === 'local') precargarModeloLocal();
  }

  function escuchar() {
    if (!seguro) {
      avisar('El micrófono solo funciona si la página se abre con https o desde localhost.', 'error');
      return;
    }
    const motor = motorVoz();
    const nuevo = crearReconocedor(IDIOMA_VOZ);
    if (!motor || !nuevo) {
      avisar('Este navegador no permite usar el micrófono. Actualícelo o escriba el comando en Asistencia → Comandos de voz.', 'error');
      return;
    }
    detenidoPorUsuario.current = false;
    // Cada intento termina con un aviso: comando ejecutado, error, o por qué no se escuchó nada.
    let avisado = false;
    let audioAbierto = false;
    // El servicio del navegador no respondió: se repite el intento con el reconocedor propio.
    let pasarAlPropio = false;
    const listo = 'Escuchando… diga un comando, por ejemplo "agenda de mañana".';
    nuevo.onaudiostart = () => {
      audioAbierto = true;
      if (motor === 'local') avisar(listo);
    };
    if (nuevo instanceof ReconocedorLocal) {
      nuevo.oncargando = () => avisar('Preparando el reconocedor de voz… la primera vez descarga unos 40 MB.');
    }
    nuevo.onresult = (evento) => {
      const { parcial, finales } = leerResultado(evento);
      if (finales.length > 0) {
        avisado = true;
        ejecutar(finales);
      } else if (parcial) {
        avisar(`Escuchando… "${parcial}"`);
      }
    };
    nuevo.onerror = (evento) => {
      avisado = true;
      if (evento.error === 'aborted' && detenidoPorUsuario.current) {
        cerrarAviso();
        return;
      }
      if (motor === 'navegador' && FALLOS_DEL_SERVICIO.includes(evento.error)) {
        pasarAlPropio = true;
        return;
      }
      avisar(mensajeErrorVoz(evento.error), evento.error === 'no-speech' ? 'info' : 'error');
    };
    nuevo.onend = () => {
      setEscuchando(false);
      reconocedor.current = null;
      // Cerrarse sin abrir el micrófono ni dar error también es un servicio que no funciona (p. ej. Brave).
      const servicioMudo = motor === 'navegador' && !avisado && !audioAbierto && !detenidoPorUsuario.current;
      if ((pasarAlPropio || servicioMudo) && descartarMotorNavegador()) {
        window.setTimeout(escuchar, 0);
        return;
      }
      if (pasarAlPropio) {
        avisar(mensajeErrorVoz('network'), 'error');
        return;
      }
      if (avisado) return;
      if (detenidoPorUsuario.current) cerrarAviso();
      else if (!audioAbierto) {
        avisar('El navegador no abrió el micrófono. Revise el permiso en el candado de la barra de direcciones y que el micrófono esté conectado.', 'error');
      } else avisar('No se escuchó ningún comando. Presione el micrófono y hable de nuevo.', 'info');
    };
    reconocedor.current = nuevo;
    try {
      nuevo.start();
      setEscuchando(true);
      avisar(motor === 'local' ? 'Activando el micrófono…' : listo);
    } catch {
      avisar('No se pudo iniciar el micrófono. Intente de nuevo.', 'error');
    }
  }

  const etiqueta = !seguro
    ? 'El micrófono necesita https o localhost'
    : !disponible
      ? 'Este navegador no permite usar el micrófono'
      : escuchando ? 'Dejar de escuchar' : 'Comando de voz';

  return (
    <Tooltip title={etiqueta}>
      {/* El span permite mostrar el tooltip aunque el botón esté deshabilitado. */}
      <span>
        <IconButton
          color={escuchando ? 'error' : 'inherit'}
          aria-label={etiqueta}
          aria-pressed={escuchando}
          // Sin https se deja presionar para explicar el motivo; sin ningún motor no hay nada que hacer.
          disabled={seguro && !disponible}
          onClick={escuchando ? detener : escuchar}
          onPointerEnter={prepararse}
          onFocus={prepararse}
          sx={escuchando ? { animation: `${pulso} 1.4s ease-out infinite`, bgcolor: 'action.selected' } : undefined}
        >
          {seguro && !disponible ? <MicOffIcon /> : escuchando ? <MicIcon /> : <MicNoneIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
