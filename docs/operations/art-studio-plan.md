# Art Studio — plan de producto

Estado: propuesta para discovery; sin implementación ni compromiso de lanzamiento.
Fecha: 23 de septiembre de 2026.

## Propósito

Crear una sección privada de Puna Operations para producir campañas visuales originales con criterio de dirección de arte. Social Studio ya organiza copy, evidencia, formatos, revisión, calendario y publicación manual; Art Studio debe aportar la capa creativa que falta: concepto, narrativa entre piezas, sistema visual por campaña y material auténtico de Puna. No debe imitar publicaciones de otras agencias ni prometer calidad profesional automática.

Supuesto inicial: Art Studio se usará primero para la comunicación de Puna Tech. La reutilización para clientes externos no entra en el MVP.

## Aprendizajes de las referencias visuales

- La primera grilla sostiene nueve publicaciones con azul, titulares grandes, objetos 3D y mockups, pero cambia la composición y el argumento de una pieza a otra. El valor transferible es la consistencia de campaña con variedad, no los objetos o frases particulares.
- La segunda grilla usa una persona reconocible, fotografía, azul y crema, y una combinación de serif y sans para construir autoridad mediante opiniones, consejos y escenas cotidianas. El valor transferible es una voz editorial sostenida.
- La tercera alterna equipo real, proceso, episodios, piezas de marca y resultados tangibles en una paleta propia. Para Puna, la lección principal es mostrar trabajo y personas reales, no depender sólo de stock o plantillas.
- Ninguna grilla debe copiarse literalmente. Las tres contienen soluciones difíciles de sostener sin fotos, casos, dirección de arte y edición humana; algunas frases de venta de las referencias también necesitarían evidencia antes de publicarse desde Puna.

## Principios del MVP

1. **Campaña antes que post.** Cada campaña define audiencia, problema, perspectiva de Puna, objetivo, oferta, CTA, serie y 3–9 piezas relacionadas.
2. **Originalidad verificable.** Priorizar fotografías propias, capturas de producto autorizadas, diagramas de procesos y casos aprobados. Stock sólo cuando aporta contexto; se registra origen y licencia.
3. **Direcciones, no plantillas infinitas.** Proponer 2–3 rutas visuales con paleta, tipografía, tratamiento de imagen, composición y ejemplos de aplicación. Una persona elige y corrige.
4. **Variedad dentro del sistema.** Alternar portada tipográfica, foto con titular, explicación visual, caso, proceso, persona y demostración; evitar nueve piezas casi idénticas.
5. **Evidencia y autorización.** Toda cifra, logo, testimonio, captura de cliente o antes/después requiere fuente y permiso. No generar personas o resultados ficticios como si fueran reales.
6. **Revisión a tamaño de uso.** Probar jerarquía, contraste, recorte, zona segura y lectura en móvil antes de exportar. El grid debe funcionar como conjunto y cada pieza por separado.
7. **Costos acotados.** Desarrollo y preview sin llamadas pagas por defecto; límite por campaña, vista previa barata, regeneración explícita y registro de costo por operación. No usar Anthropic ni otro proveedor sin decidirlo y presupuestarlo.
8. **Humano al mando.** Art Studio prepara y exporta; Social Studio conserva revisión editorial, aprobación y publicación 100% manual.

## Flujo propuesto

1. **Brief creativo:** objetivo, audiencia, tesis, prueba, oferta, canales, restricciones y material disponible.
2. **Inventario de activos:** fotos, videos, demos, capturas, casos, logos y permisos; detectar faltantes antes de diseñar.
3. **Concepto de campaña:** una idea central, 2–3 rutas visuales y mapa de 3–9 publicaciones con su función (atraer, explicar, demostrar, convertir).
4. **Dirección elegida:** fijar reglas visuales y ejemplos, sin bloquear la variación de composición.
5. **Producción de piezas:** adaptar formatos de imagen, carrusel y reel; revisión de copy, fuentes, accesibilidad y derechos.
6. **Revisión en contexto:** pieza individual, secuencia de carrusel/reel y grilla completa en tamaños móviles.
7. **Entrega a Social Studio:** exportar medios y metadatos a una campaña/borrador; no saltar su aprobación ni publicar automáticamente.
8. **Aprendizaje:** registrar métricas manuales y observaciones D7/D30 para la siguiente campaña, sin atribuir causalidad que los datos no sostienen.

## Primer piloto antes de programar

Producir manualmente una campaña pequeña de Puna con tres líneas conectadas: un caso/proceso real, una serie educativa y una escena de equipo o detrás de escena. Preparar seis a nueve piezas combinando post, carrusel y reel; usar al menos una foto o captura propia por línea. Evaluar con una persona de Puna y alguien con criterio de diseño/CM:

- ¿Se reconoce a Puna sin ver el logo?
- ¿Cada pieza tiene una idea clara y una función dentro de la campaña?
- ¿Hay variedad real de composición y material visual?
- ¿Son legibles en móvil el titular y el mensaje principal?
- ¿Los hechos, personas y resultados están autorizados y respaldados?
- ¿El conjunto parece una campaña deliberada, no nueve salidas del mismo prompt?

Guardar decisiones y problemas del piloto. Sólo después definir las pantallas y automatizaciones necesarias. Esto evita construir un editor amplio que no resuelva el verdadero cuello de botella: material propio y criterio creativo.

## Alcance de implementación a decidir tras el piloto

**MVP candidato:** briefs, campañas/series, tablero de piezas, selección de ruta visual, biblioteca de activos con derechos y punto focal, previews de grilla, checklist de calidad y exportación hacia Social Studio. Reutilizar autenticación, auditoría, biblioteca de marca, worker visual y reglas de evidencia existentes.

**Fuera del MVP:** autopublicación, reemplazo de una directora de arte/CM, generación masiva no revisada, scraping de publicaciones ajenas, promesas de performance, edición de video avanzada, multi-cliente y compra automática de medios.

## Decisiones pendientes

- Identificar responsable de la aprobación creativa y editorial.
- Elegir el primer caso y obtener fotos, capturas, permisos y resultados verificables.
- Definir presupuesto mensual de producción visual y criterio para usar generación paga de imágenes o video.
- Decidir si Art Studio sólo organiza un flujo humano o también genera propuestas visuales dentro de límites de costo.
- Tras el piloto, convertir observaciones en una especificación de MVP con criterios de aceptación y estimación.
