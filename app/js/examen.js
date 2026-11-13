// Motor de reactivos: Práctica (retroalimentación inmediata), Simulacro (cronometrado, reanudable)
// y Examen completo por sesiones con la distribución y los tiempos reales de Ceneval.
import { D, preguntasDe, guiaDe, urlArchivo } from "./datos.js";
import { E } from "./almacen.js";
import { $, $$, esc, barajar, aviso, nombreArea, nombreSub, FORMATOS, pct, nivelEstimado, barra, fmtTiempo, recursoEfectivo } from "./ui.js";
import { htmlDiagnostico, htmlNiveles } from "./analisis.js";

const LETRAS = ["A", "B", "C", "D", "E"];

// ---------------- Selección de preguntas ----------------

/** Ordena como en el examen: por área; los multirreactivos de un mismo estímulo quedan juntos y en orden. */
function ordenarComoExamen(lista) {
  const grupos = new Map();
  for (const p of barajar(lista)) {
    const clave = p.estimulo ? `E:${p.estimulo}` : `P:${p.id}`;
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(p);
  }
  const ordenAreas = [...D.areas.keys()];
  return [...grupos.values()]
    .map((g) => g.sort((a, b) => a.id.localeCompare(b.id)))
    .sort((a, b) => ordenAreas.indexOf(a[0].area) - ordenAreas.indexOf(b[0].area))
    .flat();
}

/** Muestra proporcional al peso de cada subárea en el examen real. */
function muestraProporcional(pool, n) {
  if (pool.length <= n) return pool;
  const porSub = Object.groupBy ? Object.groupBy(pool, (p) => p.subarea) : pool.reduce((m, p) => ((m[p.subarea] ??= []).push(p), m), {});
  const pesoTotal = Object.keys(porSub).reduce((s, id) => s + (D.subareas.get(id)?.reactivos ?? 1), 0);
  let elegidas = [];
  for (const [id, ps] of Object.entries(porSub)) {
    const cuota = Math.max(1, Math.round((n * (D.subareas.get(id)?.reactivos ?? 1)) / pesoTotal));
    elegidas.push(...barajar(ps).slice(0, cuota));
  }
  elegidas = barajar(elegidas);
  if (elegidas.length > n) elegidas = elegidas.slice(0, n);
  if (elegidas.length < n) elegidas.push(...barajar(pool.filter((p) => !elegidas.includes(p))).slice(0, n - elegidas.length));
  // Si un multirreactivo entró, trae a sus hermanos para no dejar el estímulo incompleto.
  const estimulos = new Set(elegidas.filter((p) => p.estimulo).map((p) => p.estimulo));
  for (const p of pool) if (p.estimulo && estimulos.has(p.estimulo) && !elegidas.includes(p)) elegidas.push(p);
  return elegidas;
}

/** Exactamente los reactivos de cada subárea del examen real (o todos los disponibles si hay menos). */
function muestraExacta(seccion) {
  const elegidas = [];
  for (const s of D.subareas.values()) {
    if (s.seccion !== seccion) continue;
    elegidas.push(...barajar(preguntasDe({ subarea: s.id })).slice(0, s.reactivos));
  }
  const estimulos = new Set(elegidas.filter((p) => p.estimulo).map((p) => p.estimulo));
  for (const p of preguntasDe({ seccion })) if (p.estimulo && estimulos.has(p.estimulo) && !elegidas.includes(p)) elegidas.push(p);
  return elegidas;
}

function filtrar(params) {
  const resp = E.get().respuestas;
  let pool = preguntasDe({ seccion: params.seccion, area: params.area, subarea: params.subarea, banco: params.banco });
  if (params.filtro === "repaso") {
    const pend = new Set(E.pendientesRepaso());
    pool = pool.filter((p) => pend.has(p.id));
  }
  if (params.nivel) pool = pool.filter((p) => p.nivel === params.nivel);
  if (params.filtro === "nuevas") pool = pool.filter((p) => !resp[p.id]);
  if (params.filtro === "falladas") pool = pool.filter((p) => resp[p.id] && resp[p.id].ultima === false);
  if (params.filtro === "marcadas") pool = pool.filter((p) => E.get().marcadas.includes(p.id));
  return pool;
}

// ---------------- Render de un reactivo ----------------

function htmlFuentes(p) {
  return (p.fuentes ?? [])
    .map((f) => {
      const r = D.recursosPorId.get(f.recurso);
      if (!r) return "";
      const re = recursoEfectivo(r);
      const enlace = re.archivo ? urlArchivo(re.archivo) : re.url;
      const titulo = enlace
        ? `<a href="${esc(enlace)}" target="_blank" rel="noopener">${esc(r.titulo)}</a>`
        : `<a href="#/biblioteca?id=${encodeURIComponent(r.id)}">${esc(r.titulo)}</a>`;
      return `<li>${titulo}${r.autores ? ` — ${esc(r.autores)}` : ""}${f.detalle ? ` <span class="tenue">(${esc(f.detalle)})</span>` : ""}</li>`;
    })
    .join("");
}

