# Social Studio — funcionalidades y preparación para producción

Última revisión: 23 de septiembre de 2026
Puna: `codex/social-studio-launch-hardening`
Worker: `f8afd31` en `codex/content-worker-launch-polish`

## Resumen ejecutivo

Social Studio es un sistema privado de operaciones de contenido para preparar campañas bilingües, producir piezas visuales, revisar evidencia, aprobar, calendarizar y registrar publicaciones realizadas manualmente. No publica en redes, no usa OAuth social, no ejecuta cron social y no almacena credenciales de LinkedIn, Instagram o X.

El núcleo funcional está implementado, probado e integrado a `master`. El worker productivo está operativo, cerrado y corregido para titulares largos y carruseles estructurados. Puna se desplegó desde `master` a producción con reels, publicación y autopublicación desactivados. La biblioteca real, la matriz visual, el carrusel, el calendario, la accesibilidad, el bot y la captación pasaron pruebas reales en preview. El flujo de reels ya produjo un MP4 real con cinco clips; la pieza QA fue aprobada con advertencias, programada y desprogramada sin publicarse.

Estado de salida: **núcleo de Social Studio validado en producción con sesión administrativa; Reel E2E validado funcionalmente en preview y H.264/sin audio confirmados. El storyboard de las cinco escenas pasó revisión en el editor; falta revisar visualmente los tramos correspondientes del MP4 final y el contenido editorial que se vaya a publicar. Reels sigue desactivado en producción**.

### Consumo de IA durante desarrollo

- Social Studio usa OpenAI para generar y revisar texto. No hay llamadas a la API de Anthropic en esta aplicación; el consumo reportado de Anthropic debe localizarse en la herramienta o servicio que usa esa clave.
- Las llamadas pagas de Social Studio quedan desactivadas por defecto en desarrollo y en deployments preview. Para una prueba de generación deliberada, configurar `CONTENT_PAID_AI_ENABLED=true` sólo en ese entorno y retirarlo después. Producción conserva su comportamiento actual.
- Las pruebas automatizadas del repositorio usan respuestas simuladas; no necesitan una clave de IA ni consumen tokens. Para Nightshift, usar `npm run nightshift:dry-run` durante desarrollo; `npm run nightshift` sí puede llamar a Gemini u OpenAI.

## Principios del producto

- Publicación 100% manual.
- Una generación automática siempre nace como borrador.
- Aprobar y programar no publican.
- La persona operadora conserva el control del acto público.
- Los hechos, interpretaciones y recomendaciones se distinguen.
- Las cifras sin evidencia bloquean la aprobación.
- Todo cambio editorial relevante conserva trazabilidad.
- El copy y el medio descargable deben corresponder a la misma versión.
- No se atribuye causalidad a las métricas manuales.

## Arquitectura de lanzamiento

### Puna Operations

- Aplicación React Router privada para el flujo editorial.
- Supabase service role utilizado únicamente en el servidor.
- Login exclusivo del administrador y cookies seguras.
- Auditoría inmutable para mutaciones administrativas.
- Feature flags independientes para estudio, compositor, calendario, calidad, visuales y reels.

### Content worker

- Renderizador separado y autenticado con Bearer token.
- Mutaciones habilitadas sólo para composición controlada.
- Scheduler deshabilitado.
- CORS deshabilitado.
- Swagger, Redoc y OpenAPI desmontados.
- Endpoint de salud mínimo y endpoint de capacidades protegido.

### Servicios externos

- OpenAI para generación y crítica editorial.
- Supabase para datos, auditoría y almacenamiento de medios.
- Pexels para búsqueda de clips de reels.
- Cloudinary para importación y ensamblado de video.
- Worker Puna para imágenes, carruseles y portadas.

## Catálogo de funcionalidades

### 1. Acceso privado y seguridad

