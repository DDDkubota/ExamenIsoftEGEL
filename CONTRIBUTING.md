# Cómo contribuir

Todo el contenido vive en **`contenido/`** como JSON y Markdown. La app (`app/`) solo lo lee, así que **puedes agregar
preguntas, guías, recursos o un temario completo sin tocar código**. Cada Pull Request se valida automáticamente
con `node scripts/validar.mjs`.

```
contenido/
├── manifest.json                 ← registro central: qué temario está activo y qué archivos cargar
├── temarios/
│   └── egel-plus-isoft-2026.json ← secciones → áreas → subáreas (con nº de reactivos)
├── preguntas/                    ← bancos de reactivos, uno por área
│   ├── a1-analisis.json … lyc-lenguaje.json   (banco "base")
│   └── extendido/a1-analisis.json …            (banco "extendido")
├── comandos/                     ← catálogo de comandos por rama (git.json, sql.json, …)
├── guias/                        ← una guía Markdown por subárea (1.1.md … 4.3.md, L1.md, L2.md, estrategias.md)
└── recursos.json                 ← biblioteca clasificada (libros, artículos, normas, videos, PDFs del repo)
```

Para probar localmente:

```bash
npm run dev        # http://localhost:8080/app/   (o: python3 -m http.server y abre /app/)
npm run validar    # valida todo el contenido
```

---

## 1. Agregar una pregunta

Agrégala al banco del área (`contenido/preguntas/aN-*.json`) con un `id` nuevo y consecutivo:

```json
{
  "id": "A2-015",
  "subarea": "2.2",
  "formato": "cuestionamiento-directo",
  "nivel": "satisfactorio",
  "base": "Caso o contexto realista (una empresa, un equipo, un requerimiento)…",
  "codigo": "opcional: fragmento de código",
  "lista": ["opcional, solo para ordenamiento: 1. …", "2. …"],
  "pregunta": "¿Qué patrón…?",
  "opciones": [
    { "texto": "Opción A", "explicacion": "Incorrecta. Por qué no…" },
    { "texto": "Opción B", "explicacion": "Correcta. Por qué sí…" },
    { "texto": "Opción C", "explicacion": "Incorrecta. Por qué no…" }
  ],
  "correcta": 1,
  "estrategia": "Cómo razonarla: qué pista del caso lleva a la respuesta.",
  "conceptos": ["Concepto 1", "Concepto 2"],
  "fuentes": [{ "recurso": "id-en-recursos-json", "detalle": "cap. o página" }]
}
```

Reglas de calidad (estilo Ceneval):
- **Exactamente 3 opciones** y una sola correcta. Todas plausibles y de longitud similar.
- La base plantea un **caso** que requiere aplicar el conocimiento, no solo recordar una definición.
- **Explica las 3 opciones**: la correcta inicia con «Correcta.» y las demás con «Incorrecta.».
- Formatos: `cuestionamiento-directo`, `completamiento`, `ordenamiento` (requiere `lista`) y `multirreactivo` (requiere `estimulo`, definido en `estimulos` del mismo banco).
- `nivel`: `satisfactorio` o `sobresaliente` (ver los descriptores en el temario).
- Cita al menos una fuente de `recursos.json`.
- ⚠️ **Escribe preguntas originales.** No copies reactivos reales del examen: Ceneval los protege por derechos de autor y su difusión puede anular el resultado de quien los comparta.

**Bancos.** Cada archivo declara `"banco": "base"` o `"banco": "extendido"` (puedes crear otro, por ejemplo `"banco": "mi-escuela"`, y registrarlo en `manifest.json → bancos`). El examen completo toma de todos los bancos exactamente los reactivos que tiene cada subárea en el examen real; si agregas más, se eligen al azar. Los estímulos (`LYC-E1`, …) se comparten entre bancos.

## 2. Agregar o corregir un recurso / URL

Edita `contenido/recursos.json`:

```json
{ "id": "autor-anio", "titulo": "…", "autores": "…", "anio": 2024, "tipo": "libro",
  "areas": ["A2"], "subareas": ["2.1"], "oficial": false,
  "url": "https://…", "archivo": "biblioteca/A2-diseno/autor-anio-titulo.pdf",
  "idioma": "es", "prioridad": 1, "nota": "Por qué es útil" }
```

- `tipo`: `libro`, `articulo`, `norma`, `web`, `video`, `guia`, `banco-preguntas`, `apuntes`.
- `oficial: true` solo si aparece en la bibliografía sugerida de la guía Ceneval vigente.
- `prioridad: 1` marca un recurso «clave» (aparece primero).
- Sin GitHub: en la app ve a **Biblioteca → ✏️ URL / ➕ Agregar** y luego **«Proponer por Issue»**, que genera el JSON por ti.

## 3. Agregar un PDF al repo

1. Colócalo en `biblioteca/<área>/` (ver [`biblioteca/README.md`](biblioteca/README.md) para nombre y licencias).
2. Regístralo en `recursos.json` con `"archivo": "biblioteca/…"`.
3. Para material de temarios anteriores usa `legacy/` (ver [`legacy/README.md`](legacy/README.md)).

## 4. Escribir o mejorar una guía

Edita `contenido/guias/<subárea>.md` (Markdown sencillo: títulos, listas, tablas, código, citas).
Estructura sugerida: **Qué debes poder hacer → Conceptos clave (tablas) → Trampas frecuentes → Lee**.
Para una subárea nueva, regístrala en `manifest.json → temarios[].guias`.

## 5. Agregar comandos

Edita o crea `contenido/comandos/<rama>.json` y regístralo en `manifest.json → comandos`:

```json
{ "id": "kubernetes", "nombre": "Kubernetes", "icono": "☸️", "subareas": ["3.5"],
  "descripcion": "Orquestación de contenedores.",
  "comandos": [{ "comando": "kubectl get pods", "descripcion": "Lista los pods del namespace actual.", "ejemplo": "kubectl get pods -n prod" }] }
```
Desde la app (Comandos → Agregar → Exportar) obtienes el JSON listo para tu Pull Request.

## 6. Tu propio repositorio con esta herramienta

En **Comandos → Genera tu propio repositorio** se arma un script que copia la herramienta, la apunta a tu cuenta, agrega tus comandos y recursos, la valida y (opcionalmente) la publica en GitHub Pages. El método «desde plantilla» requiere que el mantenedor marque este repo como *Template repository* (Settings → General).

## 7. Agregar un módulo o un temario nuevo (cuando Ceneval actualice el examen)

1. Crea `contenido/temarios/<nuevo-id>.json` con la misma estructura (secciones → áreas → subáreas → reactivos).
2. Crea sus bancos de preguntas y guías.
3. Regístralo en `manifest.json → temarios` y cambia `temarioActivo`.
4. Mueve a `legacy/` el material que ya no aplique y documenta el motivo en `legacy/README.md`.

Agregar una **sección nueva a la app** (por ejemplo, flashcards): crea la vista en `app/js/`, regístrala en `RUTAS`
de `app/js/main.js` y agrega el enlace en `app/index.html`.
