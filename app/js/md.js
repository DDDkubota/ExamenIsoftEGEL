// Markdown mínimo (encabezados, listas, tablas, código, citas, enlaces, negritas).
// Suficiente para las guías de contenido/guias/*.md sin dependencias externas.

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function enLinea(t) {
  return esc(t)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
      const seguro = /^(https?:|#|\.{0,2}\/)/.test(url) ? url : "#";
      const ext = /^https?:/.test(seguro) ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${seguro}"${ext}>${txt}</a>`;
    });
}

export function md(fuente) {
  const lineas = fuente.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (/^```/.test(l)) {
      const buf = [];
      i++;
      while (i < lineas.length && !/^```/.test(lineas[i])) buf.push(lineas[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    const h = l.match(/^(#{1,4})\s+(.*)/);
    if (h) {
      out.push(`<h${h[1].length + 1}>${enLinea(h[2])}</h${h[1].length + 1}>`);
      i++;
      continue;
    }
    if (/^\|/.test(l)) {
      const filas = [];
      while (i < lineas.length && /^\|/.test(lineas[i])) filas.push(lineas[i++]);
      const celdas = (f) => f.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const cuerpo = filas.filter((f, k) => !(k === 1 && /^[\s|:-]+$/.test(f)));
      const [cab, ...resto] = cuerpo;
      out.push(
        `<div class="tabla"><table><thead><tr>${celdas(cab).map((c) => `<th>${enLinea(c)}</th>`).join("")}</tr></thead><tbody>` +
          resto.map((f) => `<tr>${celdas(f).map((c) => `<td>${enLinea(c)}</td>`).join("")}</tr>`).join("") +
          "</tbody></table></div>",
      );
      continue;
    }
    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lineas.length && /^>\s?/.test(lineas[i])) buf.push(lineas[i++].replace(/^>\s?/, ""));
      out.push(`<blockquote>${enLinea(buf.join(" "))}</blockquote>`);
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(l)) {
      const ordenada = /^\s*\d+\./.test(l);
      const items = [];
      while (i < lineas.length && /^\s*([-*]|\d+\.)\s+/.test(lineas[i])) {
        const sangria = /^\s{2,}/.test(lineas[i]);
        const t = lineas[i++].replace(/^\s*([-*]|\d+\.)\s+/, "");
        if (sangria && items.length) items[items.length - 1].sub.push(t);
        else items.push({ t, sub: [] });
      }
      const tag = ordenada ? "ol" : "ul";
      out.push(
        `<${tag}>${items
          .map((it) => `<li>${enLinea(it.t)}${it.sub.length ? `<ul>${it.sub.map((s) => `<li>${enLinea(s)}</li>`).join("")}</ul>` : ""}</li>`)
          .join("")}</${tag}>`,
      );
      continue;
    }
    if (!l.trim()) {
      i++;
      continue;
    }
    const buf = [lineas[i++]]; // siempre consume al menos una línea (evita ciclos infinitos)
    while (i < lineas.length && lineas[i].trim() && !/^(#{1,4}\s|```|\||>|\s*([-*]|\d+\.)\s)/.test(lineas[i])) buf.push(lineas[i++]);
    out.push(`<p>${enLinea(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}
