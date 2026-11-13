// Análisis del avance: diagnóstico al terminar una sesión, dominio por subárea,
// conceptos débiles, series para gráficas y nivel global estimado (modelo Ceneval).
import { D, guiaDe, urlArchivo } from "./datos.js";
import { E } from "./almacen.js";
import { esc, pct, nivelEstimado, nombreSub, nombreArea, recursoEfectivo } from "./ui.js";

const DIA = 86400000;

// ---------------- Dominio por subárea ----------------

/** Últimas n respuestas de cada pregunta agrupadas por subárea (lo reciente pesa más que lo antiguo). */
export function dominioSubareas(n = 12) {
  const porSub = {};
  const hist = E.get().historial;
  for (let i = hist.length - 1; i >= 0; i--) {
    const h = hist[i];
    const p = D.porId.get(h.id);
    if (!p) continue;
    const s = (porSub[p.subarea] ??= { recientes: [], vistas: new Set() });
    s.vistas.add(h.id);
    if (s.recientes.length < n) s.recientes.push(h.ok);
  }
  const lt = E.get().leitner;
  const ahora = Date.now();
  const res = {};
  for (const sub of D.subareas.values()) {
    const s = porSub[sub.id];
    const total = D.preguntas.filter((p) => p.subarea === sub.id).length;
    const aciertos = s ? s.recientes.filter(Boolean).length : 0;
    const intentos = s?.recientes.length ?? 0;
    const p = pct(aciertos, intentos);
    const pendientes = D.preguntas.filter((q) => q.subarea === sub.id && lt[q.id] && lt[q.id].prox <= ahora).length;
    let estado;
    if (!intentos) estado = { id: "nuevo", nombre: "Sin empezar", icono: "○" };
    else if (p < 60) estado = { id: "aprendiendo", nombre: "Reforzar", icono: "▲" };
    else if (p < 80 || intentos < 5) estado = { id: "progreso", nombre: "En progreso", icono: "◐" };
    else estado = { id: "dominada", nombre: "Dominada", icono: "✔" };
    res[sub.id] = { ...sub, intentos, aciertos, p, vistas: s?.vistas.size ?? 0, total, pendientes, estado };
  }
  return res;
}

/** Conceptos con peor tasa de acierto (al menos 2 intentos). */
export function conceptosDebiles(limite = 12) {
  const c = {};
  for (const h of E.get().historial) {
    const p = D.porId.get(h.id);
    for (const k of p?.conceptos ?? []) {
      const x = (c[k] ??= { concepto: k, t: 0, a: 0, subareas: new Set() });
      x.t++;
      if (h.ok) x.a++;
      x.subareas.add(p.subarea);
    }
  }
  return Object.values(c)
    .filter((x) => x.t >= 2 && x.a / x.t < 0.8)
    .sort((x, y) => x.a / x.t - y.a / y.t || y.t - x.t)
    .slice(0, limite)
    .map((x) => ({ ...x, p: pct(x.a, x.t), subareas: [...x.subareas] }));
}

// ---------------- Series para gráficas ----------------

export function serieSesiones() {
  return E.get()
    .simulacros.filter((s) => s.tipo !== "comandos" && s.total)
    .slice()
    .reverse()
    .map((s, i) => ({ i: i + 1, fecha: new Date(s.fecha), p: pct(s.aciertos, s.total), etiqueta: s.modo, total: s.total, aciertos: s.aciertos }));
}

export function actividadDiaria(dias = 30) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const cubetas = Array.from({ length: dias }, (_, k) => ({ fecha: new Date(hoy - (dias - 1 - k) * DIA), n: 0, ok: 0 }));
  const inicio = cubetas[0].fecha.getTime();
  for (const h of E.get().historial) {
    if (h.t < inicio) continue;
    const k = Math.floor((h.t - inicio) / DIA);
    if (cubetas[k]) {
      cubetas[k].n++;
      if (h.ok) cubetas[k].ok++;
    }
  }
  return cubetas;
}

/** % de aciertos por área en tus primeras N respuestas vs. tus últimas N. */
export function antesAhoraPorArea(n = 20) {
  const porArea = {};
  for (const h of E.get().historial) {
    const p = D.porId.get(h.id);
    if (p) (porArea[p.area] ??= []).push(h.ok);
  }
  return Object.entries(porArea)
    .filter(([, v]) => v.length >= 4)
    .map(([area, v]) => {
      const m = Math.min(n, Math.floor(v.length / 2));
      const prom = (arr) => pct(arr.filter(Boolean).length, arr.length);
      return { area, nombre: nombreArea(area), antes: prom(v.slice(0, m)), ahora: prom(v.slice(-m)), n: m };
    });
}

