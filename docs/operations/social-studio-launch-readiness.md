# Social Studio — funcionalidades y preparación para producción

Última revisión: 22 de septiembre de 2026
Puna: `c253621` en `codex/social-studio-launch-hardening`
Worker: `f8afd31` en `codex/content-worker-launch-polish`

## Resumen ejecutivo

Social Studio es un sistema privado de operaciones de contenido para preparar campañas bilingües, producir piezas visuales, revisar evidencia, aprobar, calendarizar y registrar publicaciones realizadas manualmente. No publica en redes, no usa OAuth social, no ejecuta cron social y no almacena credenciales de LinkedIn, Instagram o X.

El núcleo funcional está implementado y probado. El worker productivo está operativo, cerrado y corregido para titulares largos y carruseles estructurados. Puna tiene un preview READY; la biblioteca real, la matriz visual, el carrusel, el calendario, la accesibilidad, el bot y la captación ya pasaron pruebas reales. El flujo de reels superó la búsqueda e importación de cinco clips reales; Cloudinary está ensamblando el MP4 final.

Estado de salida: **release candidate profesional para el flujo manual principal; go-live retenido hasta validar el MP4 y completar el smoke productivo**.

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
- Portada JPEG de reel generada y revisada visualmente; el MP4 se encuentra en ensamblado asíncrono.
- Dos ajustes de restricciones de `social_generation_runs` aplicados en Supabase para aceptar `reel_sources`, `reel_render`, la etapa `importing` y secciones `import:<scene_id>`.
- La vista editorial del reel recibió un ajuste de contraste para su texto auxiliar; la suite frontend completa volvió a pasar.

### Worker productivo

- `GET /health`: `200`, servicio `puna-content-worker`, versión `1`.
- `GET /api/v1/capabilities` sin token: `401`.
- `/docs`, `/redoc` y `/openapi.json`: `404`.
- Scheduler productivo deshabilitado.
- Deployment productivo: `dpl_u1R2tdgdrn7K7rgUe5q6LsKCqAkr`.
- Alias productivo: `https://autopost-ochre-two.vercel.app`.

### Preview final de Puna

- URL: `https://punav2-mzplzpth1-mfrats-projects.vercel.app`.
- Commit: `c253621`.
- Estado: READY.
- Runtime observado: sin errores de React ni hidratación en el recorrido final.
- Producción de Puna no fue modificada.

## Estado de datos al cierre

- Assets de marca: 8 totales, 3 activos y 5 imports legacy inactivos.
- Artículos: 20 filas, 16 grupos.
- Artículos archivados: 12.
- Artículos en borrador: 8 filas, equivalentes a 4 pares bilingües.
- Campañas sociales: 8 totales; incluye una campaña QA de carrusel programada y una campaña QA de reel en borrador.
- Variantes sociales: 17 totales.
- Carrusel QA: Instagram y LinkedIn programados para el 23 de septiembre de 2026 a las 10:00 ART; programar no publica.
- Reel QA: Instagram, 5 escenas, 20 segundos, en borrador.
- Referencias de medios inexistentes: 0.

## Bloqueantes antes de producción

### P0 — necesarios para declarar go-live completo

1. **Terminar el Reel E2E**
   - Confirmar que el render asíncrono de Cloudinary termina correctamente.
   - Comprobar MP4 1080×1920, H.264, 15–30 segundos, cinco escenas, zona segura y ausencia de audio.
   - Aprobar, programar, reprogramar y desprogramar sin marcar publicada.

2. **Rollout de Puna**
   - Promover primero con `CONTENT_REELS_ENABLED=false`.
   - Ejecutar smoke de seguridad, imagen, carrusel, calidad y calendario.
   - Activar reels sólo después de la validación del MP4.
   - Ejecutar nuevamente el reconciliador de Storage.

### P1 — cierre editorial, no bloquea el motor

- Asignar reviewer humano a los tres pares evergreen.
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

- El MP4 asíncrono todavía debe terminar y verificarse con sus metadatos reales y una revisión visual.
- El contenido QA aprobado conserva una advertencia de credibilidad por fuente insuficiente; esto demuestra que el guardrail funciona, pero esa pieza no debe publicarse.
- Puna aún no atravesó el rollout y smoke productivo controlado.

## Decisión recomendada

**No declarar todavía el go-live completo.** El flujo principal —copy, evidencia, imágenes, carrusel, aprobación, calendario y publicación manual— ya alcanza nivel profesional. Finalizar el MP4 y después promover Puna con reels apagados para el primer smoke. Si el smoke principal pasa, se puede operar en producción; reels se habilita sólo después de su prueba completa.

## Runbook de salida

1. Confirmar el MP4 final y revisar dimensiones, codecs, duración y legibilidad.
2. Aprobar, programar y desprogramar el reel de prueba sin publicarlo.
3. Promover Puna a producción con reels apagados.
4. Ejecutar smoke de acceso, bot, captación, imagen, carrusel, calidad y calendario sin publicar contenido.
5. Activar reels y repetir la pieza temporal en producción.
6. Desprogramar o archivar las piezas `QA final` y reconciliar Storage.
7. Registrar la decisión final de go-live.
