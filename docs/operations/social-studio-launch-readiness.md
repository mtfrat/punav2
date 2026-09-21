# Social Studio — funcionalidades y preparación para producción

Última revisión: 21 de septiembre de 2026  
Puna: `7ec6196` en `codex/social-studio-launch-hardening`  
Worker: `7df8e61` en `codex/content-worker-launch-polish`

## Resumen ejecutivo

Social Studio es un sistema privado de operaciones de contenido para preparar campañas bilingües, producir piezas visuales, revisar evidencia, aprobar, calendarizar y registrar publicaciones realizadas manualmente. No publica en redes, no usa OAuth social, no ejecuta cron social y no almacena credenciales de LinkedIn, Instagram o X.

El núcleo funcional está implementado, automatizado y probado. El worker productivo está operativo y cerrado. Puna tiene un preview final READY, pero todavía no debe promoverse a producción: faltan assets reales de marca y la matriz manual completa de presets, carrusel, reel, calendario, accesibilidad y captación.

Estado de salida: **release candidate profesional, aún no go-live**.

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

### Worker productivo

- `GET /health`: `200`, servicio `puna-content-worker`, versión `1`.
- `GET /api/v1/capabilities` sin token: `401`.
- `/docs`, `/redoc` y `/openapi.json`: `404`.
- Scheduler productivo deshabilitado.

### Preview final de Puna

- URL: `https://punav2-mfykck524-mfrats-projects.vercel.app`.
- Deployment: `dpl_58yAJZe8S5D8cDwvCsaMSftzSpXY`.
- Commit: `7ec6196`.
- Estado: READY.
- Build: 25 segundos.
- Runtime observado: cero warnings, cero errors y cero fatals.
- Producción de Puna no fue modificada.

## Estado de datos al cierre

- Assets de marca: 5 totales, 0 activos.
- Artículos: 20 filas, 16 grupos.
- Artículos archivados: 12.
- Artículos en borrador: 8 filas, equivalentes a 4 pares bilingües.
- Campañas sociales: 6 totales; 4 archivadas y 2 en borrador.
- Variantes sociales: 14 totales; 8 archivadas, 5 en borrador y 1 aprobada.
- Variantes por formato: 8 individuales, 2 carruseles y 4 de texto.
- Referencias de medios inexistentes: 0.

## Bloqueantes antes de producción

### P0 — necesarios para declarar go-live

1. **Biblioteca real de marca**
   - Subir y activar una captura anonimizada de un sistema real.
   - Subir y activar un diagrama real de arquitectura o proceso.
   - Subir y activar una imagen propia de trabajo, equipo o producto.
   - Completar título, categoría, alt text y punto focal.

2. **Matriz visual manual**
   - Comparar lado a lado Editorial, Evidencia, Sistema e Imagen.
   - Verificar marca, dominio, contraste, recortes y ausencia de texto cortado.
   - Probar 4:5, 1:1 y horizontal con titulares largos y normales.

3. **Carrusel E2E final**
   - Editar, mover, duplicar y eliminar placas.
   - Verificar JPEG de Instagram y PDF de LinkedIn.
   - Confirmar nuevamente el bloqueo por hash desactualizado.

4. **Reel E2E final**
   - Elegir cinco clips reales, renderizar y comprobar MP4 y portada.
   - Verificar 1080×1920, H.264, 15–30 segundos, cinco escenas, zona segura y ausencia de audio.
   - Probar aprobar, programar, reprogramar, desprogramar y archivar sin marcar publicada.

5. **Calendario y accesibilidad**
   - Confirmar colisión para el mismo canal y ausencia de colisión entre canales distintos.
   - Completar recorrido por teclado y foco visible.
   - Verificar hit targets efectivos de 44 px y `prefers-reduced-motion`.

6. **Regresión pública final**
   - Probar manualmente ambos prompts del bot.
   - Revisar consola sin errores de React o hidratación.
   - Enviar un formulario con prefijo `PRUEBA` y comprobar el lead en Operations.
   - Revalidar el botón de aprobación deshabilitado en el preview final autenticado.

7. **Rollout de Puna**
   - Confirmar variables productivas y URL/token del worker productivo.
   - Desplegar Puna con reels inicialmente apagados.
   - Ejecutar smoke de seguridad, imagen, carrusel, calidad y calendario.
   - Activar reels y ejecutar un reel de prueba.
   - No publicar ni marcar publicada durante el smoke.
   - Ejecutar nuevamente el reconciliador de Storage.

### P1 — cierre editorial, no bloquea el motor

- Asignar reviewer humano a los tres pares evergreen.
- Revisar y aprobar los pares antes de cualquier publicación.
- Decidir si se conserva, actualiza o archiva el cuarto par bilingüe previo.
- Mejorar fuentes de la campaña de demostración para elevar la credibilidad editorial por encima del score observado de 61/100.

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

- No hay assets reales activos; Puna Imagen no puede demostrar calidad de marca real.
- Carrusel y reel no completaron la prueba manual final de principio a fin en el release candidate.
- La accesibilidad se comprobó parcialmente, no con recorrido completo por teclado.
- El contenido de prueba aprobado conserva una advertencia de credibilidad por fuente insuficiente.
- Puna aún no atravesó el rollout y smoke productivo controlado.

## Decisión recomendada

**No promover todavía.** Completar los siete bloques P0 en Preview, registrar evidencia visual y recién entonces promover Puna siguiendo el rollout con reels apagados. Si esos bloques pasan sin defectos críticos, la versión puede declararse profesional y apta para una operación manual inicial de una campaña por semana.

## Runbook de salida

1. Cargar y activar los tres assets reales.
2. Ejecutar presets, carrusel, reel, calendario y accesibilidad.
3. Ejecutar bot, consola y captación pública.
4. Corregir cualquier P0 y repetir sólo la prueba afectada más el smoke básico.
5. Confirmar variables productivas sin exponer secretos.
6. Desplegar Puna a producción con reels apagados.
7. Ejecutar smoke sin publicar contenido.
8. Activar reels y probar una pieza temporal.
9. Archivar la pieza temporal y reconciliar Storage.
10. Registrar la decisión final de go-live.