export function racha() {
  const dias = new Set(E.get().historial.map((h) => new Date(h.t).toDateString()));
  let r = 0;
  const d = new Date();
  if (!dias.has(d.toDateString())) d.setDate(d.getDate() - 1); // la racha sigue viva si estudiaste ayer
  while (dias.has(d.toDateString())) {
    r++;
    d.setDate(d.getDate() - 1);
  }
  return r;
}

// ---------------- Niveles (modelo Ceneval, estimación) ----------------

/** Modelo compensatorio: % de la sección ponderado por los reactivos de cada área. */
export function porcentajeSeccion(porArea, seccionId) {
  const sec = D.secciones.find((s) => s.id === seccionId);
  let peso = 0;
  let suma = 0;
  for (const a of sec.areas) {
    const v = porArea[a.id];
    if (!v?.t) continue;
    const w = a.subareas.reduce((s, x) => s + x.reactivos, 0);
    suma += w * (v.a / v.t);
    peso += w;
  }
  return peso ? Math.round((100 * suma) / peso) : null;
}

/** Modelo conjuntivo de la guía (tabla 5.1.3). */
export function nivelGlobal(nivelDis, nivelLyc) {
  const fila = D.temario.formato.reglaGlobal.tabla.find(([d, l]) => d === nivelDis && l === nivelLyc);
  return fila?.[2] ?? null;
}

/** Nivel proyectado con tu dominio reciente, ponderando cada subárea por su peso en el examen. */
export function proyeccion() {
  const dom = dominioSubareas();
  const resultado = {};
  for (const sec of D.secciones) {
    let peso = 0;
    let suma = 0;
    let cubiertos = 0;
    for (const a of sec.areas)
      for (const s of a.subareas) {
        peso += s.reactivos;
        if (dom[s.id].intentos) {
          suma += s.reactivos * (dom[s.id].aciertos / dom[s.id].intentos);
          cubiertos += s.reactivos;
        }
      }
    resultado[sec.id] = cubiertos ? { p: Math.round((100 * suma) / cubiertos), cobertura: pct(cubiertos, peso) } : null;
  }
  return resultado;
}

// ---------------- Diagnóstico al terminar una sesión ----------------

/**
 * @param items [{ p, elegida, ok }]
 * @param modo  etiqueta de la sesión (para compararla con la anterior del mismo tipo)
 */