/**
 * @param p pregunta
 * @param orden permutación de índices de opciones a mostrar
 * @param elegida índice ORIGINAL elegido (o null)
 * @param revelar si se muestran correcta y explicaciones
 */
export function htmlReactivo(p, { orden, elegida = null, revelar = false, numero = null, total = null }) {
  const est = p.estimulo ? D.estimulos.get(p.estimulo) : null;
  const marcada = E.get().marcadas.includes(p.id);
  const guia = guiaDe(p.subarea);
  const opciones = orden
    .map((iOrig, iVis) => {
      const o = p.opciones[iOrig];
      const clases = ["opcion"];
      if (elegida === iOrig) clases.push("elegida");
      if (revelar && iOrig === p.correcta) clases.push("correcta");
      if (revelar && elegida === iOrig && iOrig !== p.correcta) clases.push("incorrecta");
      return `<button type="button" class="${clases.join(" ")}" data-opcion="${iOrig}" ${revelar ? "disabled" : ""} aria-pressed="${elegida === iOrig}">
        <span class="letra">${LETRAS[iVis]})</span><span class="texto">${esc(o.texto)}</span></button>`;
    })
    .join("");

  const retro = revelar
    ? `<section class="retro ${elegida === p.correcta ? "ok" : elegida === null ? "" : "mal"}" aria-live="polite">
        <h3>${elegida === null ? "Respuesta correcta" : elegida === p.correcta ? "✔ ¡Correcto!" : "✘ Incorrecto"}: ${LETRAS[orden.indexOf(p.correcta)]}) ${esc(p.opciones[p.correcta].texto)}</h3>
        <ol class="explicaciones">${orden
          .map((iOrig, iVis) => `<li class="${iOrig === p.correcta ? "es-correcta" : ""}"><strong>${LETRAS[iVis]})</strong> ${esc(p.opciones[iOrig].explicacion)}</li>`)
          .join("")}</ol>
        ${p.estrategia ? `<div class="estrategia"><strong>🧭 Cómo razonarla:</strong> ${esc(p.estrategia)}</div>` : ""}
        ${p.conceptos?.length ? `<p class="conceptos">${p.conceptos.map((c) => `<span class="chip">${esc(c)}</span>`).join(" ")}</p>` : ""}
        ${p.fuentes?.length ? `<details open><summary>📚 Fuentes para estudiar</summary><ul class="fuentes">${htmlFuentes(p)}</ul></details>` : ""}
        ${guia ? `<p><a href="#/guias/${encodeURIComponent(p.subarea)}">📖 Ver la guía de ${esc(nombreSub(p.subarea))}</a></p>` : ""}
      </section>`
    : "";

  return `<article class="reactivo area-${esc(p.area)}" data-id="${esc(p.id)}">
    <header class="meta">
      ${numero ? `<span class="num">Pregunta ${numero}${total ? ` de ${total}` : ""}</span>` : ""}
      <span class="chip area-${esc(p.area)}">${esc(nombreArea(p.area))}</span>
      <span class="chip">${esc(nombreSub(p.subarea))}</span>
      <span class="chip tenue">${esc(FORMATOS[p.formato] ?? p.formato)}</span>
      ${p.nivel ? `<span class="chip nivel-${esc(p.nivel)}">${p.nivel === "sobresaliente" ? "Nivel sobresaliente" : "Nivel satisfactorio"}</span>` : ""}
      <button type="button" class="btn-marca" data-marca aria-pressed="${marcada}" title="Guardar para repasar">${marcada ? "★" : "☆"}</button>
    </header>
    ${est ? `<details class="estimulo" open><summary>${esc(est.titulo)}${est.nota ? ` <span class="tenue">— ${esc(est.nota)}</span>` : ""}</summary><div class="texto-estimulo">${esc(est.texto)}</div></details>` : ""}
    <p class="base">${esc(p.base)}</p>
    ${p.codigo ? `<pre class="codigo"><code>${esc(p.codigo)}</code></pre>` : ""}
    ${p.lista ? `<ul class="lista-orden">${p.lista.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
    <p class="pregunta">${esc(p.pregunta)}</p>
    <div class="opciones" role="group" aria-label="Opciones de respuesta">${opciones}</div>
    ${retro}
    <p class="tenue id-reactivo">${esc(p.id)} · <a href="${esc(D.manifest.repositorio)}/issues/new?title=${encodeURIComponent(`[Pregunta ${p.id}] `)}&body=${encodeURIComponent(`Pregunta: ${p.id}\n\nProblema o sugerencia:\n`)}" target="_blank" rel="noopener">Reportar un error en esta pregunta</a></p>
  </article>`;
}

function enlazarMarca(raiz) {
  $$("[data-marca]", raiz).forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.closest(".reactivo").dataset.id;
      const ahora = E.alternarMarca(id);
      b.textContent = ahora ? "★" : "☆";
      b.setAttribute("aria-pressed", ahora);
      aviso(ahora ? "Guardada para repasar" : "Quitada de repaso");
    }),
  );
}

const ordenOpciones = (p) => (E.get().ajustes.barajar ? barajar(p.opciones.map((_, i) => i)) : p.opciones.map((_, i) => i));

// ---------------- Formulario de configuración común ----------------

const NOMBRE_BANCO = { base: "Base (demo)", extendido: "Extendido" };

function selectorAlcance(params, { conNivel = true, conFiltro = true, conBanco = true } = {}) {
  const areas = [...D.areas.values()];
  const sel = (v, actual) => (v === actual ? "selected" : "");
  return `
    <label>Área
      <select name="area"><option value="">Todas</option>
        ${D.secciones.map((s) => `<optgroup label="Sección ${esc(s.nombre)}">${s.areas.map((a) => `<option value="${a.id}" ${sel(a.id, params.area)}>${esc(a.nombre)}</option>`).join("")}</optgroup>`).join("")}
      </select></label>
    <label>Subárea
      <select name="subarea"><option value="">Todas</option>
        ${areas.map((a) => a.subareas.map((s) => `<option value="${s.id}" data-area="${a.id}" ${sel(s.id, params.subarea)}>${esc(s.id)} ${esc(s.nombre)}</option>`).join("")).join("")}
      </select></label>
    ${conBanco && D.bancos.length > 1 ? `<label>Banco<select name="banco"><option value="">Todos</option>${D.bancos.map((b) => `<option value="${b}" ${sel(b, params.banco)}>${esc(NOMBRE_BANCO[b] ?? b)}</option>`).join("")}</select></label>` : ""}
    ${conNivel ? `<label>Nivel<select name="nivel"><option value="">Ambos</option><option value="satisfactorio" ${sel("satisfactorio", params.nivel)}>Satisfactorio</option><option value="sobresaliente" ${sel("sobresaliente", params.nivel)}>Sobresaliente</option></select></label>` : ""}
    ${conFiltro ? `<label>Preguntas<select name="filtro">
        <option value="">Todas</option>
        <option value="nuevas" ${sel("nuevas", params.filtro)}>Solo no vistas</option>
        <option value="falladas" ${sel("falladas", params.filtro)}>Solo las que fallé</option>
        <option value="repaso" ${sel("repaso", params.filtro)}>Repaso programado de hoy (${E.pendientesRepaso().length})</option>
        <option value="marcadas" ${sel("marcadas", params.filtro)}>Solo marcadas ★</option></select></label>` : ""}`;
}

function sincronizarSubareas(form) {
  const selArea = form.elements.area;
  const selSub = form.elements.subarea;
  const actualizar = () => {
    for (const o of selSub.options) if (o.value) o.hidden = !!selArea.value && o.dataset.area !== selArea.value;
    if (selSub.selectedOptions[0]?.hidden) selSub.value = "";
  };
  selArea.addEventListener("change", actualizar);
  actualizar();
}

function resumenPorArea(items) {
  const porArea = {};
  for (const { p, ok } of items) {
    porArea[p.area] ??= { t: 0, a: 0 };
    porArea[p.area].t++;
    if (ok) porArea[p.area].a++;
  }
  return porArea;
}

// ================= PRÁCTICA =================

let teclasActivas = null;
let cerrarPractica = null; // registra la sesión parcial si el usuario sale a la mitad

export function detenerPractica() {
  if (teclasActivas) document.removeEventListener("keydown", teclasActivas);
  teclasActivas = null;
  cerrarPractica?.();
  cerrarPractica = null;
}

export function vistaPractica(cont, params) {
  if (!params.iniciar) {
    const pendientes = E.pendientesRepaso().length;
    cont.innerHTML = `<h1>Práctica guiada</h1>
      <p class="intro">Responde y recibe <strong>de inmediato</strong> la explicación de cada opción, una estrategia para razonar la pregunta y las fuentes para estudiar. Al terminar verás un <strong>diagnóstico</strong> con lo que debes reforzar.</p>
      ${pendientes ? `<div class="tarjeta destacada"><strong>🔁 Tienes ${pendientes} pregunta(s) en tu repaso programado de hoy.</strong> <a class="btn btn-mini btn-primario" href="#/practica?filtro=repaso&iniciar=1&n=${Math.min(30, pendientes)}">Repasar ahora</a></div>` : ""}
      <form class="tarjeta form-config" id="cfg">
        ${selectorAlcance(params)}
        <label>Cantidad<input type="number" name="n" min="1" max="250" value="${esc(params.n ?? 10)}"></label>
        <button class="btn btn-primario" type="submit">Comenzar práctica</button>
      </form>`;
    const form = $("#cfg", cont);
    sincronizarSubareas(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = new URLSearchParams([...new FormData(form)].filter(([, v]) => v));
      q.set("iniciar", "1");
      location.hash = `#/practica?${q}`;
    });
    return;
  }

  const pool = filtrar(params);
  if (!pool.length) {
    const msg = params.filtro === "repaso" ? "No tienes repasos pendientes hoy. 🎉 Vuelve mañana o practica preguntas nuevas." : "No hay preguntas con esos filtros.";
    cont.innerHTML = `<h1>Práctica</h1><div class="tarjeta vacio">${msg} <a href="#/practica">Cambiar la configuración</a>.</div>`;
    return;
  }
  const n = Number(params.n) || 10;
  const sesion = ordenarComoExamen(params.subarea || params.filtro ? barajar(pool).slice(0, n) : muestraProporcional(pool, n));
  let i = 0;
  const items = [];
  const inicio = Date.now();
  const ordenes = new Map(sesion.map((p) => [p.id, ordenOpciones(p)]));
  const modo = params.filtro === "repaso" ? "Repaso programado" : params.filtro === "falladas" ? "Repaso de errores" : "Práctica";

  const registrarSesion = () => {
    if (!items.length) return;
    const aciertos = items.filter((x) => x.ok).length;
    E.agregarSimulacro({ fecha: new Date().toISOString(), modo, tipo: "practica", total: items.length, aciertos, duracion: Math.round((Date.now() - inicio) / 1000), porArea: resumenPorArea(items) });
  };
  cerrarPractica = registrarSesion;

  const pintar = (elegida = null) => {
    const p = sesion[i];
    const revelar = elegida !== null;
    const aciertos = items.filter((x) => x.ok).length;
    cont.innerHTML = `<div class="barra-sesion"><a href="#/practica" class="btn btn-mini">← Configurar</a>
        <span>${esc(modo)} · Aciertos: <strong>${aciertos}</strong> / ${items.length}</span>
        <progress max="${sesion.length}" value="${items.length}"></progress>
        <button class="btn btn-mini" id="terminar">Terminar y ver diagnóstico</button></div>
      ${htmlReactivo(p, { orden: ordenes.get(p.id), elegida, revelar, numero: i + 1, total: sesion.length })}
      <div class="acciones">${revelar ? `<button class="btn btn-primario" id="sig">${i + 1 < sesion.length ? "Siguiente →" : "Ver diagnóstico"}</button>` : `<span class="tenue">Atajos: teclas A, B, C</span>`}</div>`;
    enlazarMarca(cont);
    $$(".opcion", cont).forEach((b) => b.addEventListener("click", () => elegir(Number(b.dataset.opcion))));
    $("#sig", cont)?.addEventListener("click", siguiente);
    $("#terminar", cont).addEventListener("click", resumen);
    if (revelar) {
      $("#sig", cont)?.focus({ preventScroll: true });
      $(".retro", cont)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      $(".opcion", cont)?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    }
  };
  const elegir = (iOrig) => {
    const p = sesion[i];
    const ok = iOrig === p.correcta;
    items.push({ p, elegida: iOrig, ok });
    E.registrar(p.id, ok, "practica");
    pintar(iOrig);
  };
  const siguiente = () => {
    i++;
    if (i < sesion.length) pintar();
    else resumen();
  };
  const resumen = () => {
    cerrarPractica = null;
    detenerPractica();
    if (!items.length) {
      location.hash = "#/practica";
      return;
    }
    registrarSesion();
    const aciertos = items.filter((x) => x.ok).length;
    const porc = pct(aciertos, items.length);
    cont.innerHTML = `<h1>Resumen: ${esc(modo)}</h1>
      <div class="tarjeta"><p class="grande">${aciertos} / ${items.length} <small>(${porc}%)</small></p>${barra(porc)}
      <p><a class="btn btn-primario" href="#/practica?${new URLSearchParams({ ...params, iniciar: 1 })}">Otra ronda igual</a>
      <a class="btn" href="#/practica">Configurar otra práctica</a></p></div>
      ${htmlDiagnostico(items, modo)}`;
    window.scrollTo({ top: 0 });
  };
  const teclas = (e) => {
    if (["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
    const idx = LETRAS.indexOf(e.key.toUpperCase());
    const btns = $$(".opcion:not([disabled])", cont);
    if (idx >= 0 && btns[idx]) btns[idx].click();
    else if (e.key === "Enter" && $("#sig", cont) && document.activeElement !== $("#sig", cont)) $("#sig", cont).click();
  };
  if (teclasActivas) document.removeEventListener("keydown", teclasActivas);
  teclasActivas = teclas;
  document.addEventListener("keydown", teclas);
  pintar();
}

// ================= SIMULACRO (reanudable) =================

let temporizador = null;
let activo = null; // estado del simulacro en pantalla

const transcurrido = (st) => Math.floor(st.acumulado + (st.reanudado ? (Date.now() - st.reanudado) / 1000 : 0));
const persistir = (st) => E.guardarEnCurso({ ...st });
const alSalirDePagina = () => activo && pausar(activo);

function pausar(st) {
  st.acumulado = transcurrido(st);
  st.reanudado = null;
  persistir(st);
}

export const simulacroEnCurso = () => !!activo;

/** Al salir de la vista, el simulacro se pausa y queda guardado para reanudarlo. */
export function detenerSimulacro() {
  clearInterval(temporizador);
  temporizador = null;
  window.removeEventListener("pagehide", alSalirDePagina);
  if (activo) {
    pausar(activo);
    aviso("Simulacro pausado y guardado. Reanúdalo desde «Simulacro».");
  }
  activo = null;
}

export function vistaSimulacro(cont, params) {
  const enCurso = E.get().enCurso;
  const disciplinares = preguntasDe({ seccion: "DIS" }).length;
  const lyc = preguntasDe({ seccion: "LYC" }).length;
  const minDis = D.temario.formato.minutosDisciplinar / 143;
  const minLyc = D.temario.formato.minutosLenguaje / 60;

  cont.innerHTML = `<h1>Simulacro tipo Ceneval</h1>
    ${enCurso ? `<div class="tarjeta destacada"><h2>⏸ Tienes un simulacro sin terminar</h2>
      <p><strong>${esc(enCurso.modo)}</strong> · ${Object.keys(enCurso.resp).length}/${enCurso.ids.length} contestadas
      ${enCurso.limite ? ` · quedan ${fmtTiempo(Math.max(0, enCurso.limite - enCurso.acumulado))}` : ""}</p>
      <button class="btn btn-primario" id="reanudar">Reanudar</button> <button class="btn btn-peligro" id="descartar">Descartar</button></div>` : ""}
    <p class="intro">Como en el examen real: 3 opciones, sin retroalimentación hasta el final, con cronómetro proporcional
    (≈${minDis.toFixed(1)} min por reactivo disciplinar y ${minLyc.toFixed(0)} min por reactivo de lenguaje). Puedes marcar preguntas, regresar a ellas y pausar.
    Para la experiencia completa (203 reactivos en sesiones), usa <a href="#/examen">Examen completo</a>.</p>
    <div class="rejilla-3">
      ${tarjetaModo("diagnostico", "🎯 Diagnóstico rápido", "20 reactivos disciplinares en proporción al peso de cada subárea. Ideal para empezar.", 20)}
      ${tarjetaModo("disciplinar", "🧠 Disciplinar (143)", `143 reactivos con la distribución real por subárea (de ${disciplinares} disponibles), 7 horas.`, disciplinares)}
      ${tarjetaModo("lenguaje", "📝 Lenguaje y Comunicación", `Comprensión lectora y redacción indirecta (${lyc} reactivos), 2 horas.`, lyc)}
    </div>
    <form class="tarjeta form-config" id="cfg-area"><h2>Simulacro personalizado</h2>
      ${selectorAlcance(params, { conNivel: false, conFiltro: false })}
      <label>Cantidad<input type="number" name="n" min="1" max="250" value="15"></label>
      <label class="check"><input type="checkbox" name="crono" checked> Con cronómetro</label>
      <button class="btn btn-primario">Comenzar</button></form>`;

  const confirmarReemplazo = () => !E.get().enCurso || confirm("Tienes un simulacro sin terminar. Si inicias otro, se descartará. ¿Continuar?");
  $("#reanudar", cont)?.addEventListener("click", () => reanudar(cont, E.get().enCurso));
  $("#descartar", cont)?.addEventListener("click", () => {
    if (!confirm("¿Descartar el simulacro sin terminar? No se guardarán sus respuestas.")) return;
    E.limpiarEnCurso();
    vistaSimulacro(cont, params);
  });
  $$("[data-modo]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirmarReemplazo()) return;
      const modo = b.dataset.modo;
      if (modo === "diagnostico") iniciar(cont, muestraProporcional(preguntasDe({ seccion: "DIS" }), 20), { modo: "Diagnóstico", crono: true });
      if (modo === "disciplinar") iniciar(cont, muestraExacta("DIS"), { modo: "Disciplinar (143)", crono: true });
      if (modo === "lenguaje") iniciar(cont, muestraExacta("LYC"), { modo: "Lenguaje y Comunicación", crono: true });
    }),
  );
  const form = $("#cfg-area", cont);
  sincronizarSubareas(form);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const pool = preguntasDe({ area: f.get("area") || undefined, subarea: f.get("subarea") || undefined, banco: f.get("banco") || undefined });
    if (!pool.length) return aviso("No hay preguntas para ese alcance", "error");
    if (!confirmarReemplazo()) return;
    iniciar(cont, muestraProporcional(pool, Number(f.get("n")) || 15), { modo: "Personalizado", crono: !!f.get("crono") });
  });
}

