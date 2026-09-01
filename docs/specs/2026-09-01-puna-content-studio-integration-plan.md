# Puna Content Studio — plan de integración y evolución de producto

Fecha: 2026-09-01

Estado: propuesta lista para implementación

Ámbito: integrar las capacidades útiles de `/Users/martinfraticelli/Documents/autopost` dentro de Puna Operations en `/Users/martinfraticelli/Documents/punav2`.

## 1. Decisión ejecutiva

Puna Operations debe convertirse en la única interfaz para idear, generar, revisar, aprobar, programar y registrar publicaciones sociales. No conviene mantener el frontend separado de `autopost`, crear otro CMS ni avanzar ahora con una arquitectura SaaS multi-tenant.

La integración debe:

- reutilizar la autenticación, el acceso server-side a Supabase, la auditoría, el sistema visual y los estados editoriales de Puna Operations;
- reutilizar del proyecto `autopost` la generación estructurada por canal, el crítico de calidad, la biblioteca de marca y, especialmente, la composición de texto sobre imágenes preestablecidas;
- reemplazar el calendario estático, los mocks silenciosos, las aprobaciones optimistas y el banco aislado de ganchos;
- mantener la publicación automática fuera del alcance inicial: aprobar, programar y publicar son acciones distintas;
- usar imágenes generativas solo como opción experimental; la experiencia principal será plantilla de marca + composición tipográfica determinística.

No se necesita una nueva dependencia para la primera integración. El worker Python existente puede mantenerse temporalmente como servicio privado mientras la interfaz y la base de datos se consolidan en `punav2`.

## 2. Diagnóstico del estado actual

### 2.1 Lo valioso de `autopost`

- Genera versiones específicas para LinkedIn, X e Instagram desde un tema común.
- Mantiene estados `draft`, `approved` y `rejected`.
- Tiene un agente redactor y un agente crítico para clichés, tono, CTA y estructura.
- Permite guardar preferencias y elegir una plantilla de generación.
- Posee una biblioteca de imágenes de marca.
- La función más sólida es `ImageEditorService`: toma una imagen aprobada, aplica una capa de contraste y compone un título con tipografía controlada.
- Puede reutilizar un mismo activo visual entre variantes de canal.

### 2.2 Problemas de producto de `autopost`

- La pantalla principal contiene unas 2.000 líneas y mezcla navegación, datos, mocks, generación, calendario, revisión y biblioteca visual.
- El calendario es un array fijo de 30 días. Se repite visualmente en cualquier mes y ubica borradores por `created_at`, no por una fecha real de publicación.
- “Ganchos” es una biblioteca separada del proceso creativo. Explica categorías, pero no ayuda a elegir el mejor gancho para un objetivo, audiencia o evidencia concreta.
- Varias muestras usan métricas o casos de clientes no respaldados, como porcentajes, horas ahorradas o resultados de implementación. Esto reduce credibilidad y presenta riesgo reputacional.
- El usuario elige nombres de proveedores y modelos de imagen. Esa es una decisión técnica, no una decisión de contenido.
- La UI mezcla estilos oscuros, terminal, glassmorphism, texto muy pequeño y numerosos controles de igual jerarquía.
- Las aprobaciones son optimistas: la interfaz cambia antes de confirmar la respuesta del servidor y los errores se ignoran.
- Si el backend falla, la aplicación reemplaza datos reales por mocks sin distinguir claramente un modo demo de producción.
- La métrica “horas ahorradas” se incrementa en `localStorage`; no representa actividad real.
- El flujo de generación simula logs y tiempos aunque no correspondan al estado real del backend.

### 2.3 Riesgos técnicos antes de integrar

- Los endpoints FastAPI no requieren autenticación.
- CORS acepta cualquier origen.
- El navegador envía libremente `company_id`.
- El backend usa una clave de Supabase con permisos amplios.
- La actualización de estado acepta cualquier ID sin comprobar identidad del operador o compañía.
- La biblioteca permite altas y eliminaciones sin autenticación.
- El scheduler consume temas de forma no atómica y ejecuta tareas en memoria.
- Los fallbacks locales pueden crear contenido que parece persistido aunque no exista en Supabase.

El backend de `autopost` no debe conectarse directamente al navegador de Puna Operations en producción.

### 2.4 Capacidades ya disponibles en `punav2`