- Redirección de rutas `/ops/*` al login sin sesión administrativa.
- Validación del único email administrador permitido.
- Protección de mutaciones por método y origen.
- Service role fuera del bundle del navegador.
- Token del worker sólo en servidor.
- Auditoría de actor, acción, entidad, estado anterior y estado posterior.
- Worker sin documentación pública ni scheduler.

### 2. Gestión de campañas

- Listado con filtros por estado, canal e idioma.
- Estados de campaña y variantes visibles.
- Creación manual desde artículo o fuente manual.
- Soporte EN/ES.
- Canales LinkedIn, Instagram y X según formato.
- Objetivo, audiencia, servicio, problema y CTA estructurados.
- Campo humano obligatorio “Qué pensamos nosotros”, de 20 a 600 caracteres.
- Tres aperturas candidatas antes de generar variantes.
- URL HTTPS verificable para campañas que requieren destino.

### 3. Generación y edición de copy

- Copy estructurado en gancho, cuerpo, CTA y hashtags.
- Voz profesional en español argentino.
- Detección de giros incompatibles con el locale.
- Apertura visible aproximada de 210 caracteres.
- Límites por canal.
- CTA alineado al objetivo: educar, demostrar, conversar, convertir o ninguno.
- Bloqueo de CTA genérico repetido.
- Hashtags normalizados sin `#` en almacenamiento.
- Máximo de cinco hashtags en LinkedIn e Instagram y dos en X.
- Regeneración independiente de gancho, cuerpo o CTA.
- Comparación con la versión generada.

### 4. Evidencia y calidad editorial

- Referencias de evidencia por afirmación y clave de fuente.
- Bloqueo de cifras sin respaldo.
- Controles determinísticos de límites, URLs, hashtags, alt text y densidad.
- Revisión asistida de claridad, credibilidad, especificidad y ajuste al canal.
- Advertencias explicables que requieren confirmación humana.
- Los bloqueos no pueden omitirse confirmando advertencias.
- La crítica se reutiliza para el mismo hash de contenido.
- Aprobar nunca publica.
- Editar una variante aprobada la devuelve a borrador.

### 5. Historial y consistencia de medios

- Historial numerado de versiones por variante.
- Comparación entre versiones de copy, evidencia, visual y estado.
- Restauración de versiones anteriores.
- Ediciones de copy o campos visuales marcan el medio como desactualizado.
- Aprobación bloqueada hasta recomponer el medio.
- El botón de aprobación también queda deshabilitado cuando `media_stale=true`.
- Reemplazo seguro: primero se guarda el render nuevo y después se retira el anterior.
- Archivar no elimina archivos.
- Verificador `scripts/reconcile-generated-media.mjs` en modo informe o `--apply`.

### 6. Sistema visual

- Preset Puna Editorial: jerarquía serif, aire editorial y acento terracota.
- Preset Puna Evidencia: dato respaldado dominante y explicación breve.
- Preset Puna Sistema: pasos o bullets en bloques numerados.
- Preset Puna Imagen: recorte por punto focal y overlay progresivo.
- Portada Reel: gancho breve, zona segura vertical y marca visible.
- Newsreader y Geist empaquetadas con sus assets correspondientes.
- Lockup con montaña, “Puna Tech” y `puna-tech.com`.
- Contraste mínimo 4.5:1.
- Rechazo controlado cuando el texto no entra.
- Previews con proporciones 4:5, 1:1, horizontal y 9:16.
- Distinción entre “Vista editorial” y “Render final”.
- Descarga JPEG para Instagram y PNG para LinkedIn.

### 7. Carruseles

- Blueprint asistido de 3 a 7 placas.
- Edición por placa.
- Reordenamiento mediante controles explícitos.
- Duplicación, agregado y eliminación dentro del rango permitido.
- Evidencia y alt text por placa.
- Assets aprobados por placa o imagen general.
- Recomposición completa después de cambios.
- Descarga de placas individuales.
- PDF ordenado para carrusel de LinkedIn.
- Hash desactualizado bloquea aprobación.

