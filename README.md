# EGEL INGENIERIA DE SOFTWARE

## Análisis de sistemas de información
### Diagnóstico del problema y valoración de la factibilidad para el desarrollo de sistemas de información
* Control de la definición de alcance: En la etapa inicial del proyecto, la factibilidad es la urgencia del problema y una primera estimación de costos
* Control de análisis del problema: Se analizan los problemas del sistema existente y se realiza una segunda estimación de costo
* Control de análisis de decisiones: Los problemas y requerimientos se conocen, se definen soluciones alternas en cuanto métodos de entrada/salida, almacenamiento de datos, necesidades de hardware y software

Opciones para el análista:
1. No hacer nada
2. Emprender la reingeniería de los procesos de negocio
3. Mejorar el sistema existente
4. Comprar un sistema comercial
5. Diseñar y construir un nuevo sistema

Pruebas de factibilidad:
* Factibilidad operativa, que tanto la solución cumple los requisitos
* Factibilidad cultural, el grado de aceptación de la solución en un ambiente organizacional
* Factibilidad técnica, disponibilidad de recursos técnicos para la realización de la solución, ej. programadores insuficientes o es necesario invertir en equipo caro
* Factibilidad del calendario, si el tiempo a entregar el sistema es razonable
* Factibilidad ecónomica, efectividad en costos del proyecto
* Factibilidad legal

Análisis costo-beneficio:
* Valor del dinero en el tiempo
* Análisis de recuperación de la inversión
* Análisis de rendimiento sobre la inversión

#### Análisis preliminar de los sistemas de operación de la organización

#### Diagnóstico de la situación de los sistemas de operación de la organización

#### Identificación de los problemas a resolver con sistemas de información 

#### Análisis de factibilidad de productos comerciales contra desarrollos a la medida como estrategias de solución del problema 

#### Propuestas de sistemas de información computacional que solucionen la problemática detectada en la organización 

