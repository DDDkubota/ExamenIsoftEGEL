import { cargar, D } from "./datos.js";
import { vistaPractica, vistaSimulacro, vistaExamen, detenerSimulacro, detenerPractica } from "./examen.js";
import { vistaInicio, vistaGuias, vistaBiblioteca, vistaPlan } from "./vistas.js";
import { vistaSeguimiento } from "./seguimiento.js";
import { vistaComandos } from "./comandos.js";
import { $, $$, esc } from "./ui.js";

// Para agregar una sección: crea la vista y regístrala aquí + un enlace en index.html.
const RUTAS = {
  inicio: vistaInicio,
  practica: vistaPractica,
  simulacro: vistaSimulacro,
  examen: vistaExamen,
  guias: vistaGuias,
  biblioteca: vistaBiblioteca,
  comandos: vistaComandos,
  plan: vistaPlan,
  seguimiento: vistaSeguimiento,
  progreso: vistaSeguimiento, // alias de versiones anteriores
};

const cont = $("#vista");

function parsear() {
  const [ruta, query = ""] = location.hash.replace(/^#\/?/, "").split("?");
  const [nombre, ...resto] = ruta.split("/");
  return { nombre: nombre || "inicio", id: resto.length ? decodeURIComponent(resto.join("/")) : undefined, params: Object.fromEntries(new URLSearchParams(query)) };
}

async function render() {
  const { nombre, id, params } = parsear();
  detenerSimulacro();
  detenerPractica();
  const vista = RUTAS[nombre] ?? vistaInicio;
  const actual = nombre === "progreso" ? "seguimiento" : nombre;
  $$(".nav a").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === `#/${actual}`));
  try {
    await vista(cont, params, id);
  } catch (e) {
    console.error(e);
    cont.innerHTML = `<div class="tarjeta vacio">Ocurrió un error: ${esc(e.message)}</div>`;
  }
  cont.focus({ preventScroll: true });
  if (!params.id && !params.quiz) window.scrollTo({ top: 0 });
}

// Si sales de un simulacro, se pausa y se guarda automáticamente (detenerSimulacro).
window.addEventListener("hashchange", render);

// Un enlace al mismo hash no dispara hashchange: lo re-renderizamos manualmente («Otra ronda igual»).
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#/"]');
  if (a && a.getAttribute("href") === location.hash) {
    e.preventDefault();
    render();
  }
});

// Menú móvil
$("#menu-btn").addEventListener("click", () => {
  const nav = $(".nav");
  const abierto = nav.classList.toggle("abierto");
  $("#menu-btn").setAttribute("aria-expanded", abierto);
});
$(".nav").addEventListener("click", (e) => e.target.closest("a") && $(".nav").classList.remove("abierto"));

// Tema claro/oscuro
const temaGuardado = localStorage.getItem("egel-tema");
if (temaGuardado) document.documentElement.dataset.tema = temaGuardado;
$("#tema-btn").addEventListener("click", () => {
  const oscuro = (document.documentElement.dataset.tema ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro")) !== "oscuro";
  document.documentElement.dataset.tema = oscuro ? "oscuro" : "claro";
  localStorage.setItem("egel-tema", document.documentElement.dataset.tema);
});

try {
  await cargar();
  $("#repo-link").href = D.manifest.repositorio;
  $("#pie-stats").textContent = `${D.preguntas.length} preguntas · ${D.recursos.length} recursos · temario ${D.temario.nombre}`;
  render();
} catch (e) {
  console.error(e);
  cont.innerHTML = `<div class="tarjeta vacio"><h2>No se pudo cargar el contenido</h2><p>${esc(e.message)}</p>
    <p>Si abriste el archivo directamente (<code>file://</code>), el navegador bloquea la carga de JSON. Ejecuta <code>npm run dev</code>
    (o <code>python3 -m http.server</code> en la raíz del repo) y abre <code>http://localhost:8080/app/</code>.</p></div>`;
}
