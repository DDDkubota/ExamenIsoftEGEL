# Material legacy (temarios anteriores)

Esta carpeta guarda material de estudio de **temarios anteriores** del EGEL ISOFT (2018 y anteriores)
y de guías heredadas del EGEL de Computación que **ya no forman parte** del temario vigente
(**EGEL Plus ISOFT, diciembre 2026**; ver [`GUIAS/OFICIAL`](../GUIAS/OFICIAL)).

Se conserva por referencia histórica y porque algunos conceptos todavía sirven como apoyo,
pero **no se recomienda priorizarlo** para preparar el examen actual.

Los archivos conservan su ruta original (por ejemplo `GUIAS/GUIA-3/...`) para que sea fácil rastrear de dónde vienen.

## ¿Por qué se movió cada archivo?

| Archivo(s) | Tema | Motivo |
|---|---|---|
| `CENEVALGUIA.pdf` | Guía oficial EGEL-ISOFT feb-2018 | Reemplazada por la guía EGEL Plus ISOFT 2026 |
| `GUIABIBLIOGRAFIACONTEMAS.pdf` | Bibliografía por tema (2019) | Usa la estructura de áreas anterior (Análisis de sistemas de información, Implementación de redes/SO, etc.) |
| `TEMARIO-EGEL-ISOFT-2018.md` | README anterior del repo | Usa la estructura de áreas de 2018. Lo que sigue vigente (modelado, validación de requerimientos, normalización, tipos de prueba) está integrado en `contenido/guias/`; factibilidad e implantación quedan aquí como consulta |
| `D - Redes.pdf`, `GUIAREDES.pdf`, `actualizacionsRedes.doc` | Redes de datos | El temario 2026 no evalúa redes |
| `C - Arquitectura.pdf`, `GUIAARQUITECTURA.pdf`, `actualizacionSesiones Varias.doc` | Arquitectura de computadoras / hardware / física | No está en el temario 2026 (ojo: "Diseño arquitectónico **de software**" sí está, área 2.1) |
| `GUIASOFTBASE.pdf`, `E - Software Base.pdf` | Software de base (ensambladores, compiladores) | No está en el temario 2026 |
| `Sistemas Operativos 1/2.doc` | Sistemas operativos | No está en el temario 2026 |
| `B - Mate.pdf` | Matemáticas (cálculo, álgebra) | No está en el temario 2026 |
| `GUIAENTORNO.pdf`, `actualziacionA - Entorno Social.pdf` | Entorno social / organizaciones | No está en el temario 2026 |
| `GUIAINTART.pdf`, `H - GRaficacion.pdf`, `Graficación.pdf`, `Inteligencia Artificial.doc` | Graficación, IA e IHC | Graficación e IA no se evalúan. La parte de **IHC** sigue siendo útil para el área 2.3 *Diseño de interfaces* (sección C de `GUIAINTART.pdf`) |
| `Delitos informáticos.doc` | Legislación informática | No está en el temario 2026 |

## ¿Algo de aquí vuelve a ser relevante?

Si Ceneval publica un temario que vuelve a incluir alguno de estos temas, mueve el archivo de regreso
con `git mv` y regístralo en `contenido/recursos.json` (ver [CONTRIBUTING.md](../CONTRIBUTING.md)).