### 8. Reels manuales

- Reel vertical restringido a Instagram.
- Storyboard fijo de cinco escenas.
- Duración configurable dentro del rango operativo.
- Tres candidatos de Pexels por escena.
- Autor y enlace de atribución visibles.
- Importación server-side del clip elegido.
- Ensamblado asíncrono en Cloudinary.
- Comprobación manual del estado del render.
- MP4 vertical y portada JPEG descargables.
- Caption copiable.
- Progreso visible de importación, composición, ensamblado y portada.
- Salida sin audio para agregar audio licenciado manualmente en Instagram.

### 9. Calendario editorial

- Programación manual en `America/Argentina/Buenos_Aires`.
- Programar no publica ni ejecuta tareas en segundo plano.
- Vista semanal y vista de lista.
- Filtros y navegación de regreso conservados.
- Advertencias de proximidad para piezas del mismo canal.
- Reprogramación y desprogramación.
- Editar contenido programado lo devuelve a borrador y elimina el horario.

### 10. Publicación y performance manual

- Registro de publicación sólo después de que la persona publicó en la red.
- URL HTTPS validada para LinkedIn, Instagram, X o Twitter.
- Posibilidad de deshacer el registro de publicación.
- Métricas manuales D7 y D30.
- Impresiones, alcance, reacciones, comentarios, compartidos, guardados y clics.
- Valores desconocidos conservados como `null`.
- Insights con tamaño de muestra y medianas.
- Sin lectura automática de redes y sin atribución causal.

### 11. Biblioteca de marca

- Alta de assets con título, categoría, alt text y punto focal.
- Activación y desactivación independiente.
- Selección de assets aprobados para Puna Imagen, carruseles y reels.
- El asset ficticio “Operaciones con métricas visibles” quedó desactivado.
- Los imports legacy permanecen conservados, pero inactivos.

### 12. Bot público

- Contrato estable `{ message: string }`.
- Prompt extraído a una función testeable.
- Respuesta con lectura inicial del problema.
- Clasificación probable: software, automatización, integración o investigar primero.
- Explicación breve del motivo.
- Una sola pregunta útil para avanzar.
- Sin métricas, precios o plazos inventados.
- Invitación a llamada sólo cuando el problema ya es concreto.
- Regresiones EN/ES.

### 13. Blog bilingüe y contenido editorial

- Pares EN/ES unidos por `translation_group_id`.
- Edición, vista previa sanitizada, aprobación y publicación separadas.
- Validación de metadata, reviewer, fuentes y alt text antes de aprobar.
- Publicación de ambos idiomas como una acción explícita posterior.
- Doce artículos legacy sin fuentes archivados de forma recuperable.
- Estado vacío intencional verificado en `/blog` y `/es/blog`.
- Tres nuevos pares evergreen creados como borradores:
  - cuándo usar IA y cuándo software determinístico;
  - cómo auditar una integración CRM y seguimiento comercial;
  - cómo organizar generación, evidencia y aprobación de contenido.
- Los nuevos artículos tienen dos o tres fuentes oficiales, no tienen reviewer inventado y no están publicados.

### 14. Operations complementario

- Dashboard con colas y actividad reciente.
- Gestión de briefs editoriales.
- Gestión de leads y notas privadas.
- Gestión de prospectos y borradores de contacto manual.
- Historial de ejecuciones de generación y fallas.
- Insights operativos y editoriales.
- Acciones de archivo recuperables.

## Verificaciones completadas

### Automatizadas

- `npm test`: aprobado.
- TypeScript: aprobado.
- Cuatro workflows n8n inactivos y validados.
- Sanitización de HTML y enlaces: aprobada.
- Cliente del content worker: aprobado.
- Contratos de Social Studio: aprobados.
- Build de producción: aprobado.
- Bundle sin secretos del worker: aprobado.
- SEO/GEO inicial de ocho rutas bilingües: aprobado.
- Suite del worker y fixtures de layouts: aprobados durante el hardening.
- Worker: 26/26 pruebas aprobadas.
- Matriz del renderizador: 24 composiciones con dimensiones y MIME exactos.

