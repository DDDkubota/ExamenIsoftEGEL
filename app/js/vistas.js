import { D, texto, guiaDe, recursosDe, urlEditarGitHub, preguntasDe } from "./datos.js";
import { E, PDFs } from "./almacen.js";
import { md } from "./md.js";
import { $, $$, esc, aviso, nombreArea, nombreSub, pct, barra, estadisticas, enlacesRecurso, recursoEfectivo, nivelEstimado } from "./ui.js";

const TIPO_ICONO = { libro: "📘", articulo: "📰", norma: "📏", web: "🌐", video: "🎬", guia: "🧭", "banco-preguntas": "❓", apuntes: "📝" };

// ================= INICIO =================

export function vistaInicio(cont) {
  const { porArea, porSub } = estadisticas();
  const aj = E.get().ajustes;
  const dias = aj.fechaExamen ? Math.ceil((new Date(aj.fechaExamen + "T08:30") - new Date()) / 86400000) : null;
  const sugerida = siguienteSubarea(porSub);
  const totalVistas = Object.values(porArea).reduce((s, a) => s + a.vistas, 0);
  const pendientes = E.pendientesRepaso().length;
  const enCurso = E.get().enCurso;

  cont.innerHTML = `
    <section class="hero">
      <h1>Prepárate para el <span class="acento">EGEL Plus ISOFT</span></h1>
      <p>${esc(D.temario.nombre)} · ${D.temario.formato.totalReactivos} reactivos · ${D.temario.formato.opcionesPorReactivo} opciones por pregunta · 2 sesiones de 4.5 h</p>
      ${dias !== null ? `<p class="cuenta">${dias > 0 ? `Faltan <strong>${dias}</strong> días para tu examen` : dias === 0 ? "¡Hoy es tu examen! Mucho éxito." : "La fecha de examen ya pasó: actualízala en el Plan."}</p>` : `<p><a href="#/plan">Define la fecha de tu examen y genera un plan de estudio →</a></p>`}
      <div class="acciones">
        <a class="btn btn-primario" href="#/simulacro">${totalVistas ? "Hacer un simulacro" : "Empezar con un diagnóstico"}</a>
        <a class="btn" href="#/examen">Examen completo (203)</a>
        <a class="btn" href="#/practica">Práctica guiada</a>
        <a class="btn" href="#/seguimiento">Mi seguimiento</a>
        <a class="btn" href="#/guias/estrategias">Cómo responder reactivos Ceneval</a>
      </div>
    </section>

    ${pendientes ? `<div class="tarjeta destacada"><h2>🔁 Repaso programado</h2>
      <p>Tienes <strong>${pendientes}</strong> pregunta(s) que toca repasar hoy para no olvidarlas (repetición espaciada).</p>
      <a class="btn btn-mini btn-primario" href="#/practica?filtro=repaso&iniciar=1&n=${Math.min(30, pendientes)}">Repasar ahora</a></div>` : ""}
    ${enCurso ? `<div class="tarjeta destacada"><h2>⏸ Simulacro sin terminar</h2><p>${esc(enCurso.modo)} · ${Object.keys(enCurso.resp).length}/${enCurso.ids.length} contestadas.</p>
      <a class="btn btn-mini btn-primario" href="#/${enCurso.bloque ? "examen" : "simulacro"}">Continuar</a></div>` : ""}
    ${sugerida ? `<div class="tarjeta destacada"><h2>👉 Tu siguiente paso</h2>
      <p>Enfócate en <strong>${esc(nombreSub(sugerida.id))}</strong>: vale <strong>${sugerida.reactivos}</strong> reactivos en el examen
      ${sugerida.vistas ? `y llevas ${sugerida.p}% de aciertos` : "y aún no la practicas"}.</p>
      <a class="btn btn-mini" href="#/guias/${encodeURIComponent(sugerida.id)}">Leer guía</a>
      <a class="btn btn-mini btn-primario" href="#/practica?subarea=${encodeURIComponent(sugerida.id)}&iniciar=1&n=10">Practicar</a></div>` : ""}

    <h2>Estructura del examen y tu avance</h2>
    ${D.secciones
      .map(
        (sec) => `<section class="tarjeta"><h3>Sección ${esc(sec.nombre)} <span class="tenue">· ${sec.reactivos} reactivos</span></h3>
        <div class="rejilla-areas">${sec.areas
          .map((a) => {
            const st = porArea[a.id] ?? { intentos: 0, aciertos: 0, vistas: 0, total: 0 };
            const p = pct(st.aciertos, st.intentos);
            const reac = a.subareas.reduce((s, x) => s + x.reactivos, 0);
            return `<div class="area-card area-${a.id}"><h4>${esc(a.nombre)}</h4>
              <p class="tenue">${reac} reactivos · ${st.vistas}/${st.total} preguntas vistas</p>
              ${st.intentos ? `${barra(p, a.nombre)}<p class="tenue">${p}% de aciertos</p>` : `<p class="tenue">Sin práctica todavía</p>`}
              <ul class="subareas">${a.subareas
                .map((s) => {
                  const ss = porSub[s.id];
                  const ps = ss?.intentos ? pct(ss.aciertos, ss.intentos) : null;
                  return `<li><a href="#/guias/${encodeURIComponent(s.id)}">${esc(s.id)} ${esc(s.nombre)}</a>
                    <span class="peso" title="Reactivos en el examen">${s.reactivos}</span>
                    ${ps !== null ? `<span class="mini-nivel ${nivelEstimado(ps).clase}">${ps}%</span>` : ""}</li>`;
                })
                .join("")}</ul></div>`;
          })
          .join("")}</div></section>`,
      )
      .join("")}
    <p class="tenue aviso-legal">Proyecto comunitario sin afiliación con Ceneval. Las preguntas son <strong>originales</strong> y siguen el formato
    público de la guía oficial; no son reactivos reales del examen. Consulta también la
    <a href="${esc(D.temario.guiaInteractiva)}" target="_blank" rel="noopener">guía interactiva oficial</a>.</p>`;
}