export function htmlDiagnostico(items, modo) {
  const fallas = items.filter((x) => !x.ok);
  const total = items.length;
  const porc = pct(total - fallas.length, total);

  // Comparación con la sesión anterior del mismo modo (la actual ya está guardada en [0]).
  const previas = E.get().simulacros.filter((s) => s.modo === modo);
  const anterior = previas[1];
  const delta = anterior ? porc - pct(anterior.aciertos, anterior.total) : null;

  // Subáreas a reforzar
  const subs = {};
  for (const x of items) {
    const s = (subs[x.p.subarea] ??= { t: 0, f: 0 });
    s.t++;
    if (!x.ok) s.f++;
  }
  const reforzar = Object.entries(subs)
    .filter(([, v]) => v.f)
    .map(([id, v]) => ({ id, ...v, p: pct(v.t - v.f, v.t), peso: D.subareas.get(id)?.reactivos ?? 0 }))
    .sort((a, b) => b.f * b.peso - a.f * a.peso);

  // Conceptos fallados
  const conceptos = {};
  for (const x of fallas) for (const c of x.p.conceptos ?? []) conceptos[c] = (conceptos[c] ?? 0) + 1;
  const listaConceptos = Object.entries(conceptos).sort((a, b) => b[1] - a[1]).slice(0, 14);

  // Lecturas: fuentes de las preguntas falladas, sin duplicados
  const lecturas = new Map();
  for (const x of fallas)
    for (const f of x.p.fuentes ?? []) {
      const r = D.recursosPorId.get(f.recurso);
      if (!r) continue;
      const l = lecturas.get(r.id) ?? { r, detalles: new Set(), n: 0 };
      l.n++;
      if (f.detalle) l.detalles.add(f.detalle);
      lecturas.set(r.id, l);
    }
  const topLecturas = [...lecturas.values()].sort((a, b) => b.n - a.n || (a.r.prioridad ?? 9) - (b.r.prioridad ?? 9)).slice(0, 6);
  const pendientesHoy = E.pendientesRepaso().length;

  let consejo;
  if (!fallas.length) consejo = "¡Sesión perfecta! Sube la dificultad: prueba un simulacro cronometrado o solo preguntas de nivel sobresaliente.";
  else if (porc < 60) consejo = `Antes de otro simulacro, lee la guía de ${esc(nombreSub(reforzar[0].id))} y practica esa subárea en modo guiado leyendo las explicaciones de las 3 opciones.`;
  else if (porc < 80) consejo = `Vas bien. Concéntrate en ${reforzar.slice(0, 2).map((r) => esc(nombreSub(r.id))).join(" y ")}, y mañana haz tu repaso programado.`;
  else consejo = "Estás en zona de sobresaliente. Mantén el ritmo con repasos programados y simulacros completos con tiempo real.";

  return `<section class="tarjeta diagnostico" aria-labelledby="diag-titulo">
    <h2 id="diag-titulo">🩺 Diagnóstico de esta sesión</h2>
    <p class="consejo">${consejo}</p>
    ${delta !== null ? `<p>Comparado con tu sesión anterior de «${esc(modo)}»: <strong class="${delta >= 0 ? "sube" : "baja"}">${delta >= 0 ? "▲ +" : "▼ "}${delta} puntos</strong>.</p>` : ""}
    <div class="rejilla-2">
      ${reforzar.length ? `<div><h3>Temas a reforzar</h3><ol class="lista-reforzar">${reforzar
        .slice(0, 6)
        .map(
          (r) => `<li><strong>${esc(nombreSub(r.id))}</strong> — fallaste ${r.f} de ${r.t} · vale ${r.peso} reactivos<br>
          ${guiaDe(r.id) ? `<a class="btn btn-mini" href="#/guias/${encodeURIComponent(r.id)}">Guía</a>` : ""}
          <a class="btn btn-mini" href="#/practica?subarea=${encodeURIComponent(r.id)}&iniciar=1&n=10">Practicar</a></li>`,
        )
        .join("")}</ol></div>` : ""}
      ${listaConceptos.length ? `<div><h3>Conceptos que fallaste</h3><p>${listaConceptos.map(([c, n]) => `<span class="chip">${esc(c)}${n > 1 ? ` ×${n}` : ""}</span>`).join(" ")}</p>
        ${topLecturas.length ? `<h3>Qué leer</h3><ul class="fuentes">${topLecturas
          .map(({ r, detalles }) => {
            const re = recursoEfectivo(r);
            const url = re.archivo ? urlArchivo(re.archivo) : re.url;
            const t = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(r.titulo)}</a>` : `<a href="#/biblioteca?id=${encodeURIComponent(r.id)}">${esc(r.titulo)}</a>`;
            return `<li>${t}${detalles.size ? ` <span class="tenue">(${esc([...detalles].join("; "))})</span>` : ""}</li>`;
          })
          .join("")}</ul>` : ""}</div>` : ""}
    </div>
    <p class="acciones">
      ${fallas.length ? `<a class="btn btn-primario" href="#/practica?filtro=falladas&iniciar=1&n=${Math.min(20, fallas.length)}">Repasar ahora mis ${fallas.length} errores</a>` : ""}
      <a class="btn" href="#/practica?filtro=repaso&iniciar=1&n=20">Repaso programado${pendientesHoy ? ` (${pendientesHoy} hoy)` : ""}</a>
      <a class="btn" href="#/seguimiento">Ver mi seguimiento</a></p>
    <p class="tenue">Las preguntas que fallaste vuelven mañana a tu repaso programado; las que aciertas se espacian cada vez más (1, 3, 7, 14 y 30 días).</p>
  </section>`;
}

/** Tarjeta de niveles por sección y global con la regla conjuntiva. */
export function htmlNiveles(porArea) {
  const pd = porcentajeSeccion(porArea, "DIS");
  const pl = porcentajeSeccion(porArea, "LYC");
  const nd = pd !== null ? nivelEstimado(pd) : null;
  const nl = pl !== null ? nivelEstimado(pl) : null;
  const global = nd && nl ? nivelGlobal(nd.nombre, nl.nombre) : null;
  const premio = nd?.nombre === "Sobresaliente" && nl && nl.nombre !== "Aún no satisfactorio";
  const CLASE = { Sobresaliente: "sobresaliente", Satisfactorio: "satisfactorio", "Aún no satisfactorio": "insuficiente" };
  const chip = (n) => (n ? `<span class="chip nivel ${CLASE[n]}">${esc(n)}</span>` : "—");
  return `<div class="tarjeta"><h2>Resultado estimado por sección</h2>
    <table class="tabla-datos"><tbody>
      <tr><th>Disciplinar (compensatorio)</th><td>${pd ?? "—"}${pd !== null ? "%" : ""}</td><td>${chip(nd?.nombre)}</td></tr>
      <tr><th>Lenguaje y Comunicación</th><td>${pl ?? "—"}${pl !== null ? "%" : ""}</td><td>${chip(nl?.nombre)}</td></tr>
      <tr><th>Global (conjuntivo)</th><td></td><td>${global ? chip(global) : "<span class='tenue'>Se requiere responder ambas secciones</span>"}${premio ? " 🏅 candidato al Premio Ceneval*" : ""}</td></tr>
    </tbody></table>
    <p class="tenue">Cada área se pondera por su número de reactivos y el global sigue la tabla 5.1.3 de la guía. *El premio exige además presentar por primera vez y tener máximo un año de egreso. Estimación orientativa: Ceneval usa el Índice Ceneval (700–1300).</p></div>`;
}
