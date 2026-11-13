import { D, urlArchivo } from "./datos.js";
import { E } from "./almacen.js";
import { esc } from "./md.js";

export { esc };
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

export function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function aviso(msg, tipo = "ok") {
  const t = document.createElement("div");
  t.className = `toast toast-${tipo}`;
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.classList.add("fuera"), 2600);
  setTimeout(() => t.remove(), 3100);
}

export const nombreArea = (id) => D.areas.get(id)?.nombre ?? id;
export const nombreSub = (id) => {
  const s = D.subareas.get(id);
  return s ? `${s.id} ${s.nombre}` : id;
};

export const FORMATOS = {
  "cuestionamiento-directo": "Cuestionamiento directo",
  completamiento: "Completamiento",
  ordenamiento: "Ordenamiento",
  multirreactivo: "Multirreactivo",
};

export const pct = (a, t) => (t ? Math.round((100 * a) / t) : 0);

// Aproximación orientativa: Ceneval no publica la equivalencia % → ICNE.
export function nivelEstimado(porcentaje) {
  if (porcentaje >= 80) return { nombre: "Sobresaliente", clase: "sobresaliente" };
  if (porcentaje >= 60) return { nombre: "Satisfactorio", clase: "satisfactorio" };
  return { nombre: "Aún no satisfactorio", clase: "insuficiente" };
}

export function barra(porcentaje, etiqueta = "") {
  const n = nivelEstimado(porcentaje);
  return `<div class="barra" role="img" aria-label="${esc(etiqueta)} ${porcentaje}%"><span class="${n.clase}" style="width:${porcentaje}%"></span></div>`;
}

export function fmtTiempo(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  return (h ? `${h}:${String(m).padStart(2, "0")}` : `${m}`) + `:${String(s).padStart(2, "0")}`;
}

/** Recurso con la URL corregida por el usuario (si la hay). */
export function recursoEfectivo(r) {
  const o = E.get().overrides[r.id];
  return o ? { ...r, url: o.url, urlEditada: true } : r;
}

export function enlacesRecurso(r) {
  r = recursoEfectivo(r);
  const enlaces = [];
  if (r.archivo) enlaces.push(`<a class="btn btn-mini" href="${esc(urlArchivo(r.archivo))}" target="_blank" rel="noopener">📄 Abrir del repo</a>`);
  if (r.url) enlaces.push(`<a class="btn btn-mini" href="${esc(r.url)}" target="_blank" rel="noopener">🔗 Abrir enlace${r.urlEditada ? " (editado)" : ""}</a>`);
  if (!r.archivo && !r.url && r.tipo === "libro")
    enlaces.push(
      `<a class="btn btn-mini" href="https://www.google.com/search?tbm=bks&q=${encodeURIComponent(`${r.titulo} ${r.autores ?? ""}`)}" target="_blank" rel="noopener">🔎 Buscar el libro</a>`,
    );
  return enlaces.join(" ");
}

/** Estadísticas de aciertos agrupadas por subárea y área a partir del historial local. */
export function estadisticas() {
  const resp = E.get().respuestas;
  const porSub = {};
  const porArea = {};
  for (const p of D.preguntas) {
    const r = resp[p.id];
    const s = (porSub[p.subarea] ??= { total: 0, vistas: 0, intentos: 0, aciertos: 0 });
    const a = (porArea[p.area] ??= { total: 0, vistas: 0, intentos: 0, aciertos: 0 });
    for (const x of [s, a]) {
      x.total++;
      if (r) {
        x.vistas++;
        x.intentos += r.intentos;
        x.aciertos += r.aciertos;
      }
    }
  }
  return { porSub, porArea };
}