/** Prioridad = peso de la subárea × (1 − dominio). Lo no practicado se trata como 50% de dominio. */
function siguienteSubarea(porSub) {
  let mejor = null;
  for (const s of D.subareas.values()) {
    if (!preguntasDe({ subarea: s.id }).length) continue;
    const st = porSub[s.id] ?? { intentos: 0, aciertos: 0, vistas: 0 };
    const dominio = st.intentos ? st.aciertos / st.intentos : 0.5;
    const prioridad = s.reactivos * (1 - dominio);
    if (!mejor || prioridad > mejor.prioridad) mejor = { ...s, prioridad, vistas: st.vistas, p: pct(st.aciertos, st.intentos) };
  }
  return mejor;
}

// ================= GUÍAS =================

export async function vistaGuias(cont, params, id) {
  if (!id) {
    cont.innerHTML = `<h1>Guías de estudio</h1>
      <p class="intro">Una guía por subárea del temario oficial: conceptos clave, trampas frecuentes y qué leer. Empieza por las de mayor peso.</p>
      <div class="tarjeta"><a href="#/guias/estrategias"><strong>🧭 Cómo responder reactivos tipo Ceneval</strong></a> — método, manejo del tiempo y calificación.</div>
      ${D.secciones
        .map(
          (sec) => `<h2>Sección ${esc(sec.nombre)}</h2><div class="rejilla-areas">${sec.areas
            .map(
              (a) => `<div class="area-card area-${a.id}"><h3>${esc(a.nombre)}</h3><p class="tenue">${esc(a.definicion)}</p><ul class="subareas">${a.subareas
                .map((s) => `<li>${guiaDe(s.id) ? `<a href="#/guias/${encodeURIComponent(s.id)}">${esc(s.id)} ${esc(s.nombre)}</a>` : `${esc(s.id)} ${esc(s.nombre)}`}<span class="peso">${s.reactivos}</span></li>`)
                .join("")}</ul>
              <details><summary>Qué se espera por nivel</summary><p><strong>Satisfactorio:</strong> ${esc(a.satisfactorio)}</p><p><strong>Sobresaliente:</strong> ${esc(a.sobresaliente)}</p>${a.nota ? `<p class="tenue">${esc(a.nota)}</p>` : ""}</details></div>`,
            )
            .join("")}</div>`,
        )
        .join("")}`;
    return;
  }

  const ruta = guiaDe(id);
  if (!ruta) {
    cont.innerHTML = `<div class="tarjeta vacio">Aún no hay guía para «${esc(id)}». <a href="${esc(D.manifest.repositorio)}/blob/${D.manifest.ramaPrincipal}/CONTRIBUTING.md" target="_blank" rel="noopener">¿Te animas a escribirla?</a></div>`;
    return;
  }
  cont.innerHTML = `<p class="tenue">Cargando guía…</p>`;
  const contenido = await texto(ruta);
  const sub = D.subareas.get(id);
  const area = D.areas.get(id) ?? (sub && D.areas.get(sub.area));
  const recursos = sub ? recursosDe(id) : area ? D.recursos.filter((r) => r.areas?.includes(area.id)) : [];
  const nPreg = sub ? preguntasDe({ subarea: id }).length : area ? preguntasDe({ area: area.id }).length : 0;

  cont.innerHTML = `<p class="migas"><a href="#/guias">Guías</a>${area ? ` › ${esc(area.nombre)}` : ""}</p>
    <div class="guia-layout">
      <article class="markdown">${md(contenido)}
        <p class="tenue"><a href="${esc(urlEditarGitHub(ruta))}" target="_blank" rel="noopener">✏️ Mejorar esta guía en GitHub</a></p></article>
      <aside>
        ${nPreg ? `<div class="tarjeta"><h3>Practicar</h3><p>${nPreg} preguntas originales con explicación.</p>
          <a class="btn btn-primario" href="#/practica?${sub ? `subarea=${encodeURIComponent(id)}` : `area=${encodeURIComponent(area.id)}`}&iniciar=1&n=${Math.min(nPreg, 10)}">Practicar ahora</a></div>` : ""}
        ${recursos.length ? `<div class="tarjeta"><h3>Recursos (${recursos.length})</h3><ul class="lista-recursos">${recursos
          .sort((a, b) => (a.prioridad ?? 9) - (b.prioridad ?? 9) || Number(!!b.oficial) - Number(!!a.oficial))
          .map(
            (r) => `<li>${TIPO_ICONO[r.tipo] ?? "•"} <a href="#/biblioteca?id=${encodeURIComponent(r.id)}">${esc(r.titulo)}</a>
              ${r.oficial ? `<span class="chip oficial" title="Bibliografía sugerida por Ceneval">Ceneval</span>` : ""}${r.prioridad === 1 ? `<span class="chip clave">clave</span>` : ""}</li>`,
          )
          .join("")}</ul><a href="#/biblioteca?area=${encodeURIComponent(sub?.area ?? area?.id ?? "")}">Ver toda la biblioteca del área →</a></div>` : ""}
      </aside></div>`;
}