### E2E y datos

- Acceso privado y login administrativo comprobados.
- Campaña LinkedIn + Instagram creada con perspectiva humana.
- PNG 1080×1080 y JPEG 1080×1350 generados y verificados.
- Bloqueo de la afirmación no respaldada “Reducimos 30%…” comprobado.
- Edición de variante aprobada devuelve a borrador y marca el medio desactualizado.
- Aprobación sin recomponer rechazada por servidor.
- Recomposición y aprobación con advertencias comprobadas.
- Programación, reprogramación y desprogramación comprobadas.
- Diez versiones trazables en la variante LinkedIn de prueba.
- Matriz de 24 combinaciones de ruta y viewport sin scroll horizontal.
- Reparación de 15 referencias rotas en seis borradores ejecutada.
- Verificación actual: cero referencias rotas después de revisar dos referencias activas.
- Blog público EN/ES muestra el estado vacío intencional.
- Biblioteca de marca: 3 assets propios activos y 5 imports legacy inactivos.
- Presets visuales: matriz de 24 composiciones aprobada, incluidos 4:5, 1:1 y horizontal.
- Carrusel final real: 5 placas en Instagram y LinkedIn; JPEG 1080×1350 y PDF ordenado verificados.
- Aprobación real con advertencias editoriales: aprobada sin publicar.
- Calendario real: Instagram y LinkedIn programados para la misma hora sin colisión cruzada; ambos visibles en semana y hora de Buenos Aires.
- Preview autenticado: 6 rutas de Operations en 375, 768 y 1440 px, 18 comprobaciones sin overflow horizontal.
- Navegación por teclado: skip link, orden de foco y anillo de foco visible comprobados.
- Bot público: dos prompts reales con diagnóstico enfocado y una sola pregunta útil.
- Captación: formulario real creado y lead verificado en Operations.
- Consola y render del preview: sin errores de React ni hidratación en el recorrido final.
- Reel final: storyboard de 5 escenas y 20 segundos generado; Pexels devolvió tres candidatos verticales por escena y cinco clips distintos fueron seleccionados e importados en Cloudinary.
- Portada JPEG de reel generada y revisada visualmente. Los primeros intentos de MP4 fallaron; el webhook firmado de Cloudinary informó `Currently can only use g_auto once in a video transformation`. Se sustituyó el encuadre automático repetido por `g_center`, se mantuvo la transformación con nombre para respetar el límite de URL y se añadió recuperación de renders iniciados con una transformación obsoleta.
- E2E de reel en preview el 23 de septiembre: Cloudinary aceptó el render corregido, Operations mostró el MP4 listo y la reproducción en navegador informó 1080×1920 y 19,96 segundos. Primer fotograma revisado visualmente: título y textos legibles dentro del cuadro. `ffprobe` confirmó un único stream H.264 1080×1920 de 19,96 s y ninguna pista de audio. El intento de decodificar todo el archivo por red no terminó en tiempo razonable y se detuvo; esto no equivale a detectar corrupción.
- La variante QA pasó por revisión editorial, aprobación explícita con cuatro advertencias (credibilidad 48/100 por falta de fuentes), programación para el 24 de septiembre a las 15:00 de Buenos Aires y desprogramación. Quedó aprobada, sin horario y sin publicar. No utilizar este copy QA para publicación.
- Dos ajustes de restricciones de `social_generation_runs` aplicados en Supabase para aceptar `reel_sources`, `reel_render`, la etapa `importing` y secciones `import:<scene_id>`.
- La vista editorial del reel recibió un ajuste de contraste para su texto auxiliar; la suite frontend completa volvió a pasar.

### Worker productivo

