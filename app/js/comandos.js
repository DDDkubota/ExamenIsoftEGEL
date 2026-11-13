// Comandos por rama tecnológica: catálogo, comandos propios, quiz y generador de tu propio repositorio.
import { D } from "./datos.js";
import { E } from "./almacen.js";
import { $, $$, esc, aviso, barajar, pct } from "./ui.js";

const PERSONAL = { id: "personal", nombre: "Mis comandos", icono: "⭐", descripcion: "Comandos que agregaste tú (se guardan en este navegador).", subareas: [] };

function ramas() {
  const mios = E.get().comandosUsuario;
  const lista = D.ramas.map((r) => ({ ...r, comandos: [...r.comandos, ...mios.filter((c) => c.rama === r.id).map((c) => ({ ...c, mio: true }))] }));
  const sueltos = mios.filter((c) => !D.ramas.some((r) => r.id === c.rama));
  if (sueltos.length) lista.push({ ...PERSONAL, comandos: sueltos.map((c) => ({ ...c, mio: true })) });
  return lista;
}

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    aviso("Copiado al portapapeles");
  } catch {
    aviso("No se pudo copiar; selecciona el texto manualmente", "error");
  }
}

function descargar(nombre, contenido, tipo = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  a.download = nombre;
  a.click();
}

