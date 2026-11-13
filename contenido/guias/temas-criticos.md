# Temas críticos y preguntas trampa

Esta guía reúne los temas donde históricamente hay **más errores** y las **trampas** más comunes de los reactivos.
Úsala junto con el **Modo reto** (Simulacro → 🔥 Reto) y repasa cada sección después de fallar preguntas de esa subárea.

## 1. ¿Dónde se equivocan más los sustentantes? (datos de Ceneval)

Ceneval publicó informes anuales del **EGEL-ISOFT anterior** con el porcentaje de sustentantes por nivel en cada área.
La tabla muestra el porcentaje que quedó en **«Aún no satisfactorio» (ANS)**: mientras más alto, más difícil resultó el área.

| Área del EGEL-ISOFT anterior | 2017 | 2018 | 2020 | 2021 | Equivale hoy a… |
|---|---|---|---|---|---|
| Desarrollo e implantación de aplicaciones computacionales (40.9% del examen) | **49.0%** | **42.3%** | **53.8%** | 36.2% | Área 2 Diseño + Área 3 Desarrollo (2.1, 2.2, 3.1–3.3) |
| Implementación de redes, BD, SO y lenguaje de desarrollo (31.5%) | 48.5% | 40.0% | 50.5% | **37.3%** | 2.2 datos, 3.1 lenguajes, 3.4 gestión de datos, 3.5 plataformas |
| Análisis de sistemas de información (13.3%) | 41.4% | 31.3% | 40.1% | 30.2% | Área 1 Análisis (requerimientos) |
| Gestión de proyectos de TI (14.4%) | 35.0% | 22.6% | 26.2% | 23.4% | Área 4 Gestión |
| *Sustentantes por año* | *2 939* | *2 914* | *1 081* | *1 612* | |

**Resultado global.** En 2020, el **51.9 %** no obtuvo testimonio (6.6 % sobresaliente); en 2021, el **37.5 %** no lo obtuvo (18.2 % sobresaliente).

**Lo que dicen los datos:**
1. **Diseño y desarrollo fue el área más difícil en 2017, 2018 y 2020**, y en 2021 quedó prácticamente empatada con la de bases de datos y lenguajes (36.2 % frente a 37.3 %). Además es la que más pesa: es la prioridad número 1.
2. **Bases de datos, lenguajes y plataformas** es la segunda área más difícil y la que tiene **menos sobresalientes** (10.4 % en 2021).
3. **Gestión de proyectos** es la que mejor resulta, pero sus reactivos de **cálculo** (ruta crítica, valor ganado, COCOMO) son puntos que no conviene regalar.

