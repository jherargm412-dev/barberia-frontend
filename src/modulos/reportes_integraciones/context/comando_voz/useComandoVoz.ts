import { useContext } from 'react';
import { ComandoVozContext } from './ComandoVozContext';

/** Acceso al ejecutor de comandos de voz; solo funciona dentro de ComandoVozProvider (MainLayout). */
export function useComandoVoz() {
  const contexto = useContext(ComandoVozContext);
  if (!contexto) throw new Error('useComandoVoz debe usarse dentro de ComandoVozProvider');
  return contexto;
}
