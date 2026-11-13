// Gráficas SVG sin dependencias, accesibles (tooltip con mouse y teclado + vista de tabla).
// Colores por rol en CSS (--viz-*), validados para tema claro y oscuro.

const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs = {}, padre) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  padre?.append(n);
  return n;
};

function contenedor(raiz, titulo, alto) {
  raiz.classList.add("viz");
  raiz.replaceChildren();
  const ancho = Math.max(300, Math.floor(raiz.clientWidth || 600));
  const svg = el("svg", { viewBox: `0 0 ${ancho} ${alto}`, width: "100%", height: alto, role: "img", "aria-label": titulo, tabindex: "0" });
  raiz.append(svg);
  const tip = document.createElement("div");
  tip.className = "viz-tooltip";
  tip.hidden = true;
  raiz.append(tip);
  return { svg, tip, ancho };
}

/** Tooltip: valor primero (fuerte), etiqueta después (tenue). Contenido con textContent. */
function mostrarTip(tip, raiz, x, y, filas, titulo) {
  tip.replaceChildren();
  if (titulo) {
    const t = document.createElement("div");
    t.className = "viz-tip-titulo";
    t.textContent = titulo;
    tip.append(t);
  }
  for (const f of filas) {
    const fila = document.createElement("div");
    fila.className = "viz-tip-fila";
    if (f.color) {
      const k = document.createElement("span");
      k.className = "viz-tip-clave";
      k.style.background = f.color;
      fila.append(k);
    }
    const v = document.createElement("strong");
    v.textContent = f.valor;
    const e = document.createElement("span");
    e.textContent = ` ${f.etiqueta}`;
    fila.append(v, e);
    tip.append(fila);
  }
  tip.hidden = false;
  const maxX = raiz.clientWidth - tip.offsetWidth - 4;
  tip.style.left = `${Math.max(4, Math.min(maxX, x + 12))}px`;
  tip.style.top = `${Math.max(0, y - tip.offsetHeight - 8)}px`;
}

function ejeY(svg, m, ancho, alto, max, sufijo = "") {
  const pasos = 5;
  for (let i = 0; i <= pasos; i++) {
    const v = (max / pasos) * i;
    const y = m.t + (alto - m.t - m.b) * (1 - v / max);
    el("line", { x1: m.l, x2: ancho - m.r, y1: y, y2: y, class: i ? "viz-grid" : "viz-base" }, svg);
    el("text", { x: m.l - 6, y: y + 4, "text-anchor": "end", class: "viz-tick" }, svg).textContent = `${Math.round(v)}${sufijo}`;
  }
}

function tablaDatos(raiz, cabeceras, filas) {
  const d = document.createElement("details");
  d.className = "viz-tabla";
  const s = document.createElement("summary");
  s.textContent = "Ver como tabla";
  const t = document.createElement("table");
  t.className = "tabla-datos";
  const thead = t.createTHead().insertRow();
  for (const c of cabeceras) {
    const th = document.createElement("th");
    th.textContent = c;
    thead.append(th);
  }
  const tb = t.createTBody();
  for (const f of filas) {
    const r = tb.insertRow();
    for (const c of f) r.insertCell().textContent = c;
  }
  d.append(s, t);
  raiz.append(d);
}

