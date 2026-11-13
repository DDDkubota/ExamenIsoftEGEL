// Seguimiento del progreso de estudio: indicadores, tendencias, dominio por subárea y conceptos débiles.
import { D, guiaDe } from "./datos.js";
import { E } from "./almacen.js";
import { $, esc, aviso, pct, fmtTiempo, nombreSub, nivelEstimado } from "./ui.js";
import { dominioSubareas, conceptosDebiles, serieSesiones, actividadDiaria, antesAhoraPorArea, racha, proyeccion } from "./analisis.js";
import { graficaLinea, graficaColumnas, graficaPesas } from "./graficas.js";

export function vistaSeguimiento(cont) {
  const st = E.get();
  const hist = st.historial;
  const ultimos = hist.slice(-50);
  const precision = pct(ultimos.filter((h) => h.ok).length, ultimos.length);
  const vistas = Object.keys(st.respuestas).filter((id) => D.porId.has(id)).length;
  const pendientes = E.pendientesRepaso().length;
  const proy = proyeccion();
  const dom = dominioSubareas();
  const conceptos = conceptosDebiles();
  const sesiones = serieSesiones();
  const tiempoTotal = st.simulacros.reduce((a, s) => a + (s.duracion ?? 0), 0);

  const tile = (valor, etiqueta, nota = "") => `<div class="tile"><div class="tile-valor">${valor}</div><div class="tile-etiqueta">${etiqueta}</div>${nota ? `<div class="tile-nota">${nota}</div>` : ""}</div>`;
  const nivelProy = (sec) => (proy[sec] ? `${proy[sec].p}%` : "—");

  cont.innerHTML = `<h1>Mi seguimiento</h1>
    <p class="intro">Todo lo que respondes en práctica, simulacros y examen completo se registra aquí para que veas tu avance real. Los datos viven solo en este navegador (puedes exportarlos).</p>
    ${!hist.length ? `<div class="tarjeta vacio">Aún no hay respuestas registradas. <a href="#/simulacro">Empieza con un diagnóstico</a> y regresa aquí.</div>` : ""}
    <div class="tiles">
      ${tile(hist.length, "respuestas registradas", `${fmtTiempo(tiempoTotal)} de estudio cronometrado`)}
      ${tile(ultimos.length ? `${precision}%` : "—", "precisión reciente", "últimas 50 respuestas")}
      ${tile(`${racha()} ${racha() === 1 ? "día" : "días"}`, "racha de estudio", "días seguidos con práctica")}
      ${tile(pendientes, "repasos para hoy", pendientes ? `<a href="#/practica?filtro=repaso&iniciar=1&n=${Math.min(30, pendientes)}">Repasar ahora →</a>` : "al día ✔")}
      ${tile(`${pct(vistas, D.preguntas.length)}%`, "del banco visto", `${vistas} de ${D.preguntas.length} preguntas`)}
      ${tile(nivelProy("DIS"), "proyección disciplinar", proy.DIS ? `${nivelEstimado(proy.DIS.p).nombre} · cubres ${proy.DIS.cobertura}% del temario` : "practica para estimarla")}
    </div>

    <div class="tarjeta"><h2>Aciertos por sesión</h2>
      <p class="tenue">Cada punto es una sesión de práctica, simulacro o bloque de examen. Las líneas marcan los umbrales orientativos de nivel.</p>
      <div id="g-sesiones">${sesiones.length ? "" : "<p class='tenue'>Completa al menos una sesión para ver la tendencia.</p>"}</div></div>
    <div class="rejilla-2">
      <div class="tarjeta"><h2>Actividad de los últimos 30 días</h2><p class="tenue">Respuestas por día: la constancia pesa más que los atracones.</p><div id="g-actividad"></div></div>
      <div class="tarjeta"><h2>Antes vs. ahora por área</h2><p class="tenue">Tus primeras respuestas comparadas con las más recientes.</p><div id="g-areas">${antesAhoraPorArea().length ? "" : "<p class='tenue'>Necesitas al menos 4 respuestas en un área.</p>"}</div></div>
    </div>

    <div class="tarjeta"><h2>Dominio por subárea</h2>
      <p class="tenue">Según tus últimas 12 respuestas de cada subárea. «Dominada» = 80% o más con al menos 5 respuestas.</p>
      <table class="tabla-datos"><thead><tr><th>Subárea</th><th>Peso</th><th>Estado</th><th>Aciertos recientes</th><th>Vistas</th><th>Repaso hoy</th><th></th></tr></thead><tbody>
      ${Object.values(dom)
        .sort((a, b) => ordenEstado(a) - ordenEstado(b) || b.reactivos - a.reactivos)
        .map(
          (d) => `<tr><td>${esc(nombreSub(d.id))}</td><td>${d.reactivos}</td>
          <td><span class="estado estado-${d.estado.id}"><span aria-hidden="true">${d.estado.icono}</span> ${d.estado.nombre}</span></td>
          <td>${d.intentos ? `${d.p}% <span class="tenue">(${d.aciertos}/${d.intentos})</span>` : "—"}</td>
          <td>${d.vistas}/${d.total}</td><td>${d.pendientes || ""}</td>
          <td>${guiaDe(d.id) ? `<a class="btn btn-mini" href="#/guias/${encodeURIComponent(d.id)}">Guía</a>` : ""} <a class="btn btn-mini" href="#/practica?subarea=${encodeURIComponent(d.id)}&iniciar=1&n=10">Practicar</a></td></tr>`,
        )
        .join("")}</tbody></table></div>

    ${conceptos.length ? `<div class="tarjeta"><h2>Conceptos que más te cuestan</h2>
      <p class="tenue">Calculado con todas tus respuestas; solo aparecen los conceptos con menos de 80% y al menos 2 intentos.</p>
      <ul class="conceptos-debiles">${conceptos
        .map((c) => `<li><span class="chip">${esc(c.concepto)}</span> <strong>${c.p}%</strong> <span class="tenue">(${c.a}/${c.t})</span> — ${c.subareas
          .map((s) => `<a href="#/guias/${encodeURIComponent(s)}">${esc(s)}</a>`)
          .join(", ")}</li>`)
        .join("")}</ul></div>` : ""}

    <div class="tarjeta"><h2>Historial de sesiones</h2>${
      st.simulacros.length
        ? `<div class="tabla"><table class="tabla-datos"><thead><tr><th>Fecha</th><th>Tipo</th><th>Resultado</th><th>Tiempo</th></tr></thead><tbody>${st.simulacros
            .slice(0, 40)
            .map((s) => `<tr><td>${new Date(s.fecha).toLocaleString("es-MX")}</td><td>${esc(s.modo)}</td><td>${s.aciertos}/${s.total} (${pct(s.aciertos, s.total)}%)</td><td>${fmtTiempo(s.duracion ?? 0)}</td></tr>`)
            .join("")}</tbody></table></div>`
        : `<p class="tenue">Sin sesiones todavía.</p>`
    }</div>

    <div class="tarjeta"><h2>Ajustes y respaldo</h2>
      <label class="check"><input type="checkbox" id="barajar" ${st.ajustes.barajar ? "checked" : ""}> Barajar el orden de las opciones (evita memorizar la letra)</label>
      <p>Tu progreso se guarda solo en este navegador. Exporta un respaldo para pasarlo a otra computadora.</p>
      <button class="btn" id="exportar">Exportar progreso</button>
      <label class="btn">Importar progreso<input type="file" id="importar" accept="application/json" hidden></label>
      <button class="btn btn-peligro" id="reiniciar">Reiniciar progreso</button></div>`;

  // Gráficas (necesitan el ancho real del contenedor)
  if (sesiones.length)
    graficaLinea($("#g-sesiones", cont), sesiones, {
      titulo: "Porcentaje de aciertos por sesión",
      referencias: [
        { v: 60, t: "≈Satisf." },
        { v: 80, t: "≈Sobres." },
      ],
    });
  if (hist.length) graficaColumnas($("#g-actividad", cont), actividadDiaria(30), { titulo: "Respuestas por día en los últimos 30 días" });
  const pesas = antesAhoraPorArea();
  if (pesas.length) graficaPesas($("#g-areas", cont), pesas, { titulo: "Aciertos por área: primeras contra últimas respuestas" });

  $("#barajar", cont).addEventListener("change", (e) => E.ajustes({ barajar: e.target.checked }));
  $("#exportar", cont).addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([E.exportar()], { type: "application/json" }));
    a.download = `egel-isoft-progreso-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  });
  $("#importar", cont).addEventListener("change", async (e) => {
    try {
      E.importar(await e.target.files[0].text());
      aviso("Progreso importado");
      vistaSeguimiento(cont);
    } catch (err) {
      aviso(err.message, "error");
    }
  });
  $("#reiniciar", cont).addEventListener("click", () => {
    if (confirm("Se borrarán tus respuestas, historial, repasos, simulacros y marcas (tus recursos, comandos y PDFs se conservan). ¿Continuar?")) {
      E.reiniciarProgreso();
      vistaSeguimiento(cont);
    }
  });
}

const ORDEN = { aprendiendo: 0, progreso: 1, nuevo: 2, dominada: 3 };
const ordenEstado = (d) => ORDEN[d.estado.id];