// ================= BIBLIOTECA =================

export async function vistaBiblioteca(cont, params) {
  const misRecursos = E.get().recursosUsuario.map((r) => ({ ...r, mio: true }));
  const todos = [...D.recursos, ...misRecursos];
  const citas = {};
  for (const p of D.preguntas) for (const f of p.fuentes ?? []) citas[f.recurso] = (citas[f.recurso] ?? 0) + 1;

  const f = { q: params.q ?? "", area: params.area ?? "", tipo: params.tipo ?? "", origen: params.origen ?? "", id: params.id ?? "" };
  const filtrados = todos
    .filter((r) => !f.id || r.id === f.id)
    .filter((r) => !f.area || r.areas?.includes(f.area))
    .filter((r) => !f.tipo || r.tipo === f.tipo)
    .filter(
      (r) =>
        !f.origen ||
        (f.origen === "oficial" && r.oficial) ||
        (f.origen === "repo" && r.archivo) ||
        (f.origen === "libre" && r.url && !r.archivo) ||
        (f.origen === "mios" && r.mio) ||
        (f.origen === "gratuito" && (r.gratuito || r.archivo || r.mio)),
    )
    .filter((r) => !f.q || `${r.titulo} ${r.autores ?? ""} ${r.nota ?? ""}`.toLowerCase().includes(f.q.toLowerCase()))
    .sort((a, b) => (a.prioridad ?? 9) - (b.prioridad ?? 9) || Number(!!b.oficial) - Number(!!a.oficial) || Number(!!b.gratuito) - Number(!!a.gratuito) || a.titulo.localeCompare(b.titulo));

  const areasOpts = [...D.areas.values()].map((a) => `<option value="${a.id}" ${f.area === a.id ? "selected" : ""}>${esc(a.nombre)}</option>`).join("");
  const tiposOpts = D.tiposRecurso.map((t) => `<option value="${t}" ${f.tipo === t ? "selected" : ""}>${TIPO_ICONO[t] ?? ""} ${t}</option>`).join("");

  cont.innerHTML = `<h1>Biblioteca clasificada</h1>
    <p class="intro">${D.recursos.length} recursos clasificados por área: la bibliografía sugerida por Ceneval (<span class="chip oficial">Ceneval</span>), los archivos del repo y los complementos. Puedes <strong>corregir URLs</strong>, <strong>agregar tus propios recursos</strong> y <strong>guardar PDFs</strong> en este navegador.</p>
    <form class="tarjeta form-config" id="filtros">
      <label>Buscar<input type="search" name="q" value="${esc(f.q)}" placeholder="Título, autor…"></label>
      <label>Área<select name="area"><option value="">Todas</option>${areasOpts}</select></label>
      <label>Tipo<select name="tipo"><option value="">Todos</option>${tiposOpts}</select></label>
      <label>Origen<select name="origen"><option value="">Todos</option>
        <option value="oficial" ${f.origen === "oficial" ? "selected" : ""}>Bibliografía Ceneval</option>
        <option value="repo" ${f.origen === "repo" ? "selected" : ""}>Archivos en el repo</option>
        <option value="libre" ${f.origen === "libre" ? "selected" : ""}>Enlaces en línea</option>
        <option value="gratuito" ${f.origen === "gratuito" ? "selected" : ""}>Gratuitos / libres</option>
        <option value="mios" ${f.origen === "mios" ? "selected" : ""}>Agregados por mí</option></select></label>
      ${f.id ? `<a class="btn btn-mini" href="#/biblioteca">Quitar filtro «${esc(f.id)}»</a>` : ""}
    </form>
    <p class="tenue">${filtrados.length} resultado(s)</p>
    <div class="rejilla-recursos">${filtrados.map((r) => tarjetaRecurso(r, citas[r.id])).join("") || `<div class="tarjeta vacio">Sin resultados.</div>`}</div>

    <div class="rejilla-2">
      <section class="tarjeta" id="agregar"><h2>➕ Agregar un recurso</h2>
        <form id="form-recurso" class="form-col">
          <label>Título*<input name="titulo" required></label>
          <label>Autor(es)<input name="autores"></label>
          <label>Tipo<select name="tipo">${tiposOpts.replace(/ selected/g, "")}</select></label>
          <label>URL<input name="url" type="url" placeholder="https://…"></label>
          <fieldset><legend>Áreas</legend>${[...D.areas.values()].map((a) => `<label class="check"><input type="checkbox" name="areas" value="${a.id}"> ${esc(a.nombre)}</label>`).join("")}</fieldset>
          <label>Subáreas (opcional, ej. 2.2, 3.4)<input name="subareas" placeholder="2.2, 3.4"></label>
          <label>Nota<textarea name="nota" rows="2"></textarea></label>
          <label>PDF (opcional, se guarda solo en este navegador)<input name="pdf" type="file" accept="application/pdf"></label>
          <button class="btn btn-primario">Guardar recurso</button>
        </form></section>
      <section class="tarjeta"><h2>📂 Mis PDFs guardados</h2>
        <p class="tenue">Se guardan en tu navegador (IndexedDB) y no se suben a ningún servidor. Para compartir un PDF con la comunidad, súbelo al repo con un Pull Request (ver CONTRIBUTING).</p>
        <label class="btn">Subir PDF<input type="file" id="subir-pdf" accept="application/pdf" multiple hidden></label>
        <ul id="lista-pdfs" class="lista-pdfs"><li class="tenue">Cargando…</li></ul>
        <h2>🤝 Compartir con la comunidad</h2>
        <p class="tenue">Exporta tus recursos y URLs corregidas en el formato de <code>contenido/recursos.json</code> para proponerlos en GitHub.</p>
        <button class="btn" id="copiar-json">Copiar JSON</button>
        <a class="btn" href="${esc(urlEditarGitHub("recursos.json"))}" target="_blank" rel="noopener">Editar recursos.json en GitHub</a>
        <a class="btn" id="issue" target="_blank" rel="noopener">Proponer por Issue</a>
      </section>
    </div>`;

  // Filtros reactivos
  const form = $("#filtros", cont);
  const aplicar = () => {
    const q = new URLSearchParams([...new FormData(form)].filter(([, v]) => v));
    location.hash = `#/biblioteca${q.size ? `?${q}` : ""}`;
  };
  form.addEventListener("change", aplicar);
  form.addEventListener("submit", (e) => (e.preventDefault(), aplicar()));
  let espera;
  form.elements.q.addEventListener("input", () => (clearTimeout(espera), (espera = setTimeout(aplicar, 400))));

  // Acciones de tarjetas
  $$("[data-editar-url]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.editarUrl;
      const r = todos.find((x) => x.id === id);
      const actual = recursoEfectivo(r).url ?? "";
      const nueva = prompt(`Nueva URL para «${r.titulo}» (vacío = restaurar la original):`, actual);
      if (nueva === null) return;
      if (nueva && !/^https?:\/\//.test(nueva)) return aviso("La URL debe iniciar con http:// o https://", "error");
      if (r.mio) E.actualizarRecurso(id, { url: nueva || undefined });
      else E.sobrescribirUrl(id, nueva);
      aviso("URL actualizada");
      vistaBiblioteca(cont, params);
    }),
  );
  $$("[data-borrar]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirm("¿Eliminar este recurso tuyo?")) return;
      E.eliminarRecurso(b.dataset.borrar);
      vistaBiblioteca(cont, params);
    }),
  );
  $$("[data-pdf]", cont).forEach((b) => b.addEventListener("click", () => abrirPdf(b.dataset.pdf)));

  // Agregar recurso
  $("#form-recurso", cont).addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const archivo = fd.get("pdf");
    let pdfId;
    if (archivo?.size) pdfId = await PDFs.guardar(archivo);
    E.agregarRecurso({
      titulo: fd.get("titulo").trim(),
      autores: fd.get("autores").trim() || undefined,
      tipo: fd.get("tipo"),
      url: fd.get("url").trim() || undefined,
      areas: fd.getAll("areas"),
      subareas: fd.get("subareas").split(",").map((s) => s.trim()).filter((s) => D.subareas.has(s)),
      nota: fd.get("nota").trim() || undefined,
      pdfId,
      oficial: false,
    });
    aviso("Recurso guardado");
    vistaBiblioteca(cont, { origen: "mios" });
  });

  // PDFs
  const pintarPdfs = async () => {
    const ul = $("#lista-pdfs", cont);
    if (!ul) return;
    try {
      const pdfs = await PDFs.listar();
      ul.innerHTML = pdfs.length
        ? pdfs
            .map((p) => `<li><button class="enlace" data-pdf="${p.id}">📄 ${esc(p.nombre)}</button> <span class="tenue">${(p.tam / 1048576).toFixed(1)} MB</span>
              <button class="btn btn-mini btn-peligro" data-borrar-pdf="${p.id}" aria-label="Eliminar ${esc(p.nombre)}">✕</button></li>`)
            .join("")
        : `<li class="tenue">Aún no guardas PDFs.</li>`;
      $$("[data-pdf]", ul).forEach((b) => b.addEventListener("click", () => abrirPdf(b.dataset.pdf)));
      $$("[data-borrar-pdf]", ul).forEach((b) =>
        b.addEventListener("click", async () => {
          if (!confirm("¿Eliminar este PDF de tu navegador?")) return;
          await PDFs.eliminar(b.dataset.borrarPdf);
          pintarPdfs();
        }),
      );
    } catch {
      ul.innerHTML = `<li class="tenue">Tu navegador no permite almacenamiento local (¿modo privado?).</li>`;
    }
  };
  $("#subir-pdf", cont).addEventListener("change", async (e) => {
    for (const archivo of e.target.files) await PDFs.guardar(archivo);
    aviso(`${e.target.files.length} PDF(s) guardado(s)`);
    pintarPdfs();
  });
  pintarPdfs();

  // Compartir
  const paraCompartir = () => {
    const st = E.get();
    return JSON.stringify(
      {
        nuevos: st.recursosUsuario.map(({ pdfId, mio, ...r }) => ({ ...r, id: slug(r.titulo) })),
        urlsCorregidas: Object.entries(st.overrides).map(([id, o]) => ({ id, url: o.url })),
      },
      null,
      2,
    );
  };
  $("#copiar-json", cont).addEventListener("click", async () => {
    await navigator.clipboard.writeText(paraCompartir());
    aviso("JSON copiado al portapapeles");
  });
  $("#issue", cont).href = `${D.manifest.repositorio}/issues/new?title=${encodeURIComponent("[Recursos] Propuesta de recursos / URLs")}&body=${encodeURIComponent("Propongo agregar o corregir estos recursos:\n\n```json\n" + paraCompartir() + "\n```\n")}`;

  if (f.id) $(".recurso")?.scrollIntoView({ block: "center" });
}