/** Línea de % por sesión con líneas de referencia (umbral estimado de nivel). */
export function graficaLinea(raiz, datos, { titulo, referencias = [] }) {
  const alto = 240;
  const { svg, tip, ancho } = contenedor(raiz, titulo, alto);
  const m = { t: 14, r: 44, b: 26, l: 38 };
  const W = ancho - m.l - m.r;
  const H = alto - m.t - m.b;
  ejeY(svg, m, ancho, alto, 100, "%");
  for (const r of referencias) {
    const y = m.t + H * (1 - r.v / 100);
    el("line", { x1: m.l, x2: ancho - m.r, y1: y, y2: y, class: "viz-ref" }, svg);
    el("text", { x: ancho - m.r + 4, y: y + 4, class: "viz-tick" }, svg).textContent = r.t;
  }
  const x = (i) => m.l + (datos.length === 1 ? W / 2 : (W * i) / (datos.length - 1));
  const y = (v) => m.t + H * (1 - v / 100);
  if (datos.length > 1) el("path", { d: datos.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.p)}`).join(" "), class: "viz-linea s1" }, svg);
  const cruz = el("line", { y1: m.t, y2: alto - m.b, class: "viz-cruz", visibility: "hidden" }, svg);
  const puntos = datos.map((d, i) => el("circle", { cx: x(i), cy: y(d.p), r: datos.length > 40 ? 3 : 4, class: "viz-punto s1" }, svg));
  const ult = datos.at(-1);
  if (ult) el("text", { x: x(datos.length - 1), y: y(ult.p) - 10, "text-anchor": "middle", class: "viz-etiqueta" }, svg).textContent = `${ult.p}%`;
  // Etiquetas X: primera y última fecha
  const fmt = (f) => f.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  if (datos.length) {
    el("text", { x: x(0), y: alto - 6, "text-anchor": datos.length === 1 ? "middle" : "start", class: "viz-tick" }, svg).textContent = fmt(datos[0].fecha);
    if (datos.length > 1) el("text", { x: x(datos.length - 1), y: alto - 6, "text-anchor": "end", class: "viz-tick" }, svg).textContent = fmt(ult.fecha);
  }
  let activo = -1;
  const enfocar = (i) => {
    activo = Math.max(0, Math.min(datos.length - 1, i));
    const d = datos[activo];
    cruz.setAttribute("x1", x(activo));
    cruz.setAttribute("x2", x(activo));
    cruz.setAttribute("visibility", "visible");
    puntos.forEach((p, k) => p.classList.toggle("activo", k === activo));
    const escala = raiz.clientWidth / ancho;
    mostrarTip(tip, raiz, x(activo) * escala, y(d.p) * escala, [{ valor: `${d.p}%`, etiqueta: `(${d.aciertos}/${d.total})`, color: "var(--viz-s1)" }], `Sesión ${d.i} · ${d.etiqueta} · ${fmt(d.fecha)}`);
  };
  const ocultar = () => {
    tip.hidden = true;
    cruz.setAttribute("visibility", "hidden");
    puntos.forEach((p) => p.classList.remove("activo"));
  };
  const hit = el("rect", { x: m.l - 10, y: 0, width: W + 20, height: alto, fill: "transparent" }, svg);
  hit.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * ancho;
    enfocar(datos.length === 1 ? 0 : Math.round(((px - m.l) / W) * (datos.length - 1)));
  });
  hit.addEventListener("pointerleave", ocultar);
  svg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") enfocar(activo + 1);
    else if (e.key === "ArrowLeft") enfocar(activo < 0 ? datos.length - 1 : activo - 1);
    else if (e.key === "Escape") ocultar();
    else return;
    e.preventDefault();
  });
  svg.addEventListener("blur", ocultar);
  tablaDatos(raiz, ["Sesión", "Fecha", "Tipo", "Aciertos", "%"], datos.map((d) => [d.i, fmt(d.fecha), d.etiqueta, `${d.aciertos}/${d.total}`, `${d.p}%`]));
}

/** Columnas: respuestas por día. */
export function graficaColumnas(raiz, datos, { titulo }) {
  const alto = 200;
  const { svg, tip, ancho } = contenedor(raiz, titulo, alto);
  const m = { t: 14, r: 10, b: 26, l: 38 };
  const W = ancho - m.l - m.r;
  const H = alto - m.t - m.b;
  const maxReal = Math.max(1, ...datos.map((d) => d.n));
  const paso = maxReal <= 5 ? 1 : maxReal <= 25 ? 5 : maxReal <= 50 ? 10 : maxReal <= 250 ? 50 : 100;
  const max = Math.ceil(maxReal / paso) * paso;
  ejeY(svg, m, ancho, alto, max);
  const banda = W / datos.length;
  const bw = Math.min(24, Math.max(3, banda - 2));
  const fmt = (f) => f.toLocaleDateString("es-MX", { day: "numeric", month: "short" });
  const barras = datos.map((d, i) => {
    const h = (H * d.n) / max;
    const x0 = m.l + i * banda + (banda - bw) / 2;
    const y0 = m.t + H - h;
    const rr = Math.min(4, h, bw / 2);
    const g = el("g", { class: "viz-barra-g" }, svg);
    if (d.n)
      el("path", { d: `M${x0},${m.t + H} V${y0 + rr} Q${x0},${y0} ${x0 + rr},${y0} H${x0 + bw - rr} Q${x0 + bw},${y0} ${x0 + bw},${y0 + rr} V${m.t + H} Z`, class: "viz-barra s1" }, g);
    const hit = el("rect", { x: m.l + i * banda, y: m.t, width: banda, height: H, fill: "transparent" }, g);
    const ver = () => {
      g.classList.add("activo");
      const escala = raiz.clientWidth / ancho;
      mostrarTip(tip, raiz, (x0 + bw / 2) * escala, (y0 || m.t + H) * escala, [{ valor: `${d.n}`, etiqueta: `respuestas${d.n ? ` · ${Math.round((100 * d.ok) / d.n)}% aciertos` : ""}`, color: "var(--viz-s1)" }], fmt(d.fecha));
    };
    hit.addEventListener("pointerenter", ver);
    hit.addEventListener("pointerleave", () => ((tip.hidden = true), g.classList.remove("activo")));
    return { ver, g };
  });
  datos.forEach((d, i) => {
    const ultimo = datos.length - 1;
    if (i === ultimo || (i % 7 === 0 && ultimo - i >= 4))
      el("text", { x: m.l + i * banda + banda / 2, y: alto - 6, "text-anchor": "middle", class: "viz-tick" }, svg).textContent = fmt(d.fecha);
  });
  let activo = -1;
  svg.addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    barras[activo]?.g.classList.remove("activo");
    activo = Math.max(0, Math.min(datos.length - 1, activo + (e.key === "ArrowRight" ? 1 : -1)));
    barras[activo].ver();
  });
  svg.addEventListener("blur", () => (tip.hidden = true));
  tablaDatos(raiz, ["Día", "Respuestas", "% aciertos"], datos.filter((d) => d.n).map((d) => [fmt(d.fecha), d.n, `${Math.round((100 * d.ok) / d.n)}%`]));
}

/** Pesas (dumbbell): % por área en tus primeras vs. últimas respuestas. Dos series → leyenda. */
export function graficaPesas(raiz, datos, { titulo }) {
  const fila = 38;
  const alto = 34 + datos.length * fila + 22;
  const { svg, tip, ancho } = contenedor(raiz, titulo, alto);
  const m = { t: 34, r: 48, b: 22, l: Math.min(240, ancho * 0.38) };
  const W = ancho - m.l - m.r;
  const x = (v) => m.l + (W * v) / 100;
  // Leyenda (siempre presente con 2 series)
  const leyenda = [
    ["s2", "Tus primeras respuestas"],
    ["s1", "Tus últimas respuestas"],
  ];
  let lx = m.l;
  for (const [cls, txt] of leyenda) {
    el("circle", { cx: lx + 5, cy: 14, r: 5, class: `viz-punto ${cls}` }, svg);
    const t = el("text", { x: lx + 15, y: 18, class: "viz-leyenda" }, svg);
    t.textContent = txt;
    lx += 20 + txt.length * 6.8;
  }
  for (const v of [0, 50, 100]) {
    el("line", { x1: x(v), x2: x(v), y1: m.t - 6, y2: alto - m.b, class: v ? "viz-grid" : "viz-base" }, svg);
    el("text", { x: x(v), y: alto - 6, "text-anchor": "middle", class: "viz-tick" }, svg).textContent = `${v}%`;
  }
  datos.forEach((d, i) => {
    const y = m.t + i * fila + fila / 2;
    const g = el("g", { class: "viz-fila" }, svg);
    const nombre = el("text", { x: m.l - 10, y: y + 4, "text-anchor": "end", class: "viz-categoria" }, g);
    nombre.textContent = d.nombre.length > 34 ? d.nombre.slice(0, 33) + "…" : d.nombre;
    el("line", { x1: x(Math.min(d.antes, d.ahora)), x2: x(Math.max(d.antes, d.ahora)), y1: y, y2: y, class: "viz-conector" }, g);
    el("circle", { cx: x(d.antes), cy: y, r: 5, class: "viz-punto s2" }, g);
    el("circle", { cx: x(d.ahora), cy: y, r: 5, class: "viz-punto s1" }, g);
    el("text", { x: x(Math.max(d.antes, d.ahora)) + 10, y: y + 4, class: "viz-etiqueta" }, g).textContent = `${d.ahora}%`;
    const hit = el("rect", { x: 0, y: y - fila / 2, width: ancho, height: fila, fill: "transparent" }, g);
    hit.addEventListener("pointerenter", () => {
      g.classList.add("activo");
      const escala = raiz.clientWidth / ancho;
      mostrarTip(tip, raiz, x(d.ahora) * escala, y * escala, [
        { valor: `${d.ahora}%`, etiqueta: `últimas ${d.n}`, color: "var(--viz-s1)" },
        { valor: `${d.antes}%`, etiqueta: `primeras ${d.n}`, color: "var(--viz-s2)" },
      ], d.nombre);
    });
    hit.addEventListener("pointerleave", () => ((tip.hidden = true), g.classList.remove("activo")));
  });
  tablaDatos(raiz, ["Área", "Primeras respuestas", "Últimas respuestas", "Cambio"], datos.map((d) => [d.nombre, `${d.antes}%`, `${d.ahora}%`, `${d.ahora - d.antes >= 0 ? "+" : ""}${d.ahora - d.antes}`]));
}