export function vistaComandos(cont, params) {
  const todas = ramas();
  const rama = params.rama ?? "";
  const q = (params.q ?? "").toLowerCase();
  const visibles = todas
    .filter((r) => !rama || r.id === rama)
    .map((r) => ({ ...r, comandos: r.comandos.filter((c) => !q || `${c.comando} ${c.descripcion} ${c.ejemplo ?? ""}`.toLowerCase().includes(q)) }))
    .filter((r) => r.comandos.length);
  const total = todas.reduce((a, r) => a + r.comandos.length, 0);

  cont.innerHTML = `<h1>Comandos por rama</h1>
    <p class="intro">${total} comandos de ${todas.length} ramas para tener a la mano en ejercicios, prácticas y preguntas del área 3 (entornos, gestión de datos, plataformas).
    Agrega los tuyos, ponte a prueba con el quiz y genera tu propio repositorio con esta herramienta.</p>
    <nav class="chips-ramas" aria-label="Ramas">
      <a class="chip ${!rama ? "activa" : ""}" href="#/comandos${q ? `?q=${encodeURIComponent(q)}` : ""}">Todas</a>
      ${todas.map((r) => `<a class="chip ${rama === r.id ? "activa" : ""}" href="#/comandos?rama=${r.id}${q ? `&q=${encodeURIComponent(q)}` : ""}">${r.icono ?? ""} ${esc(r.nombre)} <span class="tenue">${r.comandos.length}</span></a>`).join("")}
    </nav>
    <form class="tarjeta form-config" id="buscar"><label>Buscar comando<input type="search" name="q" value="${esc(params.q ?? "")}" placeholder="merge, JOIN, docker run, permisos…"></label></form>

    ${visibles
      .map(
        (r) => `<section class="tarjeta rama"><h2>${r.icono ?? ""} ${esc(r.nombre)}</h2><p class="tenue">${esc(r.descripcion ?? "")}
          ${r.subareas?.length ? ` · Subáreas: ${r.subareas.map((s) => `<a href="#/guias/${encodeURIComponent(s)}">${esc(s)}</a>`).join(", ")}` : ""}</p>
          <ul class="lista-comandos">${r.comandos
            .map(
              (c) => `<li><div class="cmd-linea"><pre class="cmd"><code>${esc(c.comando)}</code></pre>
                <button class="btn btn-mini" data-copiar="${esc(c.comando)}" aria-label="Copiar comando">📋</button>
                ${c.mio ? `<button class="btn btn-mini btn-peligro" data-borrar="${esc(c.id)}" aria-label="Eliminar comando">🗑</button>` : ""}</div>
                <p>${esc(c.descripcion)}${c.ejemplo ? `<br><span class="tenue">Ejemplo:</span> <code>${esc(c.ejemplo)}</code>` : ""}${c.mio ? ` <span class="chip">mío</span>` : ""}</p></li>`,
            )
            .join("")}</ul>
          <a class="btn btn-mini" href="#/comandos?rama=${r.id}&quiz=1">🎯 Quiz de ${esc(r.nombre)}</a></section>`,
      )
      .join("") || `<div class="tarjeta vacio">Sin resultados para «${esc(params.q)}».</div>`}

    <div id="quiz"></div>

    <div class="rejilla-2">
      <section class="tarjeta" id="agregar"><h2>➕ Agregar un comando</h2>
        <form id="form-cmd" class="form-col">
          <label>Rama<select name="rama">${D.ramas.map((r) => `<option value="${r.id}" ${rama === r.id ? "selected" : ""}>${esc(r.nombre)}</option>`).join("")}<option value="personal">Otra / personal</option></select></label>
          <label>Comando*<textarea name="comando" rows="2" required placeholder="git log --author=&quot;Ana&quot;"></textarea></label>
          <label>¿Qué hace?*<input name="descripcion" required></label>
          <label>Ejemplo (opcional)<input name="ejemplo"></label>
          <button class="btn btn-primario">Guardar comando</button>
        </form>
        <p class="tenue">Para proponerlo a todos, exporta tus comandos y abre un Pull Request en <code>contenido/comandos/</code>.</p>
        <button class="btn" id="exportar-cmd">Exportar mis comandos (JSON)</button>
      </section>
      <section class="tarjeta" id="generador"><h2>🧰 Genera tu propio repositorio</h2>
        <p class="tenue">Crea tu copia de esta herramienta (con tus comandos y recursos) para estudiar en grupo, adaptarla a tu escuela o publicarla en GitHub Pages.</p>
        <form id="form-repo" class="form-col">
          <label>Tu usuario de GitHub*<input name="usuario" required pattern="[A-Za-z0-9][A-Za-z0-9\\-]{0,38}" placeholder="mi-usuario"></label>
          <label>Nombre del repositorio*<input name="repo" required pattern="[A-Za-z0-9._\\-]{1,100}" value="mi-egel-isoft"></label>
          <label>Visibilidad<select name="vis"><option value="public">Público</option><option value="private">Privado</option></select></label>
          <label>Método<select name="metodo">
            <option value="copia">Copia limpia (recomendado, siempre funciona)</option>
            <option value="plantilla">Desde plantilla (requiere que el repo original sea «template»)</option>
            <option value="fork">Fork (para contribuir de vuelta al original)</option></select></label>
          <label class="check"><input type="checkbox" name="pages" checked> Publicar el simulador en GitHub Pages</label>
          <label class="check"><input type="checkbox" name="mios" checked> Incluir mis comandos y recursos</label>
          <button class="btn btn-primario">Generar comandos</button>
        </form>
        <div id="script-repo"></div>
      </section>
    </div>`;

  $$("[data-copiar]", cont).forEach((b) => b.addEventListener("click", () => copiar(b.dataset.copiar)));
  $$("[data-borrar]", cont).forEach((b) =>
    b.addEventListener("click", () => {
      if (!confirm("¿Eliminar este comando tuyo?")) return;
      E.eliminarComando(b.dataset.borrar);
      vistaComandos(cont, params);
    }),
  );
  let espera;
  $("#buscar", cont).addEventListener("submit", (e) => e.preventDefault());
  $("#buscar", cont).elements.q.addEventListener("input", (e) => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const p = new URLSearchParams();
      if (rama) p.set("rama", rama);
      if (e.target.value) p.set("q", e.target.value);
      location.hash = `#/comandos${p.size ? `?${p}` : ""}`;
    }, 400);
  });

  $("#form-cmd", cont).addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    E.agregarComando({ rama: f.get("rama"), comando: f.get("comando").trim(), descripcion: f.get("descripcion").trim(), ejemplo: f.get("ejemplo").trim() || undefined });
    aviso("Comando guardado");
    vistaComandos(cont, { rama: f.get("rama") === "personal" ? "personal" : f.get("rama") });
  });
  $("#exportar-cmd", cont).addEventListener("click", () => {
    const mios = E.get().comandosUsuario;
    if (!mios.length) return aviso("Aún no agregas comandos", "error");
    descargar("mis-comandos.json", JSON.stringify(archivoComandosPersonales(), null, 2));
  });
  $("#form-repo", cont).addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    pintarScript($("#script-repo", cont), {
      usuario: f.get("usuario").trim(),
      repo: f.get("repo").trim(),
      vis: f.get("vis"),
      metodo: f.get("metodo"),
      pages: !!f.get("pages"),
      mios: !!f.get("mios"),
    });
  });

  if (params.quiz && rama) quiz($("#quiz", cont), todas.find((r) => r.id === rama));
  if (params.quiz) $("#quiz", cont).scrollIntoView({ block: "start" });
}

/** Mis comandos en el mismo formato que contenido/comandos/*.json */
function archivoComandosPersonales() {
  return {
    id: "personal",
    nombre: "Mis comandos",
    icono: "⭐",
    descripcion: "Comandos agregados por el dueño de este repositorio.",
    subareas: [],
    comandos: E.get().comandosUsuario.map(({ comando, descripcion, ejemplo, rama }) => ({ comando, descripcion, ...(ejemplo ? { ejemplo } : {}), ...(rama !== "personal" ? { nota: `Rama: ${rama}` } : {}) })),
  };
}