const slug = (t) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

async function abrirPdf(id) {
  const p = await PDFs.obtener(id);
  if (!p) return aviso("No se encontró el PDF", "error");
  window.open(URL.createObjectURL(p.blob), "_blank");
}

function tarjetaRecurso(r, nCitas) {
  return `<article class="recurso tarjeta ${r.mio ? "mio" : ""}">
    <header><span class="icono" aria-hidden="true">${TIPO_ICONO[r.tipo] ?? "•"}</span>
      <div><h3>${esc(r.titulo)}</h3><p class="tenue">${esc(r.autores ?? "")}${r.anio ? ` (${r.anio})` : ""}</p></div></header>
    <p>${r.oficial ? `<span class="chip oficial">Ceneval</span>` : ""}${r.licencia ? `<span class="chip libre" title="${esc(r.licencia)}">🔓 libre</span>` : r.gratuito ? `<span class="chip libre">gratuito</span>` : ""}${r.prioridad === 1 ? `<span class="chip clave">clave</span>` : ""}${r.mio ? `<span class="chip">mío</span>` : ""}
      ${(r.areas ?? []).map((a) => `<span class="chip area-${a}">${esc(nombreArea(a))}</span>`).join("")}
      ${(r.subareas ?? []).map((s) => `<a class="chip" href="#/guias/${encodeURIComponent(s)}">${esc(s)}</a>`).join("")}
      ${r.idioma === "en" ? `<span class="chip tenue">inglés</span>` : ""}</p>
    ${r.nota ? `<p class="nota">${esc(r.nota)}</p>` : ""}
    ${r.alternativasLibres?.length ? `<p class="alternativas">🔓 <strong>Alternativas gratuitas:</strong> ${r.alternativasLibres
      .map((id) => D.recursosPorId.get(id))
      .filter(Boolean)
      .map((a) => `<a href="${esc(a.url ?? `#/biblioteca?id=${a.id}`)}" ${a.url ? 'target="_blank" rel="noopener"' : ""}>${esc(a.titulo)}</a>`)
      .join(" · ")}</p>` : ""}
    ${nCitas ? `<p class="tenue">Citado en ${nCitas} pregunta(s)</p>` : ""}
    <p class="acciones-recurso">${enlacesRecurso(r)}
      ${r.pdfId ? `<button class="btn btn-mini" data-pdf="${r.pdfId}">📄 Mi PDF</button>` : ""}
      <button class="btn btn-mini" data-editar-url="${esc(r.id)}" title="Corregir o agregar URL">✏️ URL</button>
      ${r.mio ? `<button class="btn btn-mini btn-peligro" data-borrar="${esc(r.id)}">🗑</button>` : ""}</p>
  </article>`;
}

// ================= PLAN DE ESTUDIO =================

export function vistaPlan(cont) {
  const aj = E.get().ajustes;
  cont.innerHTML = `<h1>Plan de estudio</h1>
    <p class="intro">Reparte tus horas según el <strong>peso de cada subárea</strong> en el examen y tu <strong>desempeño</strong> en este simulador (así lo recomienda la guía oficial: «distribuya su tiempo en los aspectos con mayor ponderación»).</p>
    <form class="tarjeta form-config" id="f-plan">
      <label>Fecha del examen<input type="date" name="fechaExamen" value="${esc(aj.fechaExamen)}"></label>
      <label>Horas de estudio por semana<input type="number" min="1" max="80" name="horasSemana" value="${aj.horasSemana}"></label>
      <button class="btn btn-primario">Generar plan</button>
      <button class="btn" type="button" onclick="window.print()">Imprimir</button>
    </form><div id="plan"></div>`;
  const form = $("#f-plan", cont);
  const generar = () => {
    const fd = new FormData(form);
    E.ajustes({ fechaExamen: fd.get("fechaExamen"), horasSemana: Number(fd.get("horasSemana")) || 8 });
    const { fechaExamen, horasSemana } = E.get().ajustes;
    const dias = fechaExamen ? Math.max(1, Math.ceil((new Date(fechaExamen) - new Date()) / 86400000)) : 56;
    const semanas = Math.max(1, Math.floor(dias / 7));
    const repaso = semanas >= 3 ? 1 : 0; // última semana: simulacros y repaso de errores
    const horas = (semanas - repaso) * horasSemana;
    const { porSub } = estadisticas();
    const filas = [...D.subareas.values()].map((s) => {
      const st = porSub[s.id];
      const dominio = st?.intentos ? st.aciertos / st.intentos : 0.5;
      return { ...s, dominio, peso: s.reactivos * (1.5 - dominio) };
    });
    const totalPeso = filas.reduce((a, f) => a + f.peso, 0);
    filas.sort((a, b) => b.peso - a.peso);
    $("#plan", cont).innerHTML = `<div class="tarjeta"><p><strong>${dias}</strong> días · <strong>${semanas}</strong> semana(s) · <strong>${horas}</strong> h de estudio por temas${repaso ? ` + 1 semana final de simulacros cronometrados y repaso de errores` : ""}.</p>
      ${!fechaExamen ? `<p class="tenue">Sin fecha: se asumen 8 semanas.</p>` : ""}
      <table class="tabla-datos"><thead><tr><th>#</th><th>Subárea</th><th>Reactivos</th><th>Tu dominio</th><th>Horas sugeridas</th><th></th></tr></thead><tbody>
      ${filas
        .map(
          (f, k) => `<tr><td>${k + 1}</td><td>${esc(nombreSub(f.id))}<br><span class="tenue">${esc(nombreArea(f.area))}</span></td><td>${f.reactivos}</td>
          <td>${porSub[f.id]?.intentos ? `${Math.round(f.dominio * 100)}%` : `<span class="tenue">sin datos</span>`}</td>
          <td><strong>${Math.max(0.5, Math.round((horas * f.peso * 2) / totalPeso) / 2)}</strong> h</td>
          <td>${guiaDe(f.id) ? `<a class="btn btn-mini" href="#/guias/${encodeURIComponent(f.id)}">Guía</a>` : ""} <a class="btn btn-mini" href="#/practica?subarea=${encodeURIComponent(f.id)}&iniciar=1&n=10">Practicar</a></td></tr>`,
        )
        .join("")}</tbody></table>
      <h3>Rutina sugerida por subárea</h3>
      <ol><li>Lee la guía (20–30 min) y anota en tu tabla «dificultad → estrategia».</li>
      <li>Haz la práctica guiada y lee las explicaciones <em>de todas</em> las opciones, no solo de la correcta.</li>
      <li>Consulta 1–2 fuentes marcadas como <span class="chip clave">clave</span> u <span class="chip oficial">Ceneval</span>.</li>
      <li>Al cerrar la semana: «Repasar mis errores» y un simulacro de diagnóstico para medir tu avance.</li></ol></div>`;
  };
  form.addEventListener("submit", (e) => (e.preventDefault(), generar(), aviso("Plan actualizado")));
  generar();
}
