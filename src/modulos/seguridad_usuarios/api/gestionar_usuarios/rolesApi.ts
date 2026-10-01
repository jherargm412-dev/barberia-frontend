import { http } from '../../../../shared/api/httpClient';
import type { RolResumen } from '../../types/gestionar_usuarios';

// GET /api/v1/roles?activo=true (RolController.java de CU03): roles activos para los selectores.
export async function listarRoles() {
  const respuesta = await http.get<RolResumen[]>('/roles', { params: { activo: true } });
  return respuesta.data;
}
