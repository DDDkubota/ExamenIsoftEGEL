// Persistencia local: progreso (localStorage, comprimido) y PDFs personales (IndexedDB).
// Nada sale del navegador del usuario salvo que él lo exporte.
//
// Formato v2: el estado se guarda como JSON compacto (historial en columnas numéricas con
// tiempos delta) comprimido con LZ a UTF-16. Ocupa ~10-20 veces menos que el JSON v1, lo que
// permite guardar mucho más historial (tiempo por pregunta, opción elegida, etc.).
import { comprimirUTF16, descomprimirUTF16 } from "./lz.js";

const CLAVE = "egel-isoft.v2";
const CLAVE_V1 = "egel-isoft.v1";
const CABECERA_EXPORT = "EGEL-ISOFT/2\n";
const DIA = 86400000;
// Repaso espaciado (sistema Leitner): días hasta el siguiente repaso según la caja.
export const INTERVALOS_LEITNER = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const MAX_HISTORIAL = 100000;
const MODOS = ["practica", "simulacro", "examen", "comandos"];

const inicial = () => ({
  respuestas: {}, // id → { intentos, aciertos, ultima, fecha }
  historial: [], // [{ id, ok, t, m, e, s }] cada respuesta: modo, opción elegida (e) y segundos (s)
  leitner: {}, // id → { caja: 1..5, prox: epoch ms }
  simulacros: [], // sesiones: práctica, simulacros, examen, quiz de comandos
  enCurso: null, // simulacro pausado o interrumpido (para reanudar)
  examenCompleto: null, // intento del examen completo por sesiones
  recursosUsuario: [],
  overrides: {}, // recursoId → { url }
  marcadas: [],
  comandosUsuario: [], // [{ id, rama, comando, descripcion, ejemplo }]
  ajustes: { barajar: true, fechaExamen: "", horasSemana: 8 },
});

// ---------- Codificación compacta ----------

function codificar(st) {
  const ids = [];
  const indice = new Map();
  const h = [];
  let anterior = 0;
  for (const x of st.historial) {
    if (!indice.has(x.id)) {
      indice.set(x.id, ids.length);
      ids.push(x.id);
    }
    const t = Math.floor(x.t / 1000);
    const m = MODOS.indexOf(x.m);
    // [id, ok, Δt (s), modo, elegida + 1, segundos]
    h.push(indice.get(x.id), x.ok ? 1 : 0, t - anterior, m < 0 ? 0 : m, (x.e ?? -1) + 1, x.s ?? 0);
    anterior = t;
  }
  const { historial, ...resto } = st;
  return { v: 2, ids, h, ...resto };
}

function decodificar(c) {
  const historial = [];
  let t = 0;
  for (let i = 0; i < c.h.length; i += 6) {
    t += c.h[i + 2];
    historial.push({ id: c.ids[c.h[i]], ok: c.h[i + 1] === 1, t: t * 1000, m: MODOS[c.h[i + 3]] ?? "practica", e: c.h[i + 4] - 1, s: c.h[i + 5] });
  }
  const { v, ids, h, ...resto } = c;
  return { ...resto, historial };
}

const normalizar = (g) => ({
  ...inicial(),
  ...g,
  historial: (g.historial ?? []).map((x) => ({ ...x, t: Math.floor(x.t / 1000) * 1000, e: x.e ?? -1, s: x.s ?? 0 })),
  ajustes: { ...inicial().ajustes, ...g.ajustes },
});

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return normalizar(decodificar(JSON.parse(descomprimirUTF16(crudo))));
    // Migración desde v1 (JSON sin comprimir)
    const v1 = localStorage.getItem(CLAVE_V1);
    if (v1) {
      const st = normalizar(JSON.parse(v1));
      localStorage.setItem(CLAVE, comprimirUTF16(JSON.stringify(codificar(st))));
      localStorage.removeItem(CLAVE_V1);
      return st;
    }
  } catch (e) {
    console.error("No se pudo leer el progreso guardado", e);
  }
  return inicial();
}

let estado = cargar();
let pendiente = null;
export const metricas = { comprimido: 0, original: 0 };

function escribirYa() {
  clearTimeout(pendiente);
  pendiente = null;
  const json = JSON.stringify(codificar(estado));
  let datos = comprimirUTF16(json);
  try {
    localStorage.setItem(CLAVE, datos);
  } catch {
    // Sin espacio: conserva la mitad más reciente del historial y reintenta.
    estado.historial = estado.historial.slice(-Math.floor(estado.historial.length / 2));
    datos = comprimirUTF16(JSON.stringify(codificar(estado)));
    localStorage.setItem(CLAVE, datos);
  }
  metricas.comprimido = datos.length;
  metricas.original = json.length;
}
/** Guardado diferido: agrupa ráfagas de cambios y no bloquea al responder. */
function guardar() {
  if (!pendiente) pendiente = setTimeout(escribirYa, 1200);
}
// Al ocultar o cerrar la pestaña se guarda de inmediato (la compresión es síncrona).
addEventListener("visibilitychange", () => document.visibilityState === "hidden" && pendiente && escribirYa());
addEventListener("pagehide", () => pendiente && escribirYa());