function tarjetaModo(modo, titulo, desc, n) {
  return `<div class="tarjeta modo"><h2>${titulo}</h2><p>${desc}</p><button class="btn btn-primario" data-modo="${modo}" ${n ? "" : "disabled"}>Iniciar</button></div>`;
}

const minutosDe = (sesion) => sesion.reduce((s, p) => s + (p.seccion === "LYC" ? D.temario.formato.minutosLenguaje / 60 : D.temario.formato.minutosDisciplinar / 143), 0);

function iniciar(cont, lista, { modo, crono, limiteMin = null, bloque = null, ordenar = true }) {
  const sesion = ordenar ? ordenarComoExamen(lista) : lista;
  const st = {
    modo,
    tipo: bloque ? "examen" : "simulacro",
    bloque,
    ids: sesion.map((p) => p.id),
    ordenes: Object.fromEntries(sesion.map((p) => [p.id, ordenOpciones(p)])),
    resp: {},
    marcas: [],
    i: 0,
    acumulado: 0,
    reanudado: Date.now(),
    limite: crono ? Math.ceil(limiteMin ?? minutosDe(sesion)) * 60 : null,
    fecha: new Date().toISOString(),
  };
  persistir(st);
  correr(cont, st);
}

function reanudar(cont, guardado) {
  const st = { ...guardado, reanudado: Date.now() };
  if (st.ids.some((id) => !D.porId.has(id))) {
    aviso("Algunas preguntas de ese simulacro ya no existen; se omitirán.", "error");
    st.ids = st.ids.filter((id) => D.porId.has(id));
  }
  correr(cont, st);
}

