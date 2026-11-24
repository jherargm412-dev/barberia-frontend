import { normalizarTexto } from '../../../../shared/utils/parametrosUrl';
import { REPORTES_POR_PALABRA, SINONIMOS_MENU } from '../../constants/comando_voz';
import type { CodigoComando, ContextoComando, OpcionAbrible, ResultadoComando } from '../../types/comando_voz';

// CU28: convierte la frase dictada en una pantalla a abrir. Es una función pura (sin React ni navegador)
// para poder probarla con texto escrito. Nunca devuelve una acción que guarde o cambie datos.

/** Frase separada en palabras: las originales (para buscar "Pérez" tal cual) y las normalizadas (para comparar). */
interface Palabras {
  originales: string[];
  normales: string[];
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const RELLENO_INICIAL = ['por favor', 'oye', 'sistema', 'quiero', 'quisiera', 'necesito', 'puedes', 'podrias'];
const VERBOS_ABRIR = ['abrir', 'abre', 'abreme', 'ir a', 'ir al', 'anda a', 'anda al', 've a', 've al', 'entrar a',
  'entrar al', 'ver', 'mostrar', 'muestra', 'muestrame', 'ensename', 'llevame a', 'llevame al'];
const ARTICULOS = ['el', 'la', 'los', 'las', 'mi', 'mis', 'de', 'del', 'para', 'a', 'al', 'en', 'con', 'por'];

/**
 * Palabras que el reconocedor propio (modelo pequeño de español, sin "stock" en su vocabulario) confunde de
 * forma conocida. Medido con frases dictadas: "stock bajo" → "esto bajo", "producto cera" → "producto será".
 */
const CORRECCIONES_OIDO: [RegExp, string][] = [
  [/\b(?:esto|estoc|estok|estock|stok|stop)(?=\s+(?:bajo|minimo|mínimo)(?:\s|$))/gi, 'stock'],
  [/\b(bajo|poco)\s+(?:esto|estoc|estok|estock|stok)(?=\s|$)/gi, '$1 stock'],
  [/\b(productos?|insumos?)\s+(?:será|sera|era)(?=\s|$)/gi, '$1 cera'],
];

function corregirOido(texto: string) {
  return CORRECCIONES_OIDO.reduce((t, [patron, reemplazo]) => t.replace(patron, reemplazo), texto);
}

function separar(texto: string): Palabras {
  const originales = corregirOido(texto).replace(/[¿?¡!.,;:"“”«»()]/g, ' ').split(/\s+/).filter(Boolean);
  return { originales, normales: originales.map(normalizarTexto) };
}

function unir(p: Palabras, desde = 0) {
  return p.normales.slice(desde).join(' ');
}

function cortar(p: Palabras, desde: number): Palabras {
  return { originales: p.originales.slice(desde), normales: p.normales.slice(desde) };
}

/** Cuántas palabras ocupa el prefijo si la frase empieza con alguno de ellos (el más largo gana). */
function prefijo(p: Palabras, opciones: string[]) {
  const frase = unir(p);
  const encontrado = opciones
    .filter((o) => frase === o || frase.startsWith(`${o} `))
    .sort((a, b) => b.length - a.length)[0];
  return encontrado ? encontrado.split(' ').length : 0;
}

/** Quita palabras de cortesía y verbos como "abrir" o "ver" del inicio. */
function quitarInicio(p: Palabras, opciones: string[]) {
  let actual = p;
  let n = prefijo(actual, opciones);
  while (n > 0 && n < actual.normales.length) {
    actual = cortar(actual, n);
    n = prefijo(actual, opciones);
  }
  return actual;
}

function quitarArticulos(p: Palabras) {
  let i = 0;
  while (i < p.normales.length - 1 && ARTICULOS.includes(p.normales[i])) i += 1;
  return cortar(p, i);
}

function aIso(fecha: Date) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(fecha: Date, dias: number) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

interface FechaDicha {
  fecha: string;
  semana: boolean;
  /** Índice de la primera palabra que forma parte de la fecha (lo anterior es, p. ej., el servicio). */
  inicio: number;
}

/**
 * Busca una fecha al final de la frase: "hoy", "mañana", "pasado mañana", "el viernes",
 * "la semana", "la próxima semana". Devuelve null si no hay ninguna.
 */
function fechaAlFinal(p: Palabras, hoy: Date): FechaDicha | null {
  const n = p.normales;
  const ultimo = n.length - 1;
  if (ultimo < 0) return null;
  const desde = (i: number) => {
    let j = i;
    while (j > 0 && ARTICULOS.includes(n[j - 1])) j -= 1;
    return j;
  };

  if (n[ultimo] === 'manana' && n[ultimo - 1] === 'pasado') {
    return { fecha: aIso(sumarDias(hoy, 2)), semana: false, inicio: desde(ultimo - 1) };
  }
  if (n[ultimo] === 'hoy') return { fecha: aIso(hoy), semana: false, inicio: desde(ultimo) };
  if (n[ultimo] === 'manana') return { fecha: aIso(sumarDias(hoy, 1)), semana: false, inicio: desde(ultimo) };
  if (n[ultimo] === 'semana' || (n[ultimo] === 'viene' && n[ultimo - 2] === 'semana')) {
    const proxima = n.includes('proxima') || n.includes('siguiente') || n[ultimo] === 'viene';
    const i = n.lastIndexOf('semana');
    const inicioFrase = ['proxima', 'siguiente', 'esta'].includes(n[i - 1]) ? i - 1 : i;
    return { fecha: aIso(sumarDias(hoy, proxima ? 7 : 0)), semana: true, inicio: desde(inicioFrase) };
  }
  const dia = DIAS_SEMANA.indexOf(n[ultimo]);
  if (dia >= 0) {
    // El próximo día con ese nombre; si es hoy, hoy.
    const faltan = (dia - hoy.getDay() + 7) % 7;
    return { fecha: aIso(sumarDias(hoy, faltan)), semana: false, inicio: desde(ultimo) };
  }
  return null;
}

function navegar(comando: CodigoComando, destino: string, mensaje: string): ResultadoComando {
  return { tipo: 'navegar', comando, destino, mensaje };
}

function sinPermiso(pantalla: string): ResultadoComando {
  return { tipo: 'sin-permiso', mensaje: `Su rol no tiene acceso a ${pantalla}.` };
}

function algunPermiso(ctx: ContextoComando, ...permisos: string[]) {
  return permisos.some((p) => ctx.tienePermiso(p));
}

function nombresDe(opcion: OpcionAbrible) {
  return [normalizarTexto(opcion.texto), ...(SINONIMOS_MENU[opcion.ruta] ?? [])];
}

/** "abrir …": la opción del menú cuyo nombre coincide; si no, la que lo contiene. */
function buscarOpcion(objetivo: string, opciones: OpcionAbrible[]) {
  if (!objetivo) return undefined;
  const exacta = opciones.find((o) => nombresDe(o).includes(objetivo));
  if (exacta) return exacta;
  return opciones
    .map((o) => ({ o, largo: Math.max(0, ...nombresDe(o).filter((n) => objetivo.includes(n)).map((n) => n.length)) }))
    .filter((x) => x.largo >= 4)
    .sort((a, b) => b.largo - a.largo)[0]?.o;
}

function textoBuscado(p: Palabras) {
  return quitarArticulos(p).originales.join(' ').trim();
}

/** Interpreta una frase. Las reglas van de la más específica a la más general. */
export function interpretarComando(texto: string, ctx: ContextoComando): ResultadoComando {
  const completo = quitarInicio(separar(texto), RELLENO_INICIAL);
  const frase = unir(completo);
  if (!frase) return { tipo: 'no-entendido', mensaje: 'No se escuchó ningún comando.' };

  // Ayuda
  if (/^(ayuda|que puedo decir|que digo|que comandos hay|comandos( de voz)?|lista de comandos)$/.test(frase)) {
    return navegar('AYUDA', '/comandos-voz', 'Estos son los comandos que puede decir.');
  }

  // Tema de colores
  if (/\b(modo|tema) oscuro\b/.test(frase)) return { tipo: 'tema', comando: 'TEMA', modo: 'dark', mensaje: 'Modo oscuro activado.' };
  if (/\b(modo|tema) claro\b/.test(frase)) return { tipo: 'tema', comando: 'TEMA', modo: 'light', mensaje: 'Modo claro activado.' };

  // Buscar cliente / producto
  const buscar = prefijo(completo, ['buscar', 'busca', 'buscame', 'encontrar', 'encuentra']);
  if (buscar > 0) {
    // "buscar a la cliente María": se saltan "a la" antes de "cliente".
    const resto = quitarArticulos(cortar(completo, buscar));
    const tipo = resto.normales[0] ?? '';
    const valor = textoBuscado(cortar(resto, 1));
    if (/^(cliente|clientes|clienta|clientas)$/.test(tipo)) {
      if (!ctx.tienePermiso('CLIENTE_CONSULTAR')) return sinPermiso('Clientes');
      return valor
        ? navegar('BUSCAR_CLIENTE', `/clientes?buscar=${encodeURIComponent(valor)}`, `Buscando el cliente "${valor}".`)
        : navegar('BUSCAR_CLIENTE', '/clientes', 'Abriendo Clientes.');
    }
    if (/^(producto|productos|insumo|insumos|articulo|articulos)$/.test(tipo)) {
      if (!algunPermiso(ctx, 'PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR')) return sinPermiso('Productos e insumos');
      return valor
        ? navegar('BUSCAR_PRODUCTO', `/productos?buscar=${encodeURIComponent(valor)}`, `Buscando "${valor}" en productos e insumos.`)
        : navegar('BUSCAR_PRODUCTO', '/productos', 'Abriendo Productos e insumos.');
    }
    return { tipo: 'no-entendido', mensaje: 'Diga "buscar cliente" o "buscar producto" seguido del nombre.' };
  }

  const p = quitarInicio(completo, VERBOS_ABRIR);
  const sinVerbo = unir(p);

  // Stock bajo
  if (/\b(stock bajo|bajo stock|poco stock|stock minimo|inventario bajo|existencias bajas|pocas existencias|por acabarse|por agotarse|que falta reponer|reponer)\b/.test(sinVerbo)) {
    if (!algunPermiso(ctx, 'PRODUCTO_GESTIONAR', 'PRODUCTO_CONSULTAR')) return sinPermiso('Productos e insumos');
    return navegar('STOCK_BAJO', '/productos?filtro=bajo', 'Mostrando los ítems con stock bajo.');
  }

  // Reportes (antes que "citas" o "comisiones" sueltas: "reporte de comisiones")
  if (/^(el |los )?(reporte|reportes|informe) (de |del |sobre )?.+/.test(sinVerbo)) {
    const clave = REPORTES_POR_PALABRA.find(([palabra]) => p.normales.slice(1).some((n) => n.startsWith(palabra)))?.[1];
    if (clave) {
      if (!ctx.tienePermiso('REPORTE_GENERAR')) return sinPermiso('Reportes');
      return navegar('REPORTE', `/reportes?tipo=${clave}&generar=1`, 'Generando el reporte del mes actual.');
    }
  }

  // Agenda de un día o de la semana
  if (/^(la |mi )?agenda\b/.test(sinVerbo)) {
    if (!algunPermiso(ctx, 'AGENDA_CONSULTAR', 'AGENDA_CONSULTAR_PROPIA')) return sinPermiso('la Agenda de Citas');
    const f = fechaAlFinal(p, ctx.hoy);
    if (!f) return navegar('AGENDA', '/agenda', 'Abriendo la agenda de hoy.');
    return navegar('AGENDA', `/agenda?fecha=${f.fecha}&vista=${f.semana ? 'SEMANA' : 'DIA'}`,
      f.semana ? 'Abriendo la agenda de la semana.' : `Abriendo la agenda del ${f.fecha.split('-').reverse().join('/')}.`);
  }

  // Citas de un día (sin día, "mis citas" o "citas" se abren como opción del menú)
  if (/^(las )?citas\b/.test(sinVerbo)) {
    const f = fechaAlFinal(p, ctx.hoy);
    if (f && !f.semana) {
      if (ctx.tienePermiso('AGENDA_CONSULTAR')) {
        return navegar('CITAS', `/citas?fecha=${f.fecha}`, `Abriendo las citas del ${f.fecha.split('-').reverse().join('/')}.`);
      }
      if (ctx.tienePermiso('AGENDA_CONSULTAR_PROPIA')) {
        return navegar('AGENDA', `/agenda?fecha=${f.fecha}&vista=DIA`, 'Abriendo sus citas en la agenda.');
      }
      if (!ctx.tienePermiso('RESERVA_SOLICITAR')) return sinPermiso('Citas');
    }
  }

  // Nueva cita
  if (/^(una )?(nueva cita|registrar (una )?cita|agendar (una )?cita|reservar (una )?cita|sacar (una )?cita|solicitar (una )?cita|agendar|reservar)$/.test(sinVerbo)) {
    if (ctx.tienePermiso('RESERVA_CREAR')) return navegar('NUEVA_CITA', '/citas/nueva', 'Abriendo el registro de una cita.');
    if (ctx.tienePermiso('RESERVA_SOLICITAR')) return navegar('NUEVA_CITA', '/solicitar-cita', 'Abriendo la solicitud de cita.');
    return sinPermiso('el registro de citas');
  }

  // Disponibilidad de un servicio
  const disp = prefijo(p, ['disponibilidad', 'horas libres', 'hora libre', 'horarios libres', 'horario libre', 'horarios disponibles']);
  if (disp > 0) {
    if (!ctx.tienePermiso('RESERVA_CREAR')) return sinPermiso('Disponibilidad');
    const resto = cortar(p, disp);
    const f = fechaAlFinal(resto, ctx.hoy);
    // Lo que queda antes de la fecha es el servicio: "de corte" + "para mañana".
    const antesDeFecha = f ? resto.normales.slice(0, f.inicio) : resto.normales;
    const nombre = antesDeFecha.filter((n) => !ARTICULOS.includes(n)).join(' ');
    const params = new URLSearchParams();
    if (nombre) params.set('servicio', nombre);
    if (f && !f.semana) params.set('fecha', f.fecha);
    const consulta = params.toString();
    return navegar('DISPONIBILIDAD', `/disponibilidad${consulta ? `?${consulta}` : ''}`,
      nombre ? `Buscando horas libres de "${nombre}".` : 'Abriendo Disponibilidad.');
  }

  // Registrar venta
  if (/^(registrar|nueva|hacer|una nueva) (una )?venta$/.test(sinVerbo) || /^(registrar|nueva) venta\b/.test(sinVerbo)) {
    if (!ctx.tienePermiso('VENTA_REGISTRAR')) return sinPermiso('Registrar venta');
    return navegar('REGISTRAR_VENTA', '/ventas/registrar', 'Abriendo el registro de venta.');
  }

  // Comisiones propias
  if (/^(mis |las )?comisiones\b/.test(sinVerbo)) {
    if (!ctx.tienePermiso('COMISION_CONSULTAR_PROPIA')) return sinPermiso('Comisiones');
    return navegar('COMISIONES', '/comisiones', 'Abriendo sus comisiones.');
  }

  // Inicio
  if (/^(al |el )?(inicio|panel principal|pantalla principal|principal)$/.test(sinVerbo) || /^(volver|regresar)( al inicio)?$/.test(frase)) {
    return navegar('INICIO', '/', 'Volviendo al inicio.');
  }

  // Abrir una opción del menú (con o sin verbo: "abrir proveedores" o solo "proveedores")
  const objetivo = unir(quitarArticulos(p));
  const opcion = buscarOpcion(objetivo, ctx.opciones) ?? buscarOpcion(sinVerbo, ctx.opciones);
  if (opcion) {
    return navegar(opcion.ruta === '/' ? 'INICIO' : 'ABRIR', opcion.ruta, `Abriendo ${opcion.texto}.`);
  }

  return { tipo: 'no-entendido', mensaje: `No reconocí "${texto.trim()}". Diga "ayuda" para ver los comandos.` };
}