/** Bytes que ocupa el progreso en localStorage (UTF-16: 2 bytes por carácter). */
export function usoAlmacenamiento() {
  if (!metricas.comprimido) {
    const crudo = localStorage.getItem(CLAVE) ?? "";
    metricas.comprimido = crudo.length;
    metricas.original = JSON.stringify(estado).length;
  }
  return { bytes: metricas.comprimido * 2, sinComprimir: metricas.original * 2 };
}

export const E = {
  get: () => estado,

  registrar(id, acierto, modo = "practica", elegida = -1, segundos = 0) {
    const ahora = Date.now();
    const r = (estado.respuestas[id] ??= { intentos: 0, aciertos: 0 });
    r.intentos++;
    if (acierto) r.aciertos++;
    r.ultima = acierto;
    r.fecha = new Date(ahora).toISOString();
    estado.historial.push({ id, ok: acierto, t: ahora, m: modo, e: elegida ?? -1, s: Math.min(3600, Math.round(segundos)) });
    if (estado.historial.length > MAX_HISTORIAL) estado.historial.splice(0, estado.historial.length - MAX_HISTORIAL);
    const l = estado.leitner[id] ?? { caja: 0 };
    l.caja = acierto ? Math.min(5, l.caja + 1) : 1;
    l.prox = ahora + INTERVALOS_LEITNER[l.caja] * DIA;
    estado.leitner[id] = l;
    guardar();
  },
  pendientesRepaso(ahora = Date.now()) {
    return Object.entries(estado.leitner)
      .filter(([, l]) => l.prox <= ahora)
      .map(([id]) => id);
  },

  agregarSimulacro(s) {
    estado.simulacros.unshift(s);
    estado.simulacros = estado.simulacros.slice(0, 300);
    guardar();
  },

  guardarEnCurso(snapshot) {
    estado.enCurso = snapshot;
    guardar();
  },
  limpiarEnCurso() {
    estado.enCurso = null;
    guardar();
  },
  examen(cambio) {
    if (cambio !== undefined) {
      estado.examenCompleto = cambio;
      guardar();
    }
    return estado.examenCompleto;
  },

  alternarMarca(id) {
    const i = estado.marcadas.indexOf(id);
    i >= 0 ? estado.marcadas.splice(i, 1) : estado.marcadas.push(id);
    guardar();
    return i < 0;
  },
  ajustes(cambios) {
    Object.assign(estado.ajustes, cambios);
    guardar();
  },
  agregarRecurso(r) {
    estado.recursosUsuario.push({ ...r, id: r.id ?? `mio-${Date.now().toString(36)}` });
    guardar();
  },
  actualizarRecurso(id, cambios) {
    const r = estado.recursosUsuario.find((x) => x.id === id);
    if (r) Object.assign(r, cambios);
    guardar();
  },
  eliminarRecurso(id) {
    estado.recursosUsuario = estado.recursosUsuario.filter((r) => r.id !== id);
    guardar();
  },
  sobrescribirUrl(id, url) {
    if (url) estado.overrides[id] = { url };
    else delete estado.overrides[id];
    guardar();
  },
  agregarComando(c) {
    estado.comandosUsuario.push({ ...c, id: `cmd-${Date.now().toString(36)}` });
    guardar();
  },
  eliminarComando(id) {
    estado.comandosUsuario = estado.comandosUsuario.filter((c) => c.id !== id);
    guardar();
  },

  /** Respaldo comprimido (no está pensado para leerse a mano). */
  exportar: () => CABECERA_EXPORT + comprimirUTF16(JSON.stringify(codificar(estado))),
  importar(txt) {
    let datos;
    if (txt.startsWith(CABECERA_EXPORT)) datos = decodificar(JSON.parse(descomprimirUTF16(txt.slice(CABECERA_EXPORT.length))));
    else datos = JSON.parse(txt); // respaldos v1 en JSON
    if (typeof datos !== "object" || !datos.respuestas) throw new Error("Archivo no reconocido");
    estado = normalizar(datos);
    escribirYa();
  },
  guardarYa: () => escribirYa(),
  reiniciarProgreso() {
    Object.assign(estado, { respuestas: {}, historial: [], leitner: {}, simulacros: [], marcadas: [], enCurso: null, examenCompleto: null });
    guardar();
  },
};

// ---------- PDFs personales en IndexedDB ----------
const DB = "egel-isoft-pdfs";
function abrir() {
  return new Promise((ok, mal) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("pdfs", { keyPath: "id" });
    req.onsuccess = () => ok(req.result);
    req.onerror = () => mal(req.error);
  });
}
async function tx(modo, fn) {
  const db = await abrir();
  return new Promise((ok, mal) => {
    const t = db.transaction("pdfs", modo);
    const res = fn(t.objectStore("pdfs"));
    t.oncomplete = () => ok(res?.result ?? res);
    t.onerror = () => mal(t.error);
  });
}

export const PDFs = {
  guardar: (archivo) => {
    const id = `pdf-${Date.now().toString(36)}`;
    return tx("readwrite", (s) => s.put({ id, nombre: archivo.name, tam: archivo.size, fecha: new Date().toISOString(), blob: archivo })).then(() => id);
  },
  listar: () => tx("readonly", (s) => s.getAll()),
  obtener: (id) => tx("readonly", (s) => s.get(id)),
  eliminar: (id) => tx("readwrite", (s) => s.delete(id)),
};
