import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../../../shared/components/PageHeader';
import { obtenerError } from '../../../../shared/utils/obtenerError';
import { exportarReporte, generarReporte, obtenerOpcionesReporte } from '../../api/generar_reportes/reportesApi';
import CatalogoReportes from '../../components/generar_reportes/CatalogoReportes';
import FiltrosReporteForm from '../../components/generar_reportes/FiltrosReporteForm';
import { ICONOS_REPORTE } from '../../components/generar_reportes/iconosReporte';
import ResultadoReporte from '../../components/generar_reportes/ResultadoReporte';
import { GRUPOS_REPORTES, REPORTES } from '../../constants/generar_reportes';
import type { FiltrosReporte, FormatoExportacion, OpcionesReporte, Reporte } from '../../types/generar_reportes';
import { filtrosIniciales, nombreArchivo } from '../../utils/generar_reportes/reporteFormato';

/** Campos de la URL que no son filtros: qué reporte se ve y si ya se generó. */
const CONTROL = ['tipo', 'generar'];
/** El periodo se conserva al cambiar de reporte; los filtros propios, no. */
const CAMPOS_PERIODO = ['periodo', 'fecha', 'desde', 'hasta'];

/** Respuesta del backend junto con la URL que la pidió, para saber si corresponde a lo que se ve ahora. */
interface Resultado {
  url: string;
  reporte: Reporte | null;
  error: string;
}

/** Filtro rechazado por el backend: se vuelve al paso 1 mostrando el mensaje y el campo con error. */
interface Rechazo {
  mensaje: string;
  campos: Record<string, string>;
}

/**
 * Generar Reportes (RF29 operativos y RF30 de gestión), solo para el Administrador.
 * Todo lo elegido vive en la URL (/reportes?tipo=ventas&periodo=MENSUAL&fecha=2026-11-01&generar=1): así el botón
 * "atrás" del navegador y recargar la página funcionan sin perder los filtros.
 *   - sin tipo: catálogo de reportes;
 *   - con tipo: paso 1, filtros;
 *   - con generar=1: paso 2, resultado (con las exportaciones a PDF, Excel y HTML).
 */