function correr(cont, st) {
  activo = st;
  window.addEventListener("pagehide", alSalirDePagina);
  clearInterval(temporizador);
  if (st.limite)
    temporizador = setInterval(() => {
      const resta = st.limite - transcurrido(st);
      const reloj = $("#reloj");
      if (reloj) {
        reloj.textContent = fmtTiempo(Math.max(0, resta));
        reloj.classList.toggle("urgente", resta < 300);
      }
      if (resta <= 0) {
        aviso("Se terminó el tiempo", "error");
        terminar(cont, st);
      }
    }, 1000);
  pintarSim(cont, st);
}

function pintarSim(cont, st) {
  const p = D.porId.get(st.ids[st.i]);
  const marcas = new Set(st.marcas);
  const contestadas = Object.keys(st.resp).length;
  const resta = st.limite ? st.limite - transcurrido(st) : null;
  cont.innerHTML = `<div class="barra-sesion sticky">
      <strong>${esc(st.modo)}</strong>
      <span>${contestadas}/${st.ids.length} contestadas</span>
      ${st.limite ? `<span class="reloj ${resta < 300 ? "urgente" : ""}" id="reloj" aria-live="off">${fmtTiempo(Math.max(0, resta))}</span>` : ""}
      <button class="btn btn-mini" id="pausa" title="En el examen real no se puede pausar">⏸ Pausar</button>
      <button class="btn btn-mini btn-peligro" id="fin">Terminar y calificar</button></div>
    <div class="sim-layout">
      <div>${htmlReactivo(p, { orden: st.ordenes[p.id], elegida: st.resp[p.id] ?? null, numero: st.i + 1, total: st.ids.length })}
        <div class="acciones">
          <button class="btn" id="ant" ${st.i === 0 ? "disabled" : ""}>← Anterior</button>
          <label class="check"><input type="checkbox" id="revisar" ${marcas.has(p.id) ? "checked" : ""}> Marcar para revisar</label>
          <button class="btn btn-primario" id="sig">${st.i + 1 < st.ids.length ? "Siguiente →" : "Revisar y terminar"}</button>
        </div></div>
      <nav class="mapa" aria-label="Mapa de preguntas">${st.ids
        .map((id, k) => `<button class="${k === st.i ? "actual " : ""}${id in st.resp ? "hecha " : ""}${marcas.has(id) ? "revisar" : ""}" data-ir="${k}" aria-label="Pregunta ${k + 1}${id in st.resp ? ", contestada" : ""}">${k + 1}</button>`)
        .join("")}</nav>
    </div>`;
  enlazarMarca(cont);
  $$(".opcion", cont).forEach((b) =>
    b.addEventListener("click", () => {
      st.resp[p.id] = Number(b.dataset.opcion);
      persistir(st);
      $$(".opcion", cont).forEach((x) => {
        x.classList.toggle("elegida", x === b);
        x.setAttribute("aria-pressed", x === b);
      });
      $(`[data-ir="${st.i}"]`, cont).classList.add("hecha");
    }),
  );
  $("#revisar", cont).addEventListener("change", (e) => {
    st.marcas = e.target.checked ? [...new Set([...st.marcas, p.id])] : st.marcas.filter((x) => x !== p.id);
    persistir(st);
    $(`[data-ir="${st.i}"]`, cont).classList.toggle("revisar", e.target.checked);
  });
  const ir = (k) => {
    st.i = k;
    persistir(st);
    pintarSim(cont, st);
  };
  $("#ant", cont).addEventListener("click", () => ir(st.i - 1));
  $("#sig", cont).addEventListener("click", () => (st.i + 1 < st.ids.length ? ir(st.i + 1) : confirmarFin(cont, st)));
  $$("[data-ir]", cont).forEach((b) => b.addEventListener("click", () => ir(Number(b.dataset.ir))));
  $("#fin", cont).addEventListener("click", () => confirmarFin(cont, st));
  $("#pausa", cont).addEventListener("click", () => {
    clearInterval(temporizador);
    pausar(st);
    activo = null;
    cont.innerHTML = `<div class="tarjeta vacio"><h2>⏸ Simulacro en pausa</h2><p>${esc(st.modo)} · ${Object.keys(st.resp).length}/${st.ids.length} contestadas.
      Tu avance está guardado en este navegador. En el examen real no hay pausas: úsala solo para estudiar.</p>
      <button class="btn btn-primario" id="seguir">Reanudar</button> <a class="btn" href="#/inicio">Salir</a></div>`;
    $("#seguir", cont).addEventListener("click", () => reanudar(cont, E.get().enCurso));
  });
  window.scrollTo({ top: 0 });
}

