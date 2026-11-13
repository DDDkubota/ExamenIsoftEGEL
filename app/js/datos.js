// Carga del contenido declarado en contenido/manifest.json.
// Todo lo que la app muestra sale de ahí: agregar un temario, banco o recurso no requiere tocar código.

const BASE_CONTENIDO = new URL("../../contenido/", import.meta.url);
const BASE_REPO = new URL("../../", import.meta.url);

async function json(rel) {
  const r = await fetch(new URL(rel, BASE_CONTENIDO), { cache: "no-cache" });
  if (!r.ok) throw new Error(`No se pudo cargar ${rel} (${r.status})`);
  return r.json();
}

export async function texto(rel) {
  const r = await fetch(new URL(rel, BASE_CONTENIDO), { cache: "no-cache" });
  if (!r.ok) throw new Error(`No se pudo cargar ${rel}`);
  return r.text();
}

export const D = {
  manifest: null,
  temario: null,
  secciones: [],
  areas: new Map(), // id → área (con seccion)
  subareas: new Map(), // id → subárea (con area, seccion)
  preguntas: [],
  porId: new Map(),
  estimulos: new Map(),
  recursos: [],
  recursosPorId: new Map(),
  guias: {},
  bancos: [], // etiquetas de banco ("base", "extendido", …)
  ramas: [], // catálogo de comandos por rama tecnológica
};

export async function cargar() {
  const manifest = await json("manifest.json");
  const t = manifest.temarios.find((x) => x.id === manifest.temarioActivo) ?? manifest.temarios[0];
  const [temario, recursosDoc, ramas, ...bancos] = await Promise.all([
    json(t.archivo),
    json(manifest.recursos),
    Promise.all((manifest.comandos ?? []).map(json)),
    ...t.bancos.map(json),
  ]);
  D.ramas = ramas;

  D.manifest = manifest;
  D.temario = temario;
  D.guias = t.guias ?? {};
  D.secciones = temario.secciones;
  for (const sec of temario.secciones)
    for (const area of sec.areas) {
      D.areas.set(area.id, { ...area, seccion: sec.id });
      for (const s of area.subareas) D.subareas.set(s.id, { ...s, area: area.id, seccion: sec.id });
    }

  for (const b of bancos) {
    const banco = b.banco ?? "base";
    if (!D.bancos.includes(banco)) D.bancos.push(banco);
    for (const e of b.estimulos ?? []) D.estimulos.set(e.id, e);
    for (const p of b.preguntas) {
      const sub = D.subareas.get(p.subarea);
      const q = { ...p, banco, area: sub?.area, seccion: sub?.seccion };
      D.preguntas.push(q);
      D.porId.set(q.id, q);
    }
  }

  D.recursos = recursosDoc.recursos;
  D.tiposRecurso = recursosDoc.tipos;
  for (const r of D.recursos) D.recursosPorId.set(r.id, r);
  return D;
}

// En GitHub Pages solo se publica la app + contenido; los PDFs del repo se abren desde GitHub.
const EN_PAGES = location.hostname.endsWith("github.io");
export function urlArchivo(ruta) {
  const enc = ruta.split("/").map(encodeURIComponent).join("/");
  if (EN_PAGES && D.manifest) return `${D.manifest.repositorio}/blob/${D.manifest.ramaPrincipal}/${enc}`;
  return new URL(enc, BASE_REPO).href;
}

export const urlEditarGitHub = (rutaEnContenido) =>
  `${D.manifest.repositorio}/edit/${D.manifest.ramaPrincipal}/contenido/${rutaEnContenido}`;

export function preguntasDe({ seccion, area, subarea, banco } = {}) {
  return D.preguntas.filter(
    (p) =>
      (!seccion || p.seccion === seccion) &&
      (!area || p.area === area) &&
      (!subarea || p.subarea === subarea) &&
      (!banco || p.banco === banco),
  );
}

export function guiaDe(id) {
  if (D.guias[id]) return D.guias[id];
  const sub = D.subareas.get(id);
  return sub ? D.guias[sub.area] : null;
}

export function recursosDe(subareaId) {
  const sub = D.subareas.get(subareaId);
  const area = sub?.area ?? subareaId;
  const exactos = D.recursos.filter((r) => r.subareas?.includes(subareaId));
  const deArea = D.recursos.filter((r) => !r.subareas?.length && r.areas?.includes(area));
  return [...exactos, ...deArea];
}