- `GET /health`: `200`, servicio `puna-content-worker`, versión `1`.
- `GET /api/v1/capabilities` sin token: `401`.
- `/docs`, `/redoc` y `/openapi.json`: `404`.
- Scheduler productivo deshabilitado.
- Deployment productivo: `dpl_u1R2tdgdrn7K7rgUe5q6LsKCqAkr`.
- Alias productivo: `https://autopost-ochre-two.vercel.app`.

### Despliegue de Puna

- URL: `https://punav2-mzplzpth1-mfrats-projects.vercel.app`.
- Commit: `c253621`.
- Estado: READY.
- Runtime observado: sin errores de React ni hidratación en el recorrido final.
- Deployment productivo directo de esta rama: `dpl_8WrtbmEKVXLnSXQkpyXMGS7J8iWW`, commit `9bb843b`, READY en su momento.
- Primer despliegue integrado desde `master` el 23 de septiembre: commit `b18cfd2`, deployment automático `dpl_DFBhN8wxKDjvGwMDj3NqDAchpap3`, READY en `https://www.puna-tech.com` y `https://punav2.vercel.app`. El smoke sin sesión dio `/` 200, `/es` 200, `/ops/social` 302 al login y webhook sin firma 401. Los commits posteriores de documentación generan despliegues nuevos sin cambiar este resultado funcional.
- Preview de la corrección: `https://punav2-5tf2ckr3c-mfrats-projects.vercel.app`, deployment `dpl_zD4YS15DSwfTK7Da1eKarXD355UV`, READY.
- Preview integrado con `master` al 23 de septiembre: `https://punav2-gsutlbf2g-mfrats-projects.vercel.app`, deployment `dpl_BcoQYaHQhcfMbsM7rfzgJevo6Brp`, READY; suite completa local pasó tras la integración. Smoke sin sesión: portada 200, Ops 302 al login, webhook POST sin firma 401.
- Smoke público productivo: `/` y `/es` respondieron 200; `/ops/social` sin sesión redirigió a login; POST sin firma al webhook devolvió 401.
- Banderas productivas comprobadas: `CONTENT_REELS_ENABLED=false`, `CONTENT_PUBLISHING_ENABLED=false`, `CONTENT_AUTOPUBLISH_ENABLED=false`; compositor y calendario activos.
- Verificación de datos posterior al deploy: 8 campañas, 17 variantes, 0 huérfanos. Las dos variantes QA de carrusel fueron desprogramadas y volvieron a aprobadas, sin publicación; 0 variantes programadas. Reconciliador: 0 referencias faltantes de 14 inspeccionadas.
- El smoke autenticado productivo se completó el 23 de septiembre: dashboard con colas y auditoría real; Social Studio con campañas; calendario; biblioteca con tres assets activos; insights; carrusel Instagram con cinco enlaces de placa e imagen 1080×1350 cargada; carrusel LinkedIn con cinco placas, imagen 1200×627 y enlace PDF; scorecard editorial del reel QA. La consola del navegador no mostró errores. La ruta productiva del reel QA conserva la variante aprobada sin programación y no ofrece el compositor de reels con la bandera apagada. No se modificó ni publicó contenido durante este smoke.

## Estado de datos al cierre

- Assets de marca: 8 totales, 3 activos y 5 imports legacy inactivos.
- Artículos: 20 filas, 16 grupos.
- Artículos archivados: 12.
- Artículos en borrador: 8 filas, equivalentes a 4 pares bilingües.
- Campañas sociales: 8 totales en la verificación previa; las piezas QA quedaron sin programación.
- Variantes sociales: 17 totales.
- Carrusel QA: Instagram y LinkedIn desprogramados el 22 de septiembre; quedaron aprobados, sin fecha ni publicación. La crítica editorial mostró credibilidad 48/100 por falta de fuentes; no deben publicarse tal como están.
- Reel QA: Instagram, 5 escenas, 19,96 segundos reales; variante aprobada con advertencias, sin horario y sin publicar.
- Referencias de medios inexistentes: 0.

