# biblioteca/: dónde guardar PDFs nuevos

Los PDFs **nuevos** que se agreguen al repo van aquí, en la carpeta del área que les corresponde según el temario
**EGEL Plus ISOFT 2026**. Las carpetas históricas (`LIBROS/`, `GUIAS/`) se conservan tal cual para no romper enlaces.

| Carpeta | Área del examen |
|---|---|
| `A1-analisis/` | Análisis de Sistemas de Software (requerimientos) |
| `A2-diseno/` | Diseño de Sistemas de Software (arquitectura, módulos, datos, interfaces) |
| `A3-desarrollo/` | Desarrollo de Sistemas de Software (lenguajes, paradigmas, entornos, datos, plataformas) |
| `A4-gestion/` | Gestión de Proyectos de Software (tiempo, costo, riesgo, calidad, metodologías) |
| `L-lenguaje-comunicacion/` | Comprensión lectora y redacción indirecta |
| `general/` | Guías generales, bancos de preguntas, técnicas de estudio |

## Reglas
1. **Nombre del archivo**: `autor-anio-titulo-corto.pdf`, en minúsculas, sin acentos ni espacios. Ejemplo: `cervantes-2016-arquitectura-de-software.pdf`.
2. **Derechos de autor**: sube solo material con licencia libre, de dominio público, de tu autoría o con permiso del autor.
   Para libros comerciales, registra la referencia en `contenido/recursos.json` **sin** el archivo (la app muestra el botón «Buscar el libro»).
3. **Regístralo** en `contenido/recursos.json` con el campo `"archivo": "biblioteca/A2-diseno/<archivo>.pdf"` para que aparezca en la Biblioteca de la app.
4. Peso máximo recomendado: 50 MB por archivo (GitHub rechaza archivos de más de 100 MB).

> ¿Solo quieres guardar un PDF para ti? En la app, en **Biblioteca → Mis PDFs**, se guarda en tu navegador sin subirlo a ningún lado.