- Login privado de administrador mediante Supabase Auth.
- Gateway server-side con `SUPABASE_SERVICE_ROLE_KEY`; la clave nunca llega al navegador.
- Validación de origen para mutaciones.
- Registro inmutable de auditoría.
- Tablas y UI para artículos, briefs, borradores sociales, prospectos, leads y ejecuciones.
- Flujo n8n que genera artículos bilingües y variantes de LinkedIn/X desde briefs con fuentes aprobadas.
- Estados editoriales separados: aprobar no publica.
- Diseño responsive con Newsreader, Plus Jakarta Sans, Lucide, superficies papel, caoba y terracota.

## 3. Visión del producto

Puna Content Studio será un espacio editorial interno que transforme una idea, artículo, evidencia o imagen de marca en publicaciones profesionales listas para revisión humana.

El flujo objetivo es:

`Fuente verificable → Campaña → Gancho elegido → Variantes por canal → Revisión → Aprobación → Programación → Publicación manual → Registro de resultado`

Estados propuestos:

`idea → generating → draft → approved → scheduled → published`

Rutas alternativas:

- `draft → rejected → draft`
- `approved → draft` cuando el contenido vuelve a edición;
- `scheduled → approved` cuando se quita del calendario;
- cualquier estado no publicado puede pasar a `archived`.

Reglas invariables:

- aprobar nunca publica;
- programar nunca publica por sí solo en la primera versión;
- ninguna métrica, resultado de cliente o afirmación factual puede aparecer sin evidencia;
- un fallo de generación debe mostrarse como fallo, no como contenido demo;
- cada acción debe dejar un registro de auditoría.

## 4. Arquitectura de información

### 4.1 Navegación de Puna Operations

Agrupar la navegación actual para reducir carga cognitiva:

**Inicio**

- Resumen

**Editorial**

- Artículos
- Social Studio
- Calendario
- Marca y plantillas

**Adquisición**

- Briefs
- Prospectos
- Leads

**Sistema**

- Ejecuciones

“Ganchos”, “Inspiraciones”, “Categorías” y “Modelos” no deben ser destinos principales. Pasan a ser herramientas contextuales del compositor o subsecciones de Marca y plantillas.

### 4.2 Rutas propuestas

- `/ops/social`: cola editorial con filtros y estado.
- `/ops/social/new`: compositor de una campaña.
- `/ops/social/:campaignId`: revisión de campaña y variantes.
- `/ops/calendar`: vista de publicaciones programadas.
- `/ops/brand`: voz, templates, imágenes y reglas de canal.

Las rutas actuales de `/ops/distribution` pueden redirigir a `/ops/social` cuando se complete la migración.

## 5. Experiencia de usuario objetivo

### 5.1 Social Studio — cola de revisión

Objetivo: responder “¿qué necesita mi atención ahora?”

- Filtros por estado, canal, idioma, tipo de contenido y fecha.
- Agrupación por campaña, no tarjetas aisladas por canal.
- Cada fila muestra: título interno, objetivo, canales, fecha prevista, estado y advertencias de calidad.
- Acciones rápidas: abrir, aprobar campaña, rechazar con motivo, programar.
- Una sola acción primaria por pantalla.
- Estado vacío con siguiente paso: “Crear campaña” o “Aprobar un brief”.
- Los errores de servidor revierten cualquier cambio optimista y explican cómo recuperarse.

### 5.2 Compositor guiado

El modal actual se reemplaza por una página profunda con cuatro pasos visibles y navegación hacia atrás.

#### Paso 1 — Objetivo y fuente

- Objetivo: educar, demostrar capacidad, generar conversación o convertir.
- Audiencia: rol y tipo de empresa.
- Servicio relacionado: automatización IA, software a medida o integración de datos.
- Fuente:
  - artículo publicado;
  - brief con fuentes;
  - tema manual con enlaces de evidencia;
  - imagen/plantilla de marca;
  - aprendizaje interno sin información confidencial.
- Idioma y canales.

El formulario debe exigir fuentes cuando se seleccionen datos, tendencias o casos de clientes.

#### Paso 2 — Apertura del post

Reemplazar “Ganchos” por “Elegí cómo abrir la publicación”. Mostrar tres opciones generadas para el contexto real:

- **Problema observable:** empieza por una fricción que la audiencia reconoce.
- **Dato verificado:** usa una cifra presente en las fuentes.
- **Contraste:** compara dos formas de resolver el mismo proceso.
- **Aprendizaje real:** comunica una decisión, error o hallazgo de Puna.