### Modelado de los requerimientos de un sistema de información
Tipos de modelado:
* Modelos basados en el escenario de los requerimientos desde el punto de "actores"
    * Casos de uso
        ![Casos de uso](https://stadium.unad.edu.co/ovas/10596_9839/Figura_43_Diseno_Completo_del_Diagrama_de_Casos_de_Uso.jpg)
    * Diagramas de actividades
        ![Diagramas de actividades](https://image.slidesharecdn.com/diagramadeactividadesuml-110301132720-phpapp01/95/diagrama-de-actividades-uml-8-728.jpg?cb=1298986104)
    * Diagramas tipo carril de natación (Diagrama de secuencia)
        ![Diagrama de secuencia](https://sites.google.com/site/modeladouml/_/rsrc/1364833400166/diagrama-de-secuencia/DiagramaDeSecuencia.JPG)
* Modelos de datos
    * Modelar los objetos de datos, con sus atributos
    * Incluye información como sus relaciones
        * Diagrama entidad relación
            ![Diagrama entidad relación](https://www.lawebdelprogramador.com/usr/327000/327381/5a7b91006e58f-ER-DIAGRAMA.jpg)
* Modelos orientados a objetos
    ![Diagrama de clases](http://2.bp.blogspot.com/-QB5fHj0N6TQ/VhtLzottNgI/AAAAAAAAAMc/jb46t393CFc/s1600/DCPedidos.jpg)   
    Modelan:
    * Relaciones
    * Modelan los atributos de los distintos objetos de datos
    * Representa los *métodos* para manipular los objetos de datos
* Modelos orientados al flujo, representa como se transforman los datos a medida que avanzan en el sistema
    * Diagrama de flujo
        ![Diagrama de flujo](https://renieryblog.files.wordpress.com/2016/03/diagrama-de-flujo-397795.png)
    * Especificación de control con un Diagrama de estado
        ![Diagrama de estado](http://1.bp.blogspot.com/-aljC2mKDMbE/Tsr7ZR4fKzI/AAAAAAAAAGQ/dNDIWq5HW5A/s1600/ESTADO1.gif)
* Modelos de comportamiento, muestra como se comporta el software en consecuencia a eventos externos
    * Diagrama de estado
        ![Diagrama de estado](http://1.bp.blogspot.com/-aljC2mKDMbE/Tsr7ZR4fKzI/AAAAAAAAAGQ/dNDIWq5HW5A/s1600/ESTADO1.gif)
    * Diagrama de secuencia
        ![Diagrama de secuencia](https://sites.google.com/site/modeladouml/_/rsrc/1364833400166/diagrama-de-secuencia/DiagramaDeSecuencia.JPG)

#### Análisis de los requerimientos de un sistema de información 


#### Validación de los requerimientos de un sistema de información 
La validacion de requisitos ocurren con el objetivo de comprobar que estos son correctos, la falta de esta fase pudiera significar una mala especificación.
Los parametros a verficiar son: 
* Validez: Obtener los requisitos de todos los usuarios.
* Consistencia: No deben de haber contradiccciones de requisitos.
* Completitud: Deben estar todos los requisitos, o en el caso de un desarrollo iterativo tener todos los requisitos de la iteración en curso.
* Realismo: Se pueden implementar y son realizables con tecnologia moderna.
* Verificabilidad: Tiene que ser comprobable.

##### Prototipado de interfaz de usuario
Permite al usuario final explorar la propuesta de los ingenieros de requisitos.
* Desechables: Pueden ser prototipos en papel o en software, su unico punto es demostrar los requisitos.
* Evolutivos: Son primero utilizados para la validación de requisitos, con el tiempo se mejora su calidad y se convierten en el producto final.

##### Recorrido de casos de uso
En ingles *Walkthrough*, es una forma de revisión por pares donde el programador o programadores se reunen con los stakeholders y los participantes preguntan y hacen comentarios sobre posibles errores, violaciones de estádares de desarrollo y otros problemas. Puede ser informal o seguir los estandares de la norma IEEE 1028. 

#### Documentación de los requerimientos de un sistema de información
Su papel es continuar con la definición del sistema a desarrollar.

Características de los requisitos:
* Deben estar bien redactados. Usan terminos del dominio del problema que los interesados esten familiarizados y deben aparecer en un glosario de terminos.
* Los requisitos tienen estar redactados de forma que ayude a que solo puedan ser entendidos en una forma.
* Deben ser gramaticamente y fotograficamente correctos.
* Se redactan de forma que se puedan definir pruebas y que tengan costos y una duración de tiempo razonables.
* Establecen requisitos que puedan implementarse con tecnología existente y con un costo dentro del presupuesto.

## Desarrollo e implantación de aplicaciones computacionales
#### Desarrollo del modelo inicial de la solución del problema de tecnología de información

#### Ajuste de modelos de la solución de tecnología de información 

#### Diseño de la arquitectura del sistema 

#### Modelado de datos para el sistema 

### Desarrollo de sistemas
#### Herramientas de desarrollo del sistema 

#### Codificación del sistema 

#### Validación de la solución tecnológica 

#### Ajuste del producto de software desarrollado

### Implantación de sistemas 
#### Técnicas de implantación de sistemas
Existen los siguientes métodos de implantación según Maria Ines Parnisari:
* Big Bang: Todo el nuevo sistema pasa a producción.
* Escalonado: El nuevo sistema se pone en producción por etapas. Necesita interfaces temporales entre el sistema viejo y el nuevo.
* Directo: El nuevo sistema no coexiste con el viejo.
* Paralelo: El nuevo sistema coexiste con el viejo durante un tiempo. Es costoso.

#### Elementos para poner en operación un producto de software
Factores clave para una implantación exitosa
1. Apoyo de la gerencia
2. Apoyo de *stakeholders*
3. Disponiblidad de dinero y recursos humanos

Fases de implantación:
1. Revisión de hardware y software
2. Método de implantación
3. Puesta operativa:
    * Migración de datos
    * Capacitación
    * Interfaces definitivas
    * Manual de normas y procedimientos

#### Pruebas de operación y validez de un producto de software
Existen los siguientes planes de pruebas según Maria Ines Parnisari:
* De hardware: Probar si el hardware soporta el nuevo sistema
* Unitarias: Se prueban los distintos modulos por separado
* Funcionales: Probar las diversas funciones del sistema con casos felices y erróneos y ver como se comporta el sistema
* De estrés: Verifica cómo es el tiempo de respuesta ante muchas entradas o muchos usuarios
* De volumen: Verifica cómo es el tiempo de respuesta ante muchísimas entradas o muchísimos usuarios
* Integrales: Verificar todo el sistema ya en funcionamiento
De perfiles: Probar que un usuario X no tenga autorizado realizar acciones que no tiene autorizadas
* De interfaces: Probar las interfaces entre los módulos o entre el sistema nuevo y el viejo
* Plan de contigencia

### Aplicación de modelos matemáticos
#### Aplicación de las ciencias básicas a la ingeniería de software 

#### Simulación de sistemas mediante herramientas computacionales 

## Gestión de proyectos de tecnologías de información
### Administración de proyectos de tecnologías de información
#### Administración de  los recursos de proyectos de tecnologías de información

#### Verificación del cumplimiento de las metas del proyecto de tecnologías de información 

### Control de calidad de proyectos de tecnologías de información 
#### Selección de los modelos de calidad para tecnologías de información 

#### Aplicación de metodologías para el modelo de calidad seleccionado 

#### Establecimiento de las métricas de calidad para proyectos de tecnologías de información 

#### Verificación del cumplimiento de las métricas de calidad en proyectos de tecnologías de información 

## Implementación de redes, bases de datos, sistemas operativos y lenguaje de desarrollo
### Gestión de redes de datos

#### Diseño de modelos de redes en base a un requerimiento de una organización 

#### Implementación redes de datos 

#### Administración y operación de una red de datos 

### Gestión de bases de datos
#### Diseño de bases de datos relacionales 
##### Formas normales
La normalización nos permite organizar los datos de una base de datos, incluye la creación de tablas y el establecimiento de relaciones según reglas con el fin de que la base de datos sea mas flexible al eliminar redundancia y dependencias incoherentes, las dependencias incoherentes evitan que el acceder a los datos sea intuitivo y dificulta el acceso por que la ruta puede no estar o estar interrumpida.

###### Primera forma normal
* Eliminar grupos repetidos de información de las tablas individuales. Eliminar cosas como `proveedor_1` y `proveedor_2`, mudarlo a una tabla de proveedores; eliminar campos como información del usuario si lo principal son las ordenes de compra.
* Crear tablas independientes para cada conjunto de datos relacionados.
* Identificar cada tabla con un llave primaria.

##### Segunda forma normal
* Crear tablas independientes para conjuntos de valores que se apliquen a varios registros. Por ejemplo, si tienes dirección en la tabla de clientes y de facturas independientemente en ambas tablas, considera tenerlo solo en una tabla.
* Relacionar estas tablas con una clave externa.

##### Tercera forma normal
* Eliminar campos que no dependan de la clave.

#### Implementación de bases de datos

#### Administración, instalación, configuración y mantenimiento de una base de datos 

### Gestión de sistemas operativos o lenguajes de desarrollo
#### Selección del sistema operativo o lenguaje de desarrollo de acuerdo a las características y necesidades de la organización 

#### Configuración de sistemas operativos   

#### Administración de servidores 
