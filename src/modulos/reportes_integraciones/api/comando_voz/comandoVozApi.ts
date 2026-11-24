import { http } from '../../../../shared/api/httpClient';
import type { CodigoComando } from '../../types/comando_voz';

// Endpoint de ComandoVozController.java (CU28). Requiere el permiso VOZ_USAR.

/** Deja en la bitácora el comando que se ejecutó (acción COMANDO_VOZ). */
export async function registrarComandoVoz(comando: CodigoComando, texto: string, destino: string) {
  await http.post('/comandos-voz', { comando, texto: texto.slice(0, 200), destino: destino.slice(0, 200) });
}