function confirmarFin(cont, st) {
  const faltan = st.ids.length - Object.keys(st.resp).length;
  const msg = faltan
    ? `Te faltan ${faltan} pregunta(s) sin contestar${st.marcas.length ? ` y tienes ${st.marcas.length} marcada(s)` : ""}. En el examen real no se penaliza el error: conviene contestar todo. ¿Terminar de todos modos?`
    : "¿Terminar y calificar el simulacro?";
  if (confirm(msg)) terminar(cont, st);
}

function terminar(cont, st) {
  clearInterval(temporizador);
  temporizador = null;
  window.removeEventListener("pagehide", alSalirDePagina);
  activo = null;
  const duracion = transcurrido(st);
  const items = st.ids.map((id) => {
    const p = D.porId.get(id);
    const elegida = st.resp[id];
    return { p, elegida: elegida ?? null, ok: elegida === p.correcta };
  });
  for (const x of items) if (x.elegida !== null) E.registrar(x.p.id, x.ok, st.tipo);
  const aciertos = items.filter((x) => x.ok).length;
  const porArea = resumenPorArea(items);
  E.agregarSimulacro({ fecha: new Date().toISOString(), modo: st.modo, tipo: st.tipo, total: items.length, aciertos, duracion, porArea });
  E.limpiarEnCurso();

  if (st.bloque) {
    const ex = E.examen();
    if (ex?.bloques?.[st.bloque]) {
      ex.bloques[st.bloque] = { ...ex.bloques[st.bloque], estado: "terminado", resp: st.resp, duracion };
      E.examen(ex);
    }
  }
  pintarResultados(cont, { modo: st.modo, items, duracion, limite: st.limite, ordenes: st.ordenes, porArea, bloque: st.bloque });
}