function archivoRecursosPersonales() {
  const slug = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  return E.get().recursosUsuario.map(({ pdfId, mio, id, ...r }) => ({ ...r, id: `mio-${slug(r.titulo)}` }));
}

// ---------------- Quiz de comandos ----------------

function quiz(raiz, rama) {
  const candidatos = rama.comandos.filter((c) => c.descripcion);
  if (candidatos.length < 3) {
    raiz.innerHTML = `<div class="tarjeta vacio">Se necesitan al menos 3 comandos en la rama para el quiz.</div>`;
    return;
  }
  const preguntas = barajar(candidatos).slice(0, 10).map((c) => ({ c, opciones: barajar([c, ...barajar(candidatos.filter((x) => x !== c)).slice(0, 2)]) }));
  let i = 0;
  let aciertos = 0;
  const pintar = (elegida = null) => {
    const { c, opciones } = preguntas[i];
    raiz.innerHTML = `<section class="tarjeta quiz" aria-live="polite"><h2>🎯 Quiz: ${esc(rama.nombre)} <span class="tenue">(${i + 1}/${preguntas.length} · ${aciertos} aciertos)</span></h2>
      <p class="pregunta">¿Qué comando sirve para lo siguiente?<br><em>${esc(c.descripcion)}</em></p>
      <div class="opciones">${opciones
        .map((o, k) => {
          const cls = elegida === null ? "" : o === c ? "correcta" : k === elegida ? "incorrecta" : "";
          return `<button class="opcion ${cls}" data-k="${k}" ${elegida !== null ? "disabled" : ""}><span class="letra">${"ABC"[k]})</span><code>${esc(o.comando)}</code></button>`;
        })
        .join("")}</div>
      ${elegida !== null ? `<p>${opciones[elegida] === c ? "✔ ¡Correcto!" : `✘ La respuesta es <code>${esc(c.comando)}</code>.`} ${c.ejemplo ? `Ejemplo: <code>${esc(c.ejemplo)}</code>` : ""}</p>
        <button class="btn btn-primario" id="q-sig">${i + 1 < preguntas.length ? "Siguiente →" : "Ver resultado"}</button>` : ""}</section>`;
    $$("[data-k]", raiz).forEach((b) =>
      b.addEventListener("click", () => {
        const k = Number(b.dataset.k);
        if (opciones[k] === c) aciertos++;
        pintar(k);
      }),
    );
    $("#q-sig", raiz)?.addEventListener("click", () => {
      i++;
      if (i < preguntas.length) pintar();
      else {
        E.agregarSimulacro({ fecha: new Date().toISOString(), modo: `Quiz de comandos: ${rama.nombre}`, tipo: "comandos", total: preguntas.length, aciertos, duracion: 0, porArea: {} });
        raiz.innerHTML = `<section class="tarjeta"><h2>Resultado del quiz: ${aciertos}/${preguntas.length} (${pct(aciertos, preguntas.length)}%)</h2>
          <a class="btn btn-primario" href="#/comandos?rama=${rama.id}&quiz=1">Otra ronda</a></section>`;
      }
    });
    $("#q-sig", raiz)?.focus();
  };
  pintar();
}

// ---------------- Generador de repositorio ----------------