Cada opción debe incluir:

- el texto editable;
- una explicación de una línea: “por qué puede funcionar”;
- una alerta si exagera, promete demasiado o requiere evidencia;
- longitud visible para cada canal;
- acción “Usar esta apertura”.

No se necesita un banco de hooks independiente en la primera versión. Los ejemplos existentes pueden alimentar el prompt como patrones, no como contenido final.

#### Paso 3 — Formato visual

Mostrar decisiones orientadas al resultado:

- Solo texto.
- Plantilla Puna con título.
- Carrusel educativo.
- Imagen de biblioteca aprobada.
- Imagen generativa experimental.

El modelo o proveedor no se muestra por defecto. “Opciones experimentales” puede contener el proveedor solo para diagnóstico administrativo.

El camino recomendado y preseleccionado será “Plantilla Puna con título”.

#### Paso 4 — Confirmación

- Resumen de fuente, objetivo, audiencia, canales, apertura, CTA y formato.
- Estimación de cantidad de variantes y activos.
- Confirmación de evidencia.
- Acción primaria “Generar borradores”.
- Progreso real por etapas: preparando contexto, generando copy, validando y componiendo activos.
- Reintento por etapa, sin reiniciar todo el trabajo.

### 5.3 Pantalla de revisión

Diseño desktop de tres zonas, adaptado a una secuencia vertical en móvil:

1. **Variantes:** lista de canales e idiomas con su estado.
2. **Preview y edición:** vista aproximada del canal, copy editable, imagen/carrusel y contador real.
3. **Decisión:** checklist de evidencia, tono, CTA, formato y accesibilidad; aprobar, rechazar o programar.

Capacidades clave:

- editar gancho, cuerpo o CTA de forma independiente;
- regenerar solo una sección, no todo el post;
- reutilizar el mismo activo visual sin volver a pagar generación;
- comparar versión original y versión editada;
- solicitar motivo al rechazar;
- autosave del borrador largo o aviso de cambios sin guardar;
- preview por canal sin simular funciones que la red no soporta.

### 5.4 Calendario real

El calendario debe derivarse de `scheduled_for`, no de constantes ni `created_at`.

Primera entrega:

- vistas lista y semana; la vista mensual se agrega cuando los datos reales justifiquen la densidad;
- zona horaria fija y visible: `America/Argentina/Buenos_Aires`;
- filtros por canal y estado;
- chips con texto + icono, nunca solo color;
- panel lateral al seleccionar una publicación;
- cambiar fecha y hora mediante formulario nativo;
- advertir colisiones de canal/horario y contenido incompleto;
- distinguir claramente `approved`, `scheduled` y `published`.

No usar drag-and-drop en la primera versión. Fecha/hora + guardar es más accesible, testeable y no requiere dependencias.

## 6. Calidad de publicaciones profesionales

### 6.1 Contrato de entrada

Toda generación debe recibir una estructura explícita:

- objetivo;
- audiencia;
- problema operativo;
- servicio relacionado;
- afirmaciones permitidas;
- fuentes o evidencia;
- tono;
- CTA;
- canales e idioma;
- restricciones de confidencialidad.

### 6.2 Contrato de salida

El modelo no debe devolver un único bloque opaco. Debe producir JSON validado con:

- `hook`;
- `body`;
- `cta`;
- `hashtags` opcionales;
- `image_headline`;
- `image_alt`;
- `evidence_refs` por afirmación;
- `channel`;
- `locale`;
- `quality_flags`;
- `generation_notes` privadas.

La UI compone esas partes y almacena además el copy final renderizado.

### 6.3 Reglas editoriales Puna

- Traducir tecnología a impacto operativo concreto.
- Usar tono calmo, técnico y seguro; evitar grandilocuencia.
- Evitar “en la era digital”, “revolucionar”, “desbloquear”, “el futuro es ahora” y equivalentes.
- No inventar cifras, clientes, porcentajes, ahorros, tiempos ni resultados.
- No afirmar que “no-code no escala” como regla universal; explicar condiciones, límites y contexto.
- Preferir ejemplos verificables, decisiones de arquitectura, checklists y aprendizajes reales.
- Cero emojis por defecto; máximo uno cuando aporte significado.
- CTA específico y coherente con el contenido: leer un artículo, revisar un servicio, conversar sobre un flujo o agendar una sesión.
- No repetir exactamente el mismo copy entre redes.
- Mantener hashtags mínimos y relevantes; no rellenar alcance artificialmente.