function pintarResultados(cont, { modo, items, duracion, limite, ordenes, porArea, bloque }) {
  const aciertos = items.filter((x) => x.ok).length;
  const porc = pct(aciertos, items.length);
  const n = nivelEstimado(porc);
  const secciones = new Set(items.map((x) => x.p.seccion));

  cont.innerHTML = `<h1>Resultados: ${esc(modo)}</h1>
    ${bloque ? `<p><a class="btn btn-primario" href="#/examen">← Volver al examen completo</a></p>` : ""}
    <div class="rejilla-2">
      <div class="tarjeta"><p class="grande">${aciertos} / ${items.length} <small>(${porc}%)</small></p>${barra(porc)}
        <p>Nivel estimado: <span class="chip nivel ${n.clase}">${n.nombre}</span></p>
        <p class="tenue">Tiempo: ${fmtTiempo(duracion)}${limite ? ` de ${fmtTiempo(limite)}` : ""}.
        Estimación orientativa: Ceneval convierte los aciertos al Índice Ceneval (700–1300) con puntos de corte que no publica; aquí se usa ≥60% ≈ Satisfactorio y ≥80% ≈ Sobresaliente.</p></div>
      <div class="tarjeta"><h2>Por área</h2>${Object.entries(porArea)
        .map(([id, v]) => `<div class="fila-barra"><span>${esc(nombreArea(id))}</span><span>${v.a}/${v.t}</span>${barra(pct(v.a, v.t), nombreArea(id))}</div>`)
        .join("")}</div>
    </div>
    ${secciones.size > 1 ? htmlNiveles(porArea) : ""}
    ${htmlDiagnostico(items, modo)}
    <h2>Revisión con explicaciones</h2>
    <p><label class="check"><input type="checkbox" id="solo-mal" checked> Mostrar solo las que fallé o dejé sin contestar</label></p>
    <div id="revision"></div>`;

  const revision = $("#revision", cont);
  const pintarRevision = () => {
    const soloMal = $("#solo-mal", cont).checked;
    revision.innerHTML =
      items
        .map((x, k) => ({ ...x, k }))
        .filter((x) => !soloMal || !x.ok)
        .map(({ p, elegida, k }) => htmlReactivo(p, { orden: ordenes?.[p.id] ?? p.opciones.map((_, j) => j), elegida, revelar: true, numero: k + 1, total: items.length }))
        .join("") || `<div class="tarjeta vacio">¡Sin errores! 🎉</div>`;
    enlazarMarca(revision);
  };
  $("#solo-mal", cont).addEventListener("change", pintarRevision);
  pintarRevision();
  window.scrollTo({ top: 0 });
}

