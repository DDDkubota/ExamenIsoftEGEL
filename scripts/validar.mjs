#!/usr/bin/env node
// Valida todo el contenido declarado en contenido/manifest.json.
// Uso: node scripts/validar.mjs   (sin dependencias)
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENIDO = join(RAIZ, "contenido");
const FORMATOS = ["cuestionamiento-directo", "completamiento", "ordenamiento", "multirreactivo"];
const NIVELES = ["satisfactorio", "sobresaliente"];

const errores = [];
const avisos = [];
const err = (donde, msg) => errores.push(`✗ ${donde}: ${msg}`);
const aviso = (donde, msg) => avisos.push(`! ${donde}: ${msg}`);

function leerJSON(ruta) {
  try {
    return JSON.parse(readFileSync(ruta, "utf8"));
  } catch (e) {
    err(ruta.replace(RAIZ + "/", ""), `JSON inválido: ${e.message}`);
    return null;
  }
}
// Los nombres de archivo pueden venir en NFC o NFD (macOS); probamos ambas formas.
const existe = (rel) => [rel, rel.normalize("NFC"), rel.normalize("NFD")].some((r) => existsSync(join(RAIZ, r)));

const manifest = leerJSON(join(CONTENIDO, "manifest.json"));
if (!manifest) finalizar();

// ---------- Recursos ----------
const recursosDoc = leerJSON(join(CONTENIDO, manifest.recursos));
const recursos = new Map();
const tiposValidos = new Set(recursosDoc?.tipos ?? []);
const areasValidas = new Set();

// ---------- Temarios ----------
const idsPreguntas = new Set();
const resumen = [];

for (const t of manifest.temarios) {
  const temario = leerJSON(join(CONTENIDO, t.archivo));
  if (!temario) continue;
  if (temario.id !== t.id) err(t.archivo, `id «${temario.id}» no coincide con el manifest «${t.id}»`);
  const opciones = temario.formato?.opcionesPorReactivo ?? 3;

  const subareas = new Map();
  for (const sec of temario.secciones) {
    let suma = 0;
    for (const area of sec.areas) {
      areasValidas.add(area.id);
      for (const s of area.subareas) {
        if (subareas.has(s.id)) err(t.archivo, `subárea duplicada ${s.id}`);
        subareas.set(s.id, { ...s, area: area.id, seccion: sec.id, preguntas: 0 });
        suma += s.reactivos;
      }
    }
    if (suma !== sec.reactivos) err(t.archivo, `sección ${sec.id}: la suma de subáreas (${suma}) ≠ ${sec.reactivos}`);
  }

  for (const [clave, ruta] of Object.entries(t.guias ?? {})) {
    if (!existsSync(join(CONTENIDO, ruta))) err("manifest.guias", `no existe ${ruta} (${clave})`);
    else if (clave !== "estrategias" && !subareas.has(clave) && !areasValidas.has(clave))
      aviso("manifest.guias", `«${clave}» no es subárea ni área del temario`);
  }

  const bancos = t.bancos.map((ruta) => [ruta, leerJSON(join(CONTENIDO, ruta))]).filter(([, b]) => b);
  const estimulos = new Set();
  for (const [ruta, b] of bancos)
    for (const e of b.estimulos ?? []) {
      if (estimulos.has(e.id)) err(ruta, `estímulo duplicado ${e.id}`);
      estimulos.add(e.id);
      if (!e.texto) err(ruta, `estímulo ${e.id} sin texto`);
    }
  const porBanco = {};
  for (const [rutaBanco, banco] of bancos) {
    if (banco.temario !== t.id) err(rutaBanco, `temario «${banco.temario}» ≠ «${t.id}»`);
    if (banco.banco !== undefined && !/^[a-z0-9-]+$/.test(banco.banco)) err(rutaBanco, "«banco» debe ser minúsculas-con-guiones");
    const etiqueta = banco.banco ?? "base";
    porBanco[etiqueta] = (porBanco[etiqueta] ?? 0) + banco.preguntas.length;

    for (const p of banco.preguntas) {
      const donde = `${rutaBanco} › ${p.id ?? "(sin id)"}`;
      if (!p.id) { err(donde, "falta id"); continue; }
      if (idsPreguntas.has(p.id)) err(donde, "id duplicado");
      idsPreguntas.add(p.id);
      const sub = subareas.get(p.subarea);
      if (!sub) err(donde, `subárea «${p.subarea}» no existe en el temario`);
      else sub.preguntas++;
      if (!FORMATOS.includes(p.formato)) err(donde, `formato «${p.formato}» inválido (${FORMATOS.join(", ")})`);
      if (p.nivel && !NIVELES.includes(p.nivel)) err(donde, `nivel «${p.nivel}» inválido`);
      if (!p.pregunta) err(donde, "falta «pregunta»");
      if (!Array.isArray(p.opciones) || p.opciones.length !== opciones)
        err(donde, `debe tener exactamente ${opciones} opciones`);
      else {
        p.opciones.forEach((o, i) => {
          if (!o.texto) err(donde, `opción ${i} sin texto`);
          if (!o.explicacion) err(donde, `opción ${i} sin explicación (explica por qué es correcta/incorrecta)`);
        });
        const textos = new Set(p.opciones.map((o) => o.texto.trim()));
        if (textos.size !== p.opciones.length) err(donde, "hay opciones repetidas");
      }
      if (!Number.isInteger(p.correcta) || p.correcta < 0 || p.correcta >= (p.opciones?.length ?? 0))
        err(donde, `«correcta» debe ser índice 0..${opciones - 1}`);
      else if (p.opciones[p.correcta] && !/^correcta/i.test(p.opciones[p.correcta].explicacion))
        aviso(donde, "la explicación de la opción correcta debería iniciar con «Correcta.»");
      if (p.formato === "ordenamiento" && !Array.isArray(p.lista)) err(donde, "ordenamiento requiere «lista»");
      if (p.formato === "multirreactivo" && !estimulos.has(p.estimulo)) err(donde, `estímulo «${p.estimulo}» no existe`);
      if (!p.estrategia) aviso(donde, "sin «estrategia» de resolución");
      if (banco.banco === "reto" && !p.trampa) err(donde, "las preguntas del banco «reto» requieren el campo «trampa»");
      if (p.trampa !== undefined && typeof p.trampa !== "string") err(donde, "«trampa» debe ser texto");
      if (!p.fuentes?.length) aviso(donde, "sin fuentes");
      for (const f of p.fuentes ?? []) if (f.recurso) (p._refs ??= []).push(f.recurso);
      for (const id of p._refs ?? []) (globalThis.__refs ??= []).push([donde, id]);
    }
  }

  console.log(`Bancos: ${Object.entries(porBanco).map(([k, v]) => `${k} (${v})`).join(", ")}`);
  for (const s of subareas.values()) {
    if (s.preguntas === 0) aviso(t.id, `subárea ${s.id} sin preguntas`);
    resumen.push({ temario: t.id, subarea: s.id, preguntas: s.preguntas, reactivosExamen: s.reactivos });
  }
}

