# Art Studio — activación del piloto

Art Studio queda implementado como un piloto privado integrado con Social Studio. No publica contenido, no crea una segunda biblioteca y no hace generación paga de imágenes.

## Alcance implementado

- Brief con audiencia, problema, tesis, perspectiva Puna, objetivo, CTA, hechos y restricciones.
- Dos rutas visuales documentadas y una selección razonada.
- Tres piezas fijas: portada/idea, prueba visual y carrusel explicativo.
- Composición con las plantillas y el worker existentes. El carrusel produce una portada y entre dos y ocho placas.
- Biblioteca de marca ampliada con fuente, estado de derechos, vencimiento y consentimiento de personas.
- Vista de grilla, checklist humano, registro de tiempo/rondas/costo/problemas y versiones inmutables.
- Entrega explícita a la campaña vinculada de Social Studio, conservando dirección, piezas, activos, derechos y versión.

## Activación segura

1. Aplicar `supabase/migrations/20260923120000_art_studio_pilot.sql` después de las migraciones de Social Studio.
2. Completar derechos y procedencia de los activos que participarán del piloto; los activos existentes quedan como `unverified`.
3. Confirmar que `CONTENT_STUDIO_ENABLED`, `CONTENT_COMPOSER_ENABLED` y el worker visual funcionan en el entorno.
4. Habilitar `ART_STUDIO_ENABLED=true` únicamente para el entorno del piloto.
5. Crear una campaña real de Puna, producir las tres piezas y completar las dos revisiones humanas.

La entrega abre el compositor de Social Studio. Copy final, evidencia, aprobación, calendario y cualquier salida siguen sujetos a sus controles normales. Art Studio no publica ni programa automáticamente.

## Criterio de cierre

Registrar en la campaña el tiempo de producción, rondas, costo, problemas de material y límites del sistema. Si el piloto falla, clasificar la causa como concepto, material, composición, renderizador o revisión antes de ampliar el producto.