// ================= EXAMEN COMPLETO POR SESIONES =================

function nuevoExamen() {
  const ses = D.temario.formato.sesiones;
  const dis = ordenarComoExamen(muestraExacta("DIS"));
  const lyc = ordenarComoExamen(muestraExacta("LYC"));
  const minDis = ses.filter((s) => s.seccion === "DIS").reduce((a, s) => a + s.minutos, 0);
  const corte = Math.round((dis.length * ses.find((s) => s.parte === 1).minutos) / minDis);
  const ids = { S1: dis.slice(0, corte), S2A: dis.slice(corte), S2B: lyc };
  const bloques = {};
  for (const s of ses) bloques[s.id] = { ids: ids[s.id].map((p) => p.id), estado: "pendiente", resp: {}, duracion: 0 };
  return { id: `ex-${Date.now().toString(36)}`, inicio: new Date().toISOString(), bloques };
}

export function vistaExamen(cont) {
  let ex = E.examen();
  const ses = D.temario.formato.sesiones;
  const total = ses.reduce((a, s) => a + (ex?.bloques[s.id]?.ids.length ?? 0), 0);
  const terminados = ex ? ses.filter((s) => ex.bloques[s.id]?.estado === "terminado").length : 0;

  cont.innerHTML = `<h1>Examen completo tipo Ceneval</h1>
    <p class="intro">Replica la aplicación real: <strong>203 reactivos</strong> con la distribución oficial por subárea, en <strong>tres bloques cronometrados</strong>
    con los horarios de la guía. Puedes hacer cada bloque en un día distinto; al terminar los tres verás el resultado por sección y el <strong>nivel global</strong> con la regla conjuntiva de Ceneval.</p>
    <div class="tarjeta"><table class="tabla-datos"><thead><tr><th>Bloque</th><th>Horario real</th><th>Reactivos</th><th>Tiempo</th><th>Estado</th><th></th></tr></thead><tbody>
    ${ses
      .map((s) => {
        const b = ex?.bloques[s.id];
        const res = b?.estado === "terminado" ? (() => {
          const ok = b.ids.filter((id) => b.resp[id] === D.porId.get(id)?.correcta).length;
          return `✔ ${ok}/${b.ids.length} (${pct(ok, b.ids.length)}%)`;
        })() : E.get().enCurso?.bloque === s.id ? "⏸ En curso" : "Pendiente";
        return `<tr><td><strong>${esc(s.nombre)}</strong></td><td>${esc(s.horario)}</td><td>${b?.ids.length ?? "—"}</td><td>${Math.floor(s.minutos / 60)} h ${s.minutos % 60 ? `${s.minutos % 60} min` : ""}</td><td>${res}</td>
          <td>${ex && b?.estado !== "terminado" ? `<button class="btn btn-mini btn-primario" data-bloque="${s.id}">${E.get().enCurso?.bloque === s.id ? "Reanudar" : "Iniciar"}</button>` : ""}</td></tr>`;
      })
      .join("")}</tbody></table>
    <p class="acciones">${ex ? `<span class="tenue">Intento iniciado el ${new Date(ex.inicio).toLocaleString("es-MX")} · ${terminados}/3 bloques · ${total} reactivos</span>
      <button class="btn btn-mini btn-peligro" id="nuevo">Nuevo intento</button>` : `<button class="btn btn-primario" id="nuevo">Preparar examen completo</button>`}</p></div>
    <div id="informe"></div>
    <div class="tarjeta"><h2>Recomendaciones para el día del examen</h2><ul>
      <li>Duerme bien y lleva calculadora científica <strong>no programable</strong> (no se puede prestar).</li>
      <li>Para que tu examen sea válido, debes presentar las dos sesiones, y la segunda con sus dos secciones.</li>
      <li>Contesta todo: no se penaliza el error. Si una pregunta te toma más de 3 minutos, márcala y regresa.</li>
      <li>No intentes ser de los primeros en terminar: usa el tiempo sobrante para revisar las preguntas marcadas.</li></ul></div>`;

  $("#nuevo", cont)?.addEventListener("click", () => {
    if (ex && !confirm("Se descartará el intento actual del examen completo. ¿Continuar?")) return;
    if (E.get().enCurso?.bloque) E.limpiarEnCurso();
    E.examen(nuevoExamen());
    vistaExamen(cont);
  });
  $$("[data-bloque]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      const s = ses.find((x) => x.id === b.dataset.bloque);
      const enCurso = E.get().enCurso;
      if (enCurso?.bloque === s.id) return reanudar(cont, enCurso);
      if (enCurso && !confirm("Tienes otro simulacro sin terminar; se descartará. ¿Continuar?")) return;
      const preguntas = ex.bloques[s.id].ids.map((id) => D.porId.get(id)).filter(Boolean);
      iniciar(cont, preguntas, { modo: `Examen completo · ${s.nombre}`, crono: true, limiteMin: s.minutos, bloque: s.id, ordenar: false });
    }),
  );

  if (ex && terminados === ses.length) {
    const items = ses.flatMap((s) =>
      ex.bloques[s.id].ids.map((id) => {
        const p = D.porId.get(id);
        const e = ex.bloques[s.id].resp[id];
        return p ? { p, elegida: e ?? null, ok: e === p.correcta } : null;
      }).filter(Boolean),
    );
    const porArea = resumenPorArea(items);
    $("#informe", cont).innerHTML = `<h2>📋 Informe del examen completo</h2>
      <div class="tarjeta"><h3>Por área</h3>${Object.entries(porArea)
        .map(([id, v]) => `<div class="fila-barra"><span>${esc(nombreArea(id))}</span><span>${v.a}/${v.t} (${pct(v.a, v.t)}%)</span>${barra(pct(v.a, v.t), nombreArea(id))}</div>`)
        .join("")}</div>
      ${htmlNiveles(porArea)}
      ${htmlDiagnostico(items, "Examen completo")}`;
  }
}
