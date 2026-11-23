// Filtros que llegan en la URL. Los usa CU28 Comando de Voz para abrir una pantalla con la búsqueda
// ya aplicada (por ejemplo /clientes?buscar=Pérez o /agenda?fecha=2026-11-23&vista=SEMANA).

/** Devuelve la fecha si tiene el formato AAAA-MM-DD y existe; si no, null. */
export function fechaDeUrl(valor: string | null): string | null {
  if (!valor || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia ? valor : null;
}

/** Devuelve el valor solo si es una de las opciones permitidas; si no, null. */
export function opcionDeUrl<T extends string>(valor: string | null, opciones: readonly T[]): T | null {
  return valor !== null && (opciones as readonly string[]).includes(valor) ? (valor as T) : null;
}

/** Minúsculas y sin tildes, para comparar textos dictados o escritos ("Pérez" = "perez"). */
export function normalizarTexto(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