### 6.4 Control de calidad

Combinar validaciones determinísticas con una revisión del modelo:

- límites y estructura por canal;
- detección de frases prohibidas;
- evidencia para cifras y afirmaciones;
- similitud con publicaciones recientes para evitar repetición;
- chequeo de CTA y URL;
- ortografía y locale;
- texto alternativo de imágenes;
- verificación de que no exista texto sensible o confidencial;
- puntuación interna de claridad, especificidad, credibilidad y adecuación al canal.

Las puntuaciones son ayuda editorial, no una promesa de alcance.

## 7. Estrategia visual

### 7.1 Jerarquía de formatos

1. **Plantilla de marca + overlay determinístico** — opción recomendada.
2. **Carrusel construido con layouts de marca** — tipografía, métricas y diagramas controlados.
3. **Biblioteca de fotos/ilustraciones aprobadas**.
4. **Solo texto**.
5. **Imagen generativa** — experimental y nunca responsable de renderizar el texto final.

### 7.2 Mejora del sistema de plantillas

Cada template debe guardar:

- nombre y categoría;
- archivo base;
- relación de aspecto y canales compatibles;
- zona segura del texto;
- alineación;
- color de overlay;
- color de texto;
- tamaño mínimo/máximo;
- logo opcional;
- estado activo;
- texto alternativo base.

El título lo genera el modelo, pero la composición, ajuste de línea, contraste y exportación deben ser determinísticos.

Formatos iniciales:

- Instagram: 1080×1350;
- LinkedIn cuadrado: 1080×1080;
- LinkedIn horizontal: 1200×627;
- X horizontal: 1600×900.

### 7.3 Uso de imagen generativa

- Generar únicamente fondos o ilustraciones sin texto.
- Aplicar marca y tipografía después de la generación.
- Mostrar una sola opción recomendada, con posibilidad de regenerar.
- Guardar proveedor, modelo, costo, prompt y fecha como metadata privada.
- Reusar el activo entre canales cuando el recorte sea seguro.
- Permitir desactivar el proveedor sin romper la generación textual.

## 8. Sistema visual y accesibilidad

La dirección recomendada por UI/UX Pro Max es **Content First + Trust & Authority**. Debe aplicarse con la identidad existente de Puna, no con la paleta azul genérica sugerida por la búsqueda.

### 8.1 Decisiones visuales

- Mantener Newsreader para títulos y Plus Jakarta Sans para interfaz y cuerpo.
- Mantener papel/crema como superficie principal, caoba para navegación y terracota como acción.
- Reservar el modo oscuro para previews de redes cuando corresponda; no usar estética terminal en toda la aplicación.
- Usar bordes, espacio y jerarquía tipográfica antes que sombras o efectos decorativos.
- Espaciado basado en 4/8 px.
- Tamaño de cuerpo mínimo 16 px en formularios móviles.
- Controles de al menos 44×44 px.
- Una acción primaria por vista.
- Estados con icono, texto y color.
- Iconos Lucide consistentes; retirar emojis estructurales.
- Microinteracciones de 150–240 ms y respeto por `prefers-reduced-motion`.

### 8.2 Requisitos de accesibilidad

- Contraste WCAG AA mínimo.
- Foco visible.
- Navegación completa por teclado.
- Orden de tabulación igual al visual.
- Errores junto al campo y resumen superior con `role="alert"`.
- Gestión de foco al abrir/cerrar paneles y después de errores.
- `aria-live="polite"` para progreso y confirmaciones.
- Texto alternativo requerido antes de aprobar una imagen.
- Sin scroll horizontal a 375 px.
- Vistas probadas en 375, 768, 1024 y 1440 px.

## 9. Arquitectura técnica propuesta

### 9.1 Fuente de verdad

- `punav2` aloja UI, autenticación, server actions, auditoría y lecturas/escrituras editoriales.
- Supabase es la única base de datos de contenido.
- n8n mantiene el flujo programado artículo → borradores sociales.
- El worker Python de `autopost` se conserva inicialmente solo para generación/composición que todavía no exista en `punav2`.
- El navegador llama únicamente a rutas same-origin de Puna Operations.

### 9.2 Modelo de datos

#### Nueva tabla `social_campaigns`