export default function ReportesPage() {
  const [parametros, setParametros] = useSearchParams();
  const tipo = parametros.get('tipo') ?? '';
  const generado = parametros.get('generar') === '1';
  const definicion = REPORTES.find((r) => r.clave === tipo) ?? null;
  const url = parametros.toString();

  // Filtros que trae la URL (todo menos tipo y generar).
  const filtrosUrl: FiltrosReporte = {};
  parametros.forEach((valor, clave) => {
    if (!CONTROL.includes(clave)) filtrosUrl[clave] = valor;
  });
  const hayFiltros = Object.keys(filtrosUrl).length > 0;

  const [opciones, setOpciones] = useState<OpcionesReporte | null>(null);
  const [errorOpciones, setErrorOpciones] = useState('');
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [rechazo, setRechazo] = useState<Rechazo | null>(null);
  const [exportando, setExportando] = useState<FormatoExportacion | null>(null);
  const [errorExportar, setErrorExportar] = useState('');

  // Lo que se muestra se calcula: solo vale el resultado que corresponde a la URL actual.
  const actual = generado && resultado?.url === url ? resultado : null;
  const cargando = Boolean(definicion && generado && !actual);

  // Listas para los selectores: se cargan una vez, al abrir el primer reporte.
  useEffect(() => {
    if (!definicion || opciones) return;
    let vigente = true;
    obtenerOpcionesReporte()
      .then((o) => vigente && setOpciones(o))
      .catch((err) => vigente && setErrorOpciones(obtenerError(err).mensaje));
    return () => {
      vigente = false;
    };
  }, [definicion, opciones]);

  // Paso 2: pide el reporte cada vez que la URL dice generar=1 (o cambian sus filtros).
  useEffect(() => {
    if (!definicion || !generado) return;
    let vigente = true;
    generarReporte(definicion.clave, filtrosUrl)
      .then((reporte) => vigente && setResultado({ url, reporte, error: '' }))
      .catch((err) => {
        if (!vigente) return;
        const { mensaje, campos } = obtenerError(err);
        if (Object.keys(campos).length > 0) {
          // El problema es de un filtro: se vuelve al paso 1 marcando el campo.
          setRechazo({ mensaje, campos });
          const sinGenerar = new URLSearchParams(url);
          sinGenerar.delete('generar');
          setParametros(sinGenerar, { replace: true });
        } else {
          setResultado({ url, reporte: null, error: mensaje });
        }
      });
    return () => {
      vigente = false;
    };
    // url resume tipo + filtros + generar: basta con ella para saber si hay que volver a pedir el reporte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function elegirReporte(clave: string) {
    // Se conserva el periodo elegido; los filtros propios del reporte anterior no aplican al nuevo.
    const periodo = Object.fromEntries(Object.entries(filtrosUrl).filter(([c]) => CAMPOS_PERIODO.includes(c)));
    setRechazo(null);
    setErrorExportar('');
    setParametros({ tipo: clave, ...periodo });
  }

  function generar(filtros: FiltrosReporte) {
    setRechazo(null);
    setErrorExportar('');
    setParametros({ tipo, ...filtros, generar: '1' });
  }

  function volverAFiltros() {
    setErrorExportar('');
    setParametros({ tipo, ...filtrosUrl });
  }

  async function exportar(formato: FormatoExportacion) {
    if (!actual?.reporte || !definicion) return;
    setExportando(formato);
    setErrorExportar('');
    try {
      await exportarReporte(definicion.clave, filtrosUrl, formato, nombreArchivo(actual.reporte, formato));
    } catch (err) {
      setErrorExportar(obtenerError(err).mensaje);
    } finally {
      setExportando(null);
    }
  }

  // La key del formulario cambia con los filtros de la URL: así React lo crea de nuevo con esos valores.
  const claveFormulario = `${tipo}?${new URLSearchParams(filtrosUrl).toString()}`;

  return (
    <>
      <PageHeader title="Reportes" description="Ventas, caja, inventario, comisiones y clientes por periodo." />

      {/* Acceso directo a cualquier reporte, agrupados como en el catálogo. */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        {GRUPOS_REPORTES.map((grupo) => (
          <Box key={grupo.nombre} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mr: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>{grupo.nombre}</Typography>
            {REPORTES.filter((r) => r.grupo === grupo.nombre).map((r) => (
              <Chip key={r.clave} label={r.titulo}
                icon={<Box component="span" sx={{ display: 'flex', '& svg': { fontSize: 18 } }}>{ICONOS_REPORTE[r.clave]}</Box>}
                color={r.clave === tipo ? 'primary' : 'default'} variant={r.clave === tipo ? 'filled' : 'outlined'}
                onClick={() => elegirReporte(r.clave)} />
            ))}
          </Box>
        ))}
      </Paper>

      {tipo && !definicion && <Alert severity="warning" sx={{ mb: 2 }}>El reporte solicitado no existe. Elija uno de la lista.</Alert>}

      {!definicion ? (
        <CatalogoReportes onElegir={elegirReporte} />
      ) : (
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
          <Stepper nonLinear activeStep={generado ? 1 : 0} sx={{ mb: 3 }}>
            <Step completed={generado}>
              <StepButton onClick={generado ? volverAFiltros : undefined}>Filtros</StepButton>
            </Step>
            <Step>
              <StepButton disabled={!generado}>Resultado</StepButton>
            </Step>
          </Stepper>

          {errorOpciones && <Alert severity="warning" sx={{ mb: 2 }}>{errorOpciones}</Alert>}

          {!generado && (
            <>
              {rechazo && <Alert severity="error" sx={{ mb: 2 }}>{rechazo.mensaje}</Alert>}
              <Typography variant="h6" component="h2">{definicion.titulo}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{definicion.descripcion}</Typography>
              <FiltrosReporteForm key={claveFormulario} definicion={definicion}
                valoresIniciales={hayFiltros ? filtrosUrl : filtrosIniciales()} opciones={opciones}
                erroresServidor={rechazo?.campos ?? {}} onGenerar={generar} />
            </>
          )}

          {cargando && <LinearProgress sx={{ mb: 2 }} />}
          {actual?.error && <Alert severity="error" sx={{ mb: 2 }}>{actual.error}</Alert>}
          {errorExportar && <Alert severity="error" sx={{ mb: 2 }}>{errorExportar}</Alert>}
          {actual?.reporte && (
            <ResultadoReporte reporte={actual.reporte} exportando={exportando} onExportar={exportar}
              onCambiarFiltros={volverAFiltros} />
          )}
        </Paper>
      )}
    </>
  );
}
