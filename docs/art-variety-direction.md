# Art Studio · variedad editorial

Extensión de las aplicaciones de la brandsheet y del estudio individual existente. Modo Operate con un lienzo Experience. Conserva la dirección aprobada; no rediseña la marca ni cambia las campañas guardadas.

## Direction contract

THESIS: Una identidad reconocible no exige una composición repetida. Doce estructuras independientes, no doce recoloreos, exploradas de a una.

OWN-WORLD: Se heredan terracota, crema, borgoña y tinta; Jakarta y Newsreader; fotografía cálida autorizada. Controles sobrios fuera del arte.

STORY: El usuario explora una publicación, entiende su intención, edita su mensaje y descarga un PNG. Un historial local de descargas orienta la próxima composición; nunca finge conocer publicaciones de otras sesiones o dispositivos.

FIRST VIEWPORT: Un lienzo 4:5 grande a la izquierda, selector y edición a la derecha. En móvil, lienzo seguido por controles. El cambio de composición es inmediato y no anima ni oculta el contenido.

FORM: Extensión local de la superficie aprobada. No corresponde sorteo ni nueva identidad. Semilla: no aplica. Se preserva el estudio original como primera composición.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Alcance funcional

Catálogo descargable, no integración automática con el compositor remoto. Historial de moldes descargados en este navegador, separado del historial de publicación; exploración en memoria para recorrer estructuras antes de repetir. Tendencias: consultas externas por mercado y últimos siete días, no ingesta automática ni registro persistente de evidencia. Argentina es el mercado inicial editable. No se inventan clientes, métricas ni testimonios.

## Referencia de implementación

El catálogo de `src/lib/art-compositions.ts` contiene doce composiciones, dos por familia:

| Familia | Composiciones |
| --- | --- |
| Fotografía | Fotografía + nota; Escena + epígrafe |
| Tipografía | Manifiesto; Afiche de palabras |
| Editorial | Carta abierta; Margen editorial |
| Comparativa | Dos maneras; Idea / mirada |
| Método | Ruta de trabajo; Lista de criterio |
| Conversación | Una buena pregunta; Invitación |

`src/lib/art-variety-canvas.ts` implementa las estructuras y delega Fotografía + nota al estudio original de `src/lib/art-editorial-canvas.ts`. Los lienzos reproducen los valores de la brandsheet (`src/brandsheet.css`): crema `#F7EFE2`, terracota `#BF5226`, borgoña `#702B38` y tinta `#181410`. Plus Jakarta Sans y Newsreader cursiva conservan sus roles; el componente carga las fuentes locales con los alias de canvas Art Jakarta y Art Newsreader. Son valores heredados, no un nuevo sistema de tokens. `src/art-concept.css` mantiene el arte separado de los controles y apila el estudio en una columna hasta 1100 px.

`src/components/art-composition-studio.tsx` conserva hasta 120 identificadores de descargas en `localStorage`, bajo `puna:art:download-history:v1`. El registro se actualiza al activar el enlace de descarga; no confirma que el archivo se haya guardado ni que se haya publicado. La sugerencia combina ese registro con la exploración en memoria, recorre las estructuras del ciclo y prioriza otra familia; la selección manual permanece libre. Si el almacenamiento falla, el historial sigue disponible sólo mientras la página permanece abierta.

Las ediciones se mantienen por composición mientras el componente está montado. La fotografía elegida se comparte entre los tres moldes fotográficos; acepta JPG, PNG o WebP de hasta 12 MB mediante una URL local temporal. Los textos, la exploración y la fotografía cargada no se guardan entre recargas ni se envían al servidor. El PNG se prepara a 1080 × 1350 px y sólo se ofrece cuando el texto, las fuentes y la imagen permiten completar el render; descargarlo no crea ni modifica campañas.

La investigación abre enlaces externos: Google Trends compara el tema en los últimos siete días y ofrece búsquedas en auge para el mercado elegido; TikTok Creative Center abre su página de palabras de anuncios sin aplicar esos filtros. Argentina es el valor inicial, con Uruguay, Chile, México y España disponibles. No hay ingesta automática, ranking calculado por el estudio ni almacenamiento de evidencia de tendencias.

Documentación contrastada con el contrato de `.impeccable/surfaces/src-routes-ops-art-brandsheet-tsx.md`, el catálogo, ambos renderizadores, el componente y los dos estilos citados. No existían `PRODUCT.md` ni `DESIGN.md` en la raíz al revisar esta extensión; esa brecha documental preexistente queda registrada sin inventar contexto global ni modificar la configuración de Impeccable. Esta sección documenta la implementación local y conserva el contrato de dirección anterior.

## Conexión con campañas · 2026-09-28

La ruta existente `art/:campaignId/concept` ahora recibe el brief real y los borradores guardados de esa campaña. Reutiliza el mismo editor; la brandsheet mantiene su laboratorio local. No genera mensajes con IA: tesis, perspectiva y CTA son el punto de partida y deben adaptarse a los límites de cada composición.

El guardado persiste texto y composición (una entrada por molde, hasta doce) en `social_campaigns.generation_context.editorial_drafts`, preservando las otras claves. La acción requiere sesión admin, origen confiable, validación de texto y comparación de `updated_at` antes y durante la escritura. Un conflicto conserva el texto en pantalla e indica copiarlo antes de recargar. No requiere migración adicional.

El borrador editable no altera piezas de producción, revisiones, aprobaciones ni publicación y no guarda la fotografía original. El editor también permite incorporar el PNG final a la portada o prueba visual de Art Studio. Exige función narrativa, texto alternativo, procedencia y confirmación de derechos; valida el archivo en servidor y guarda un PNG inmutable con hash, metadatos y nueva versión de campaña. Puede incluir una fotografía propia en el PNG final, pero no persiste el archivo de origen por separado. El carrusel conserva su flujo propio. La revisión humana y la entrega siguen siendo requisitos posteriores. El contexto de campaña es privado y se entrega con cabeceras no-store.

Verificación local: TypeScript, suite completa, build, test:art-variety, test:worker-bundle, test:seo y diff-check. En navegador se guardó una portada Manifiesto en la campaña demo y se comprobó la imagen, procedencia y versión 9 en Producción. No se aprobó ni publicó la campaña. El conector Vercel quedó reconectado; el estado del despliegue se registra aparte. Pendientes de alcance: generación automática de copy con evidencia de tendencias y persistencia separada de fotografías originales.