> ⚠️ **Cómo leer estos datos:** son del examen anterior, con otra estructura (181 reactivos, 4 áreas distintas). El mapeo a las áreas de 2026 es aproximado.
> Ceneval no ha publicado informes por área del EGEL Plus ISOFT (aplicado desde diciembre de 2021). Fuentes: informes de resultados del EGEL-ISOFT
> [2017](https://ceneval.edu.mx/wp-content/uploads/2021/07/ISOFT_2017.pdf), [2018](https://ceneval.edu.mx/wp-content/uploads/2021/07/ISOFT_2018.pdf),
> [2020](https://ceneval.edu.mx/wp-content/uploads/2021/07/ISOFT_2020.pdf) y [2021](https://ceneval.edu.mx/wp-content/uploads/2022/03/ISOFT2021-1.pdf), sección 3.3.

**Lo que reportan quienes ya presentaron** (guía comunitaria 2024 de este repo, basada en la aplicación de 2023):
- El Área 3 está **llena de casos prácticos**: «se construye X aplicación para X plataforma, ¿qué lenguaje, IDE o framework usar?», incluida realidad virtual multiplataforma (Unity). También hay **código para leer** y explicar qué hace.
- El Área 4 es **mayormente de cálculo**: CPM, Gantt, COCOMO II, niveles de CMMI y MoSCoW.
- El Área 2 incluye **diagramas e interfaces para interpretar** (UML, E-R, wireframes).

## 2. Cómo detectar una pregunta trampa

| Señal en el reactivo | Qué hacer |
|---|---|
| **NO**, **EXCEPTO**, «¿cuál es **incorrecta**?» | Subráyalo. Busca la opción falsa: las otras dos serán verdaderas. |
| «la **más** adecuada», «la **principal**», «**primero**» | Varias opciones son correctas en parte; gana la que atiende la restricción central del caso. |
| Datos de más en la base (presupuesto, tamaño del equipo, plazo) | Cada dato descarta una opción: si un dato no te sirvió para descartar, reléelo. |
| Absolutos: **siempre**, **nunca**, **todos**, **solo** | Rara vez son correctos en ingeniería de software. |
| Nombres viejos de normas (ISO 9126, IEEE 830, «usabilidad», «portabilidad») | La versión vigente puede haber cambiado el nombre: ISO/IEC 25010:2023 y 29148. |
| Conceptos «vecinos» (verificación/validación, State/Strategy, agregación/composición) | Busca el rasgo que los distingue (tabla en la sección 3). |
| Cálculos | Primero las unidades (LOC→KLOC, horas→días); después la fórmula. El distractor es la fórmula equivocada. |
| Ordenamiento | Fija el primer y el último paso; desconfía de las opciones que solo invierten dos pasos intermedios. |

## 3. Pares que más se confunden

| Par | Diferencia que decide la respuesta |
|---|---|
| **Verificación** vs. **validación** | Contra la especificación («producto correctamente») vs. contra las necesidades del usuario («producto correcto»). |
| **Error**, **defecto** y **falla** | Error humano → defecto en el código o artefacto → falla observable al ejecutar. |
| **Re-prueba (confirmación)** vs. **regresión** | Re-probar el defecto corregido vs. comprobar que la corrección no rompió otra cosa. |
| **Alfa** vs. **beta** | Alfa: usuarios en el entorno del desarrollador; beta: usuarios en su propio entorno. |
| **Requisito no funcional** vs. **restricción** | El no funcional pide una calidad medible (desempeño, seguridad); la restricción limita las opciones de diseño (lenguaje, plataforma, presupuesto). |
| **De usuario** vs. **de sistema** | Lenguaje natural para el cliente vs. especificación detallada y medible para los desarrolladores. |
| **include** vs. **extend** | Siempre ocurre vs. opcional o condicional (y la flecha va en sentido opuesto). |
| **Agregación** vs. **composición** | La parte puede vivir sin el todo vs. muere con el todo (rombo vacío vs. relleno). |
| **Asociación** vs. **dependencia** | Relación estructural duradera (atributo) vs. uso temporal (parámetro o variable local). |
| **State** vs. **Strategy** | Cambia el propio objeto según su estado vs. el cliente elige el algoritmo. |
| **Adapter**, **Facade**, **Proxy** y **Decorator** | Traduce una interfaz / simplifica un subsistema / controla el acceso con la misma interfaz / agrega comportamiento con la misma interfaz. |
| **Observer** vs. **Mediator** | Uno notifica a muchos suscriptores vs. un coordinador central entre muchos objetos que no se conocen. |
| **MVC**, **MVP** y **MVVM** | Controlador / presentador que actualiza una vista pasiva / binding bidireccional con un ViewModel. |
| **Capas** vs. **niveles (tiers)** | Separación lógica del código vs. separación física en máquinas o procesos. |
| **Cohesión** vs. **acoplamiento** | Dentro del módulo (quieres alta) vs. entre módulos (quieres bajo). |
| **2FN** vs. **3FN** | Dependencia parcial de una llave compuesta vs. dependencia transitiva entre atributos no clave. |
| **Replicación** vs. **fragmentación** | Copiar los datos vs. dividirlos (horizontal por filas, vertical por columnas). |
| **Síncrona** vs. **asíncrona** | Cero pérdida con más latencia vs. baja latencia con posible pérdida mínima. |
| **IaaS**, **PaaS** y **SaaS** | Administras desde el SO / solo tu código / solo usas el producto. |
| **Crashing** vs. **fast tracking** | Más recursos (más costo) vs. paralelizar (más riesgo). |
| **SPI** vs. **CPI** | EV/PV (tiempo) vs. EV/AC (costo); menor a 1 es malo en ambos. |
| **CMMI 2** vs. **CMMI 3** | Procesos gestionados por proyecto vs. definidos para toda la organización. |
| **Calidad del proceso** vs. **del producto** | CMMI, MoProSoft, ISO/IEC 29110 e ISO 9001 vs. ISO/IEC 25010. |
| **Sprint Review** vs. **Retrospective** | El producto con los stakeholders vs. el proceso del equipo. |
| **Incremental** vs. **iterativo** | Agregar partes terminadas vs. refinar las mismas partes en ciclos. |

## 4. Normas: versión vigente frente a versiones viejas (trampa frecuente)

| Tema | Vigente | Antigua (aparece en distractores y en libros viejos) |
|---|---|---|
| Calidad del producto | **ISO/IEC 25010:2023**: 9 características (capacidad de interacción, flexibilidad, safety) | ISO/IEC 9126 / 25010:2011 (usabilidad, portabilidad; 8 características) |
| Modelo de calidad (marco) | **ISO/IEC 25002:2024** | ISO/IEC 25010:2011 parte 1 |
| Especificación de requisitos | **ISO/IEC/IEEE 29148:2018** | IEEE 830-1998 |
| Pruebas | **ISO/IEC/IEEE 29119** | IEEE 829 (documentación de pruebas) |
| Procesos del ciclo de vida | **ISO/IEC/IEEE 12207:2017** | ISO 12207:1995/2008 |
| Evaluación de procesos | **ISO/IEC 33000** | ISO/IEC 15504 (SPICE) |
| Descripción de arquitectura | **ISO/IEC/IEEE 42010:2022** | IEEE 1471 |
| Scrum | **Guía de Scrum 2020** (responsabilidades, compromisos, Objetivo del Producto) | 2017 («roles», el Development Team como subequipo) |
| PMBOK | **7a ed.**: 12 principios y 8 dominios de desempeño | 6a ed.: 5 grupos de procesos y 10 áreas de conocimiento |

## 5. Cálculos que sí o sí debes dominar (con calculadora no programable)

### Ruta crítica (CPM) con holguras
1. **Pasada hacia adelante:** ES = máximo de los EF de las predecesoras; EF = ES + duración.
2. **Pasada hacia atrás:** LF = mínimo de los LS de las sucesoras; LS = LF − duración.
3. **Holgura** = LS − ES = LF − EF. La ruta crítica está formada por las actividades con holgura 0.

> **Trampa:** sumar todas las duraciones (incluidas las actividades paralelas) o tomar la ruta con **más actividades** en lugar de la de **mayor duración**.

### PERT
E = (O + 4M + P) / 6 · σ = (P − O) / 6 · varianza de la ruta = Σσ². Para la probabilidad de terminar antes de T: Z = (T − E_ruta) / σ_ruta.

### Valor ganado (EVM)
| Indicador | Fórmula | Lectura |
|---|---|---|
| SV / SPI | EV − PV / EV ÷ PV | Negativo o < 1 = atraso |
| CV / CPI | EV − AC / EV ÷ AC | Negativo o < 1 = sobrecosto |
| EAC (si la tendencia sigue) | BAC ÷ CPI | Costo final estimado |
| ETC | EAC − AC | Lo que falta gastar |
| VAC | BAC − EAC | Desviación final esperada |
| TCPI | (BAC − EV) ÷ (BAC − AC) | Eficiencia necesaria para terminar dentro del presupuesto |

### COCOMO básico (Boehm, 1981)
Esfuerzo E = a·(KLOC)^b persona-mes; tiempo T = c·E^d meses; personas = E / T.

| Modo | a | b | c | d |
|---|---|---|---|---|
| Orgánico (equipo pequeño, problema conocido) | 2.4 | 1.05 | 2.5 | 0.38 |
| Semiacoplado (intermedio) | 3.0 | 1.12 | 2.5 | 0.35 |
| Empotrado (restricciones fuertes de hardware o tiempo real) | 3.6 | 1.20 | 2.5 | 0.32 |

> **Trampa:** usar LOC en lugar de KLOC, o los coeficientes de otro modo. Si el caso dice «sistema embebido de tiempo real», el modo es empotrado.

### Puntos de función (IFPUG, complejidad media)
EI ×4 · EO ×5 · EQ ×4 · ILF ×10 · EIF ×7. PFA = PFNA × (0.65 + 0.01 × ΣFi), con 14 factores de 0 a 5.

### Otras fórmulas
- Densidad de defectos = defectos / KLOC
- DRE = E / (E + D)
- Disponibilidad = MTBF / (MTBF + MTTR)
- V(G) = decisiones + 1 = E − N + 2
- VME = Σ P × I (las oportunidades suman y las amenazas restan)
- Canales de comunicación = n(n − 1) / 2

## 6. Lectura de código: errores típicos

| Trampa | Ejemplo | Clave |
|---|---|---|
| División entera | `7 / 2` en Java o C con `int` | Da `3`; en Python 3 `7 / 2` da `3.5` y `7 // 2` da `3` |
| Referencias vs. copias | `b = a` con listas u objetos | Ambas variables apuntan al mismo objeto |
| Paso por valor | Reasignar un parámetro | No cambia la variable del llamador (Java, C, Python) |
| Alcance | `let`/`const` en un bloque; variable local que oculta a la global | Se usa la más cercana |
| `==` vs. `===` (JS) | `"5" == 5` es `true`; `"5" === 5` es `false` | Coerción de tipos |
| Cortocircuito | `x != null && x.length > 0` | Si la primera es falsa, la segunda no se evalúa |
| Pre/post incremento | `i++` vs. `++i` dentro de una expresión | El postincremento usa el valor viejo |
| Desbordamiento de índices | `for (i = 0; i <= n; i++)` sobre un arreglo de n | Se pasa por uno |
| Recursión | Falta o error en el caso base | Desarrolla las llamadas a mano |
| `static` | Variable compartida entre instancias | Un solo valor para la clase |

## 7. SQL y datos: detalles que se preguntan

- **NULL:** `NULL = NULL` no es verdadero (es *desconocido*); se usa `IS NULL`. `COUNT(*)` cuenta filas y `COUNT(col)` ignora los NULL. `AVG` ignora los NULL.
- **NOT IN con NULL:** si la subconsulta devuelve un NULL, `NOT IN` no devuelve filas. Usa `NOT EXISTS`.
- **WHERE vs. HAVING:** WHERE filtra filas antes de agrupar y no admite agregados; HAVING filtra grupos.
- **Las columnas del SELECT con GROUP BY** deben estar agrupadas o agregadas.
- **JOIN:** INNER (solo coincidencias), LEFT (todas las filas de la izquierda), FULL (todas las de ambos lados), CROSS (producto cartesiano).
- **Anomalías de concurrencia por nivel de aislamiento:**

| Nivel | Lectura sucia | Lectura no repetible | Fantasma |
|---|---|---|---|
| Read uncommitted | Posible | Posible | Posible |
| Read committed | — | Posible | Posible |
| Repeatable read | — | — | Posible |
| Serializable | — | — | — |

- **CAP:** ante una partición de red, elige entre consistencia (CP: MongoDB con mayoría, HBase) y disponibilidad (AP: Cassandra, DynamoDB).
- **Cardinalidad:** 1:N → la FK va del lado N; N:M → tabla intermedia; 1:1 → la FK con UNIQUE en cualquiera de los dos lados.

## 8. Elegir tecnología por escenario (casos prácticos del Área 3)

| Si el caso dice… | Piensa en… |
|---|---|
| Realidad virtual o aumentada multiplataforma, videojuegos 3D | **Unity** (C#) o Unreal (C++) |
| App iOS con máximo rendimiento o acceso a sensores | **Swift** + Xcode |
| App Android nativa | **Kotlin** + Android Studio |
| Una sola base de código para iOS y Android | **Flutter** (Dart) o **React Native** (JS/TS) |
| Firmware, microcontrolador, tiempo real | **C/C++** (o Rust) + RTOS |
| Ciencia de datos, ML, prototipos | **Python** (Jupyter, pandas) |
| Frontend web interactivo | **TypeScript/JavaScript** + React, Angular o Vue |
| Backend empresarial, banca | **Java** (Spring) o **C#** (.NET) |
| Sitio de contenido con SEO | SSR / generación estática |
| Scripts y automatización de servidores | **Bash**, Python |
| Sistemas concurrentes y de alta disponibilidad | Go, Erlang/Elixir |
| Reglas e inferencia lógica | **Prolog** |
| Transformación de datos sin efectos laterales | **Haskell** o un estilo funcional |

## 9. Lenguaje y Comunicación: trampas típicas

- Opciones **parcialmente correctas**: describen un detalle verdadero, pero no lo que se pregunta (por ejemplo, la idea central).
- **Cuantificadores** cambiados: «todos» por «al menos uno», «siempre» por «a veces».
- **Datos del texto asignados al sujeto equivocado** (una cifra real del texto, pero de otro grupo).
- **Concordancia por atracción**: el verbo concuerda con el sustantivo más cercano y no con el núcleo del sujeto.
- **Tilde diacrítica y plurales**: «notificación» lleva tilde, pero «notificaciones» no.

## Lee
- Informes de resultados del EGEL-ISOFT de Ceneval (2017–2021) · Guía comunitaria EGEL ISOFT 2024 (en este repo)
- SWEBOK v4 · ISTQB CTFL v4 (pruebas) · *Database Design* (BCcampus) · *Project Management* (BCcampus) · Refactoring.Guru (patrones)