function pintarScript(raiz, { usuario, repo, vis, metodo, pages, mios }) {
  if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(usuario) || !/^[A-Za-z0-9._-]{1,100}$/.test(repo)) {
    aviso("Usuario o nombre de repositorio inválido", "error");
    return;
  }
  const origen = D.manifest.repositorio.replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "");
  const rama = D.manifest.ramaPrincipal;
  const hayComandos = mios && E.get().comandosUsuario.length > 0;
  const hayRecursos = mios && E.get().recursosUsuario.length > 0;
  const L = [];
  L.push("#!/usr/bin/env bash", "# Crea tu propio repositorio de estudio a partir de " + origen, "# Requisitos: git, node >= 18 y GitHub CLI (gh) con sesión iniciada: gh auth login", "set -euo pipefail", "");
  L.push(`USUARIO="${usuario}"`, `REPO="${repo}"`, `DESCARGAS="\${DESCARGAS:-$HOME/Descargas}"   # carpeta donde el navegador guardó los JSON`, "");
  if (metodo === "copia") {
    L.push("# 1) Copia limpia de la herramienta (sin el historial del original)");
    L.push(`git clone --depth 1 https://github.com/${origen}.git "$REPO"`, `cd "$REPO"`, "rm -rf .git", `git init -b ${rama}`, "");
  } else if (metodo === "plantilla") {
    L.push("# 1) Crear desde plantilla (el dueño del original debe marcarlo como «Template repository»)");
    L.push(`gh repo create "$USUARIO/$REPO" --template ${origen} --${vis} --clone`, `cd "$REPO"`, "");
  } else {
    L.push("# 1) Fork para contribuir de vuelta con Pull Requests");
    L.push(`gh repo fork ${origen} --clone --fork-name "$REPO"`, `cd "$REPO"`, "");
  }
  if (hayComandos || hayRecursos) {
    L.push("# 2) Tus comandos y recursos personales (descárgalos con los botones de abajo)");
    if (hayComandos) L.push(`[ -f "$DESCARGAS/mis-comandos.json" ] && cp "$DESCARGAS/mis-comandos.json" contenido/comandos/personal.json`);
    if (hayRecursos) L.push(`[ -f "$DESCARGAS/mis-recursos.json" ] && cp "$DESCARGAS/mis-recursos.json" contenido/mis-recursos.json`);
  }
  L.push("# 3) Apunta el manifest a tu repositorio y registra tus archivos");
  L.push(
    `node -e '
const fs = require("fs");
const f = "contenido/manifest.json";
const m = JSON.parse(fs.readFileSync(f, "utf8"));
m.repositorio = "https://github.com/" + process.argv[1] + "/" + process.argv[2];
if (fs.existsSync("contenido/comandos/personal.json") && !m.comandos.includes("comandos/personal.json")) m.comandos.push("comandos/personal.json");
if (fs.existsSync("contenido/mis-recursos.json")) {
  const r = JSON.parse(fs.readFileSync("contenido/recursos.json", "utf8"));
  const ids = new Set(r.recursos.map((x) => x.id));
  for (const x of JSON.parse(fs.readFileSync("contenido/mis-recursos.json", "utf8"))) if (!ids.has(x.id)) r.recursos.push(x);
  fs.writeFileSync("contenido/recursos.json", JSON.stringify(r, null, 2) + "\\n");
  fs.unlinkSync("contenido/mis-recursos.json");
}
fs.writeFileSync(f, JSON.stringify(m, null, 2) + "\\n");
' "$USUARIO" "$REPO"`,
    "",
  );
  L.push("# 4) Valida que todo esté bien", "node scripts/validar.mjs", "");
  L.push("# 5) Publica en GitHub");
  if (metodo === "copia") {
    L.push('git add -A && git commit -m "Mi repositorio de estudio EGEL Plus ISOFT"', `gh repo create "$USUARIO/$REPO" --${vis} --source . --push`);
  } else {
    L.push(`git add -A && git commit -m "Personaliza mi copia" || true`, `git push origin ${rama}`);
  }
  if (pages) {
    L.push("", "# 6) Activa GitHub Pages con el workflow incluido (.github/workflows/pages.yml)");
    if (vis === "private") L.push("# Nota: Pages en repos privados requiere un plan de pago de GitHub.");
    L.push(`gh api -X POST "repos/$USUARIO/$REPO/pages" -f build_type=workflow || echo "Actívalo en Settings → Pages → Source: GitHub Actions"`);
    L.push(`gh workflow run pages.yml -R "$USUARIO/$REPO" || true`);
    L.push(`echo "Tu simulador quedará en: https://$USUARIO.github.io/$REPO/"`);
  }
  L.push("", "# Para probarlo localmente:", "npm run dev   # → http://localhost:8080/app/");
  const script = L.join("\n");

  raiz.innerHTML = `<h3>Tu script</h3>
    <pre class="codigo script"><code>${esc(script)}</code></pre>
    <p class="acciones"><button class="btn btn-primario" id="copiar-script">📋 Copiar</button>
    <button class="btn" id="bajar-script">⬇ Descargar crear-mi-repo.sh</button>
    ${hayComandos ? `<button class="btn" id="bajar-cmd">⬇ mis-comandos.json</button>` : ""}
    ${hayRecursos ? `<button class="btn" id="bajar-rec">⬇ mis-recursos.json</button>` : ""}</p>
    <p class="tenue">Ejecútalo con <code>bash crear-mi-repo.sh</code>. Revisa el script antes de correrlo: crea un repositorio en tu cuenta de GitHub.</p>`;
  $("#copiar-script", raiz).addEventListener("click", () => copiar(script));
  $("#bajar-script", raiz).addEventListener("click", () => descargar("crear-mi-repo.sh", script, "text/x-shellscript"));
  $("#bajar-cmd", raiz)?.addEventListener("click", () => descargar("mis-comandos.json", JSON.stringify(archivoComandosPersonales(), null, 2)));
  $("#bajar-rec", raiz)?.addEventListener("click", () => descargar("mis-recursos.json", JSON.stringify(archivoRecursosPersonales(), null, 2)));
}
