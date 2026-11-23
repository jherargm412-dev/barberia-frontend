import axios from 'axios';
import { http } from '../../../../shared/api/httpClient';
import type { FiltrosReporte, FormatoExportacion, OpcionesReporte, Reporte } from '../../types/generar_reportes';

/** Quita los filtros vacíos ("Todos") para no mandarlos al backend. */
function sinVacios(filtros: FiltrosReporte) {
  return Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== ''));
}

/** Barberos, ítems y usuarios para llenar los selectores de filtros. */
export async function obtenerOpcionesReporte(): Promise<OpcionesReporte> {
  const respuesta = await http.get<OpcionesReporte>('/reportes/opciones');
  return respuesta.data;
}

/** El reporte en JSON para verlo en pantalla. tipo: ventas, comisiones, etc. */
export async function generarReporte(tipo: string, filtros: FiltrosReporte): Promise<Reporte> {
  const respuesta = await http.get<Reporte>(`/reportes/${tipo}`, { params: sinVacios(filtros) });
  return respuesta.data;
}

/**
 * Descarga el reporte en PDF, Excel o HTML. El backend responde el archivo (un "blob"); para descargarlo se crea
 * un enlace temporal hacia él y se le hace clic desde el código.
 */
export async function exportarReporte(tipo: string, filtros: FiltrosReporte, formato: FormatoExportacion,
  nombreArchivo: string): Promise<void> {
  try {
    const respuesta = await http.get<Blob>(`/reportes/${tipo}/exportar`, {
      params: { ...sinVacios(filtros), formato },
      responseType: 'blob',
    });
    const url = URL.createObjectURL(respuesta.data);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    // Con responseType 'blob' también el error llega como blob: se convierte a JSON para que
    // obtenerError() pueda leer el mensaje del backend como en cualquier otra petición.
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // No era JSON: se deja como está y se mostrará el mensaje genérico.
      }
    }
    throw error;
  }
}