## Bloqueantes antes de producción

### P0 — necesarios para declarar go-live completo

1. **Cerrar certificación del Reel E2E**
   - MP4 real, 1080×1920, 19,96 segundos, H.264 y sin audio comprobados; cinco escenas se concatenan en la transformación. Las vistas del editor de las escenas 1–5 tienen contenido distinto y el MP4 llegó a la segunda escena durante la reproducción. Falta revisar visualmente los tramos 3–5 del MP4 final; la vista del editor no sustituye esa comprobación. El navegador de pruebas se cerró dos veces al buscar un fotograma intermedio; no se atribuye ese fallo al archivo.
   - Aprobación, programación y desprogramación comprobadas sin marcar publicada. La reprogramación específica del reel no se repitió; el calendario ya había pasado esta prueba con otras variantes.

2. **Rollout de Puna**
   - Integración a `master` y despliegue con reels apagados completados el 23 de septiembre.
   - Smoke autenticado productivo de acceso, imagen, carrusel, calidad y calendario completado el 23 de septiembre, sin publicaciones.
   - Activar reels sólo después de la validación del MP4.
   - Reconciliador de Storage ejecutado: 0 referencias faltantes.

### P1 — cierre editorial, no bloquea el motor

- Asignar reviewer humano a los tres pares evergreen: en producción se confirmaron vacíos los campos EN y ES de los tres. No inventar una identidad ni aprobarlos hasta que una persona los revise.
- Revisar y aprobar los pares antes de cualquier publicación.
- Decidir si se conserva, actualiza o archiva el cuarto par bilingüe previo.
- Mejorar fuentes de la campaña de demostración para elevar la credibilidad editorial por encima del score observado de 61/100.
- Limpiar o archivar las campañas con prefijo `QA final` cuando termine la certificación.

## Evaluación de calidad profesional

### Lo que ya alcanza nivel profesional

- Separación clara entre generación, revisión, aprobación y publicación.
- Trazabilidad completa y estados recuperables.
- Seguridad server-side y worker cerrado.
- Evidencia obligatoria para cifras.
- Consistencia entre copy y medio mediante hash.
- Archivos con dimensiones y MIME correctos.
- Voz, CTA, hashtags y perspectiva humana controlados.
- Operación manual sin credenciales sociales ni automatización oculta.
- Métricas honestas y sin causalidad inventada.
- Diseño de fallas, reintentos e idempotencia en generación.

### Lo que todavía impide llamar profesional al lanzamiento completo

- El MP4 asíncrono terminó; dimensiones, duración, H.264, ausencia de audio y primer fotograma están verificados. Falta revisión visual de las otras cuatro escenas.
- El contenido QA aprobado conserva una advertencia de credibilidad por fuente insuficiente; esto demuestra que el guardrail funciona, pero esa pieza no debe publicarse.
- El despliegue productivo desde `master` pasó el smoke público, del webhook y autenticado. Reels permanece desactivado por decisión de rollout.

## Decisión recomendada

**El núcleo de Social Studio está técnicamente listo para la operación manual en producción.** El reel completó el E2E funcional y la validación técnica del archivo en preview, pero faltan la revisión visual de las otras cuatro escenas y una decisión editorial sobre el contenido publicable. No habilitar reels todavía. Los borradores evergreen requieren revisor humano antes de aprobar o publicar.

## Runbook de salida

1. Confirmar el MP4 final y revisar dimensiones, codecs, duración y legibilidad.
2. Aprobar, programar y desprogramar el reel de prueba sin publicarlo.
3. Promover Puna a producción con reels apagados.
4. Ejecutar smoke de acceso, bot, captación, imagen, carrusel, calidad y calendario sin publicar contenido.
5. Activar reels y repetir la pieza temporal en producción.
6. Desprogramar o archivar las piezas `QA final` y reconciliar Storage.
7. Registrar la decisión final de go-live.