Representa una idea editorial compartida por varias variantes:

- `id`;
- `title` interno;
- `objective`;
- `audience`;
- `service_cluster`;
- `source_type`;
- `source_id`;
- `source_urls`;
- `locale_strategy`;
- `status`;
- `created_by`;
- `created_at` / `updated_at`.

#### Extender `content_distribution_drafts`

Mantener la tabla actual y agregar:

- `campaign_id`;
- canal `instagram`;
- estado `rejected` y `scheduled`;
- `hook`;
- `body`;
- `cta`;
- `content_type`;
- `media_strategy`;
- `media_urls` JSON;
- `brand_template_id`;
- `image_alt`;
- `scheduled_for`;
- `published_at`;
- `rejection_reason`;
- `quality_flags` JSON;
- `generation_metadata` JSON privado.

Conservar `content` como versión final para compatibilidad con los workflows existentes.

#### Nueva tabla `brand_media_templates`

Almacena metadata de composición y referencia al archivo en Supabase Storage.

#### Tabla opcional `social_generation_runs`

Agregar en una segunda fase para estado, proveedor, modelo, costo, duración, error e idempotencia. No debe bloquear el primer flujo útil.

No crear una tabla de ganchos en la primera fase. El hook elegido vive en la variante y los patrones editoriales viven en configuración/versionado del prompt.

### 9.3 Límite del worker Python

Primera etapa:

- Puna server llama al worker mediante URL privada y token server-only.
- El servidor fija el tenant/compañía; nunca acepta `company_id` del navegador.
- CORS se restringe o se elimina si no hay llamadas desde navegador.
- Se deshabilitan endpoints de usuarios, borrado público y scheduler mientras no estén protegidos.
- Se eliminan fallbacks mock/local en producción.
- Se agregan timeout, idempotency key y respuesta estructurada por etapa.
- El worker devuelve resultados; Puna server persiste y audita.

Segunda etapa:

- mover la generación textual al stack ya usado por Puna (OpenAI + server actions/n8n) para reducir proveedores;
- mantener Python solo para composición raster si sigue aportando valor;
- evaluar portar el renderer a una función JS únicamente cuando haya pruebas de que reduce operación sin degradar tipografía o exportación.

### 9.4 Seguridad

- Toda ruta `/ops/social*`, `/ops/calendar` y `/ops/brand` usa `requireAdmin`.
- Toda mutación usa `assertTrustedMutation`.
- Service role, tokens de modelos y token del worker permanecen server-side.
- Validar IDs y enums en servidor.
- Registrar quién generó, editó, aprobó, rechazó, programó y marcó como publicado.
- Rate limit e idempotencia para evitar dobles generaciones y costos duplicados.
- URLs de origen y de media se validan y normalizan.
- Storage separa assets base de resultados generados.

## 10. Plan de implementación priorizado

### Fase 0 — Seguridad y contrato de integración

Entregables:

- inventario de qué Supabase usa cada proyecto y backup;
- autenticación del worker y restricción de CORS;
- retiro de `company_id` del contrato público;
- eliminación de mocks y fallbacks silenciosos en producción;
- esquema JSON de generación por partes;
- feature flag server-side para habilitar el Studio solo al administrador.

Criterios de aceptación:

- ninguna llamada anónima puede generar, aprobar, eliminar o listar contenido privado;
- ninguna clave sensible aparece en el bundle;
- un backend caído produce un error recuperable visible;
- reintentar una solicitud con la misma idempotency key no duplica activos.

### Fase 1 — Unificar la cola social en Puna Operations

Entregables:

- migraciones de `social_campaigns` y extensiones de `content_distribution_drafts`;
- `/ops/social` y `/ops/social/:campaignId`;
- revisión agrupada por campaña;
- edición de copy, aprobación, rechazo con motivo y auditoría;
- soporte LinkedIn, X e Instagram;
- redirección progresiva desde `/ops/distribution`.

Criterios de aceptación:

- los borradores existentes de n8n aparecen sin perder compatibilidad;
- guardar, aprobar y rechazar persisten antes de actualizar la UI;
- aprobar no programa ni publica;
- una campaña puede contener variantes por canal e idioma;
- errores de validación indican campo y forma de corregirlo.

### Fase 2 — Compositor profesional y plantillas visuales

Entregables:

- `/ops/social/new` con los cuatro pasos;
- selección contextual de aperturas;
- generación estructurada por canal;
- edición/regeneración de hook, cuerpo y CTA por separado;
- `/ops/brand` con templates y biblioteca;
- integración de overlay determinístico;
- preview y recortes por formato.

Criterios de aceptación:

- una plantilla de marca produce un PNG con texto legible y sin depender del modelo de imagen;
- el usuario nunca necesita conocer el nombre del modelo;
- regenerar copy no regenera ni vuelve a cobrar la imagen;
- ninguna cifra sin evidencia supera la validación de aprobación;
- la experiencia completa funciona con teclado y a 375 px.

### Fase 3 — Calendario editorial real

Entregables:

- `/ops/calendar` con lista y semana;
- fecha/hora por variante;
- filtros y advertencias de conflicto;
- acción separada de programar/desprogramar;
- enlaces profundos a la revisión.

Criterios de aceptación:

- cambiar de mes no repite contenido ficticio;
- solo aparece contenido con fecha real;
- zona horaria visible y consistente;
- mover una fecha no cambia aprobación ni publicación;
- el navegador Atrás conserva filtros y posición cuando sea viable.

### Fase 4 — Calidad, observabilidad y aprendizaje

Entregables:

- validadores determinísticos;
- critic basado en evidencia;
- detección de duplicados y clichés;
- registro de runs, costo, modelo y duración;
- métricas reales del proceso editorial;
- historial de versiones.

Criterios de aceptación:

- cero claims cuantitativos no respaldados en contenido aprobado;
- los errores del proveedor son trazables sin exponer secretos;
- se puede comparar original y versión aprobada;
- el panel informa tiempo de generación real, no simulaciones.

### Fase 5 — Publicación y performance, solo después de estabilizar

Opcional:

- conectores oficiales para publicar;
- aprobaciones por rol;
- reintentos y webhooks de publicación;
- importación de métricas de rendimiento;
- recomendaciones basadas en publicaciones reales.

Antes de esta fase, “Marcar publicado” seguirá siendo una confirmación manual.

## 11. Migración desde `autopost`

1. Congelar cambios funcionales en el frontend Next.js separado.
2. Confirmar si ambos proyectos apuntan al mismo Supabase.
3. Inventariar registros reales; excluir mocks.
4. Copiar metadata y archivos útiles de `brand-assets`.
5. Migrar templates válidos a `brand_media_templates`.
6. Mapear `generated_assets` reales a campañas y variantes.
7. Mantener el frontend anterior en modo lectura durante una verificación corta.
8. Comparar conteos, estados y URLs de media.
9. Retirar el frontend anterior cuando exista paridad de cola, aprobación y template overlay.
10. Conservar el backend solo como worker privado o retirarlo por módulos.

## 12. Métricas de producto

Medir solo datos reales:

- tiempo desde idea hasta primer borrador;
- tiempo desde borrador hasta decisión;
- tasa de aprobación sin cambios;
- cantidad media de revisiones;
- porcentaje de publicaciones que usan templates de marca;
- errores y costo por generación;
- publicaciones programadas vs. publicadas;
- duplicados o claims rechazados;
- conversión de CTA cuando exista tracking confiable.

No usar “horas ahorradas” salvo que se defina una fórmula auditable basada en tiempos observados.

## 13. Fuera de alcance inicial

- multi-tenancy comercial;
- alta de usuarios desde el Studio;
- publicación automática sin confirmación humana;
- drag-and-drop del calendario;
- selector público de modelos;
- generación fotorrealista como formato predeterminado;
- banco independiente de hooks;
- analítica predictiva de viralidad;
- otro frontend, CMS o design system paralelo.

## 14. Definición de “buen producto” para esta integración

La primera versión se considera exitosa cuando una persona puede:

1. abrir Puna Operations;
2. crear una campaña desde un artículo, evidencia, tema o imagen aprobada;
3. entender y elegir una apertura sin conocer jerga de marketing;
4. generar variantes profesionales por canal;
5. obtener una pieza visual consistente desde una plantilla Puna;
6. editar y validar evidencia;
7. aprobar o rechazar con feedback inequívoco;
8. programar una fecha real;
9. registrar la publicación manual;
10. recuperar cualquier error sin perder el trabajo.

Todo esto debe ocurrir en una sola aplicación, con una sola fuente de verdad y sin exponer credenciales ni confundir contenido simulado con contenido real.
