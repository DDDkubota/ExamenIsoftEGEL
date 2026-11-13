// Persistencia local: progreso (localStorage) y PDFs personales (IndexedDB).
// Nada sale del navegador del usuario salvo que él lo exporte.

const CLAVE = "egel-isoft.v1";
const DIA = 86400000;
// Repaso espaciado (sistema Leitner): días hasta el siguiente repaso según la caja.
export const INTERVALOS_LEITNER = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const MAX_HISTORIAL = 20000;

const inicial = () => ({
  respuestas: {}, // id → { intentos, aciertos, ultima, fecha }
  historial: [], // [{ id, ok, t, m }] cada respuesta, en orden (m = modo)
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

let estado = cargar();

function cargar() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE));
    return g ? { ...inicial(), ...g, ajustes: { ...inicial().ajustes, ...g.ajustes } } : inicial();
  } catch {
    return inicial();
  }
}
function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    // Cuota llena: recorta el historial más antiguo y reintenta una vez.
    estado.historial = estado.historial.slice(-5000);
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  }
}

export const E = {
  get: () => estado,

  registrar(id, acierto, modo = "practica") {
    const ahora = Date.now();
    const r = (estado.respuestas[id] ??= { intentos: 0, aciertos: 0 });
    r.intentos++;
    if (acierto) r.aciertos++;
    r.ultima = acierto;
    r.fecha = new Date(ahora).toISOString();
    estado.historial.push({ id, ok: acierto, t: ahora, m: modo });
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

  exportar: () => JSON.stringify(estado, null, 2),
  importar(txt) {
    const datos = JSON.parse(txt);
    if (typeof datos !== "object" || !datos.respuestas) throw new Error("Archivo no reconocido");
    estado = { ...inicial(), ...datos, ajustes: { ...inicial().ajustes, ...datos.ajustes } };
    guardar();
  },
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