// ---------- Validar recursos ----------
for (const r of recursosDoc?.recursos ?? []) {
  const donde = `recursos.json › ${r.id ?? "(sin id)"}`;
  if (!r.id || !/^[a-z0-9-]+$/.test(r.id)) err(donde, "id requerido, en minúsculas-con-guiones");
  if (recursos.has(r.id)) err(donde, "id duplicado");
  recursos.set(r.id, r);
  if (!r.titulo) err(donde, "falta título");
  if (!tiposValidos.has(r.tipo)) err(donde, `tipo «${r.tipo}» inválido (${[...tiposValidos].join(", ")})`);
  for (const a of r.areas ?? []) if (!areasValidas.has(a)) err(donde, `área «${a}» no existe`);
  if (!r.url && !r.archivo && r.tipo !== "libro") aviso(donde, "sin url ni archivo");
  if (r.url && !/^https?:\/\//.test(r.url)) err(donde, `url inválida «${r.url}»`);
  if (r.archivo && !existe(r.archivo)) err(donde, `archivo no encontrado «${r.archivo}»`);
}
// ---------- Validar catálogo de comandos ----------
const ramasVistas = new Set();
let totalComandos = 0;
const todasSubareas = new Set(resumen.map((r) => r.subarea));
for (const ruta of manifest.comandos ?? []) {
  const rama = leerJSON(join(CONTENIDO, ruta));
  if (!rama) continue;
  const donde = `comandos › ${ruta}`;
  if (!rama.id || ramasVistas.has(rama.id)) err(donde, "id de rama vacío o duplicado");
  ramasVistas.add(rama.id);
  if (!rama.nombre) err(donde, "falta nombre");
  for (const s of rama.subareas ?? []) if (!todasSubareas.has(s)) err(donde, `subárea «${s}» no existe`);
  if (!Array.isArray(rama.comandos) || !rama.comandos.length) err(donde, "sin comandos");
  const vistos = new Set();
  for (const c of rama.comandos ?? []) {
    totalComandos++;
    if (!c.comando || !c.descripcion) err(donde, `comando incompleto: ${JSON.stringify(c).slice(0, 60)}`);
    if (vistos.has(c.comando)) err(donde, `comando repetido «${c.comando}»`);
    vistos.add(c.comando);
  }
}
if (ramasVistas.size) console.log(`Comandos: ${totalComandos} en ${ramasVistas.size} ramas`);

for (const r of recursosDoc?.recursos ?? []) {
  const donde = `recursos.json › ${r.id}`;
  if (r.gratuito !== undefined && typeof r.gratuito !== "boolean") err(donde, "«gratuito» debe ser true/false");
  if (r.licencia !== undefined && (typeof r.licencia !== "string" || !r.gratuito)) err(donde, "«licencia» debe ser texto y el recurso debe marcarse gratuito");
  for (const a of r.alternativasLibres ?? []) {
    const alt = recursos.get(a);
    if (!alt) err(donde, `alternativa «${a}» no existe`);
    else if (!alt.gratuito) err(donde, `alternativa «${a}» no está marcada como gratuita`);
  }
}
for (const [donde, id] of globalThis.__refs ?? []) if (!recursos.has(id)) err(donde, `fuente «${id}» no existe en recursos.json`);

finalizar();

function finalizar() {
  if (resumen.length) {
    const total = resumen.reduce((a, r) => a + r.preguntas, 0);
    console.log(`\nCobertura del banco (${total} preguntas):`);
    for (const r of resumen) {
      const barra = "█".repeat(r.preguntas).padEnd(8, "·");
      console.log(`  ${r.subarea.padEnd(5)} ${barra} ${String(r.preguntas).padStart(2)} preg. (examen: ${r.reactivosExamen})`);
    }
    console.log(`Recursos catalogados: ${recursos.size}`);
  }
  if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n` + avisos.join("\n"));
  if (errores.length) {
    console.error(`\nErrores (${errores.length}):\n` + errores.join("\n"));
    process.exit(1);
  }
  console.log("\n✓ Contenido válido");
}
