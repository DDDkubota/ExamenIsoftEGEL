# EGEL Plus ISOFT: guía, simulador y biblioteca

Material comunitario para preparar el **Examen General para el Egreso de la Licenciatura en Ingeniería de Software
(EGEL Plus ISOFT)** de Ceneval, actualizado a la **guía oficial de diciembre de 2026**
([`GUIAS/OFICIAL/guia-sustentante-egel-plus-isoft-2026-12.pdf`](GUIAS/OFICIAL/guia-sustentante-egel-plus-isoft-2026-12.pdf)).

## 🎓 Simulador interactivo

```bash
npm run dev            # → http://localhost:8080/app/
```
(Requiere Node 18+ y no tiene dependencias. Alternativa: `python3 -m http.server 8080` y abre `/app/`).
Cuando GitHub Pages esté activado, también estará en línea (ver *Publicación*).

| Sección | Qué hace |
|---|---|
| **Simulacro** | Examen cronometrado tipo Ceneval: 3 opciones, mapa de preguntas, marcar para revisar, **pausar y reanudar**. Modos: diagnóstico (20), disciplinar (143 con la distribución real), lenguaje (60) y personalizado. |
| **Examen completo** | Los **203 reactivos** en los 3 bloques oficiales (4 h 30 min, 2 h 30 min y 2 h). Al terminar: resultado por área, por sección (modelo compensatorio) y **nivel global** con la regla conjuntiva de la guía. |
| **Práctica** | Retroalimentación inmediata: por qué cada opción es correcta o incorrecta, **estrategia para razonar**, conceptos y fuentes. Filtros por área, subárea, banco, nivel, no vistas, falladas, marcadas y **repaso programado**. |
| **Diagnóstico** | Al terminar cualquier sesión: temas a reforzar ponderados por su peso en el examen, conceptos fallados, qué leer, comparación con tu sesión anterior y el siguiente paso recomendado. |
| **Seguimiento** | Indicadores (precisión reciente, racha, cobertura, proyección por sección), gráficas de aciertos por sesión, actividad diaria y antes/ahora por área, **dominio por subárea**, conceptos débiles e historial. Repetición espaciada (Leitner: 1, 3, 7, 14 y 30 días). |
| **Guías** | Una guía por subárea (conceptos, tablas comparativas, trampas, qué leer), más «Cómo responder reactivos Ceneval». |
| **Biblioteca** | 140 recursos **clasificados por área y subárea** (la bibliografía oficial aparece marcada con *Ceneval*); 47 gratuitos y cada libro comercial muestra sus **alternativas gratuitas**. Corrige URLs, agrega recursos, guarda **tus PDFs en tu navegador** y propónlos al repo. |
| **Comandos** | 130 comandos en 10 ramas (Git, GitHub CLI, Linux, SQL, MongoDB, Docker, Node, Python, Java y este proyecto): búsqueda, copiar, **agregar los tuyos**, **quiz por rama** y **generador de tu propio repositorio** con esta herramienta. |
| **Plan** | Reparte tus horas por subárea según su peso y tu desempeño hasta la fecha de tu examen. |

**Banco de reactivos:** 203 preguntas originales con la **misma distribución por subárea que el examen real**: banco *base* (72) y banco *extendido* (131), con 6 textos para comprensión lectora.

Las preguntas son **originales** y siguen el formato público de la guía (cuestionamiento directo, completamiento,
ordenamiento y multirreactivo). **No son reactivos reales del examen.** Complementa con la
[guía interactiva oficial](https://guias-egel.ceneval.edu.mx/).

## 📋 Estructura del examen (diciembre 2026)

**203 reactivos** en 2 sesiones de 4.5 h (incluye 15 % de reactivos piloto) · 3 opciones por reactivo · se permite calculadora científica no programable.

| Sección | Área | Subáreas (reactivos) |
|---|---|---|
| Disciplinar (143) | 1. Análisis de Sistemas de Software | 1.1 Tipos de requerimientos (12) · 1.2 Obtención, análisis, priorización y validación (9) · 1.3 Documentación de requerimientos (10) |
| | 2. Diseño de Sistemas de Software | 2.1 Diseño arquitectónico (10) · 2.2 Módulos, componentes y datos (**16**) · 2.3 Diseño de interfaces (7) |
| | 3. Desarrollo de Sistemas de Software | 3.1 Lenguajes (10) · 3.2 Paradigmas (10) · 3.3 Entornos de desarrollo (10) · 3.4 Gestión de datos (9) · 3.5 Plataformas (10) |
| | 4. Gestión de Proyectos de Software | 4.1 Tiempos, costos, RR. HH. y riesgo (8) · 4.2 Calidad de software (10) · 4.3 Metodologías (12) |
| Lenguaje y Comunicación (60) | Comprensión lectora (30) · Redacción indirecta (30) | |

Resultados: Índice Ceneval de 700 a 1300 por área → **Satisfactorio ≥ 1000**, **Sobresaliente ≥ 1150**. Para aprobar se necesita al menos Satisfactorio en la sección Disciplinar.

Las guías de cada subárea están en [`contenido/guias/`](contenido/guias) y se leen bien directamente en GitHub.

## 📁 Organización del repositorio

```
app/                 Simulador (HTML + JS sin dependencias)
contenido/           Temario, preguntas (base + extendido), guías, recursos y comandos (todo editable)
biblioteca/          Dónde agregar PDFs NUEVOS, por área
GUIAS/OFICIAL/       Guía oficial Ceneval vigente
GUIAS/               Material existente que sigue siendo relevante
LIBROS/              Solo un README: los libros comerciales se retiraron (ver alternativas libres)
EJEMPLOS/, VIDEOS/   Ejemplos y enlaces de la comunidad
legacy/              Temas de temarios anteriores que ya no se evalúan (redes, SO, matemáticas…)
scripts/             validar.mjs (validación del contenido) · servir.mjs (servidor local)
```

## ⚖️ Libros y derechos de autor

Comprar un libro digital te da derecho a **leerlo**, no a **distribuirlo**: subirlo a un repo público (o a un bucket público) lo pone a disposición de cualquiera y eso infringe los derechos de autor, aunque lo hayas pagado.
En este proyecto:
- El repo guarda **referencias y URLs públicas legales** (editorial, autor, acceso abierto, bibliotecas institucionales).
- Cada persona puede guardar **su propia copia** en la app (Biblioteca → Mis PDFs), en su navegador, sin subirla a ningún lado.
- Solo se suben al repo PDFs con licencia libre, de dominio público, propios o con permiso (ver [`biblioteca/README.md`](biblioteca/README.md)).

## 🤝 Contribuir

Agregar preguntas, guías, recursos, PDFs o un temario nuevo **no requiere programar**: lee [CONTRIBUTING.md](CONTRIBUTING.md).
Cada Pull Request se valida automáticamente (`npm run validar`).

## 🚀 Publicación (GitHub Pages)

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publica `app/` y `contenido/` en cada push a `master`.
Para activarlo: **Settings → Pages → Source: GitHub Actions**. En Pages, los PDFs del repo se abren desde GitHub.

---
Proyecto comunitario **sin afiliación con Ceneval**. EGEL y EGEL Plus son marcas registradas de Ceneval, A.C.
