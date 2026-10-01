import assert from "node:assert/strict";
import {
  CTA_A_LABELS,
  SERVICE_CLUSTER_PATHS,
  bodyHasServiceHref,
  expectedServiceHref,
  scanCtaA,
  scanEditorialBanlist,
  validateEditorialPair,
} from "../src/lib/editorial-quality.ts";
import { copy, servicePath } from "../src/content/site.ts";

// --- Allowlist / expectedServiceHref -----------------------------------------
assert.equal(SERVICE_CLUSTER_PATHS.en["ai-automation"], "/services/ai-automation");
assert.equal(SERVICE_CLUSTER_PATHS.en["custom-software"], "/services/custom-software");
assert.equal(SERVICE_CLUSTER_PATHS.en["data-integrations"], "/services/data-integrations");
assert.equal(SERVICE_CLUSTER_PATHS.es["automatizacion-ia"], "/es/servicios/automatizacion-ia");
assert.equal(SERVICE_CLUSTER_PATHS.es["software-a-medida"], "/es/servicios/software-a-medida");
assert.equal(SERVICE_CLUSTER_PATHS.es["integraciones-de-datos"], "/es/servicios/integraciones-de-datos");

assert.equal(expectedServiceHref("en", "ai-automation"), servicePath("en", "ai-automation"));
assert.equal(expectedServiceHref("es", "automatizacion-ia"), servicePath("es", "automatizacion-ia"));
assert.equal(expectedServiceHref("es", "ai-automation"), null, "wrong locale must be rejected");
assert.equal(expectedServiceHref("en", "automatizacion-ia"), null, "wrong locale must be rejected");
assert.equal(expectedServiceHref("en", "unknown-service"), null);
assert.equal(expectedServiceHref("en", ""), null);
assert.equal(expectedServiceHref("en", null), null);

// --- bodyHasServiceHref ------------------------------------------------------
assert.equal(bodyHasServiceHref('<p>x</p><a href="/services/ai-automation">svc</a>', "/services/ai-automation"), true);
assert.equal(bodyHasServiceHref('<a href="/services/ai-automation/">svc</a>', "/services/ai-automation"), true, "trailing slash allowed");
assert.equal(bodyHasServiceHref('<a href="https://www.puna-tech.com/services/ai-automation">svc</a>', "/services/ai-automation"), true, "absolute same-path allowed");
assert.equal(bodyHasServiceHref('<a href="https://www.puna-tech.com/services/ai-automation/?utm=x#y">svc</a>', "/services/ai-automation"), true, "query/hash ignored");
assert.equal(bodyHasServiceHref('[svc](/services/ai-automation)', "/services/ai-automation"), true, "markdown link allowed");
assert.equal(bodyHasServiceHref('<a href="/services/custom-software">svc</a>', "/services/ai-automation"), false, "wrong service");
assert.equal(bodyHasServiceHref('<a href="/es/servicios/automatizacion-ia">svc</a>', "/services/ai-automation"), false, "wrong locale");
assert.equal(bodyHasServiceHref('<a href="https://example.com/services/ai-automation">svc</a>', "/services/ai-automation"), false, "external host");
assert.equal(bodyHasServiceHref("<p>no links here</p>", "/services/ai-automation"), false);
assert.equal(bodyHasServiceHref('<a href="/services/ai-automation">svc</a>', null), false);

// --- Banlist -----------------------------------------------------------------
assert.deepEqual(scanEditorialBanlist("We will revolutionize operations"), ["revolutionize"]);
assert.deepEqual(scanEditorialBanlist("Garantía total del resultado"), ["garantía"]);
assert.deepEqual(scanEditorialBanlist("Real synergy across teams"), ["synergy"]);
assert.deepEqual(scanEditorialBanlist("Una sinergia perfecta"), ["sinergia"]);
assert.deepEqual(scanEditorialBanlist("The next-gen platform"), ["next-gen"]);
assert.deepEqual(scanEditorialBanlist("la próxima generación"), ["próxima generación"]);
assert.deepEqual(scanEditorialBanlist("We delivered 30% ROI"), ["ROI percentage"]);
assert.deepEqual(scanEditorialBanlist("ROI de 40 en seis meses"), ["ROI de N"]);
assert.deepEqual(scanEditorialBanlist("Book free today"), ["Book free"]);
assert.deepEqual(scanEditorialBanlist("Auditoría gratis ahora"), ["Auditoría gratis"]);
assert.deepEqual(scanEditorialBanlist("pedí una auditoría gratuita"), ["auditoría gratuita"]);
assert.deepEqual(scanEditorialBanlist("free 15-min audit"), ["15-min audit"]);
assert.deepEqual(scanEditorialBanlist("Plain operational copy"), []);

// --- CTA A -------------------------------------------------------------------
assert.deepEqual(CTA_A_LABELS.en, [copy.en.book, copy.en.sendBrief]);
assert.deepEqual(CTA_A_LABELS.es, [copy.es.book, copy.es.sendBrief]);

const softClose = scanCtaA("en", "<p>We map the bottleneck and decide the next step.</p>");
assert.equal(softClose.hasCalOrBrief, false);
assert.equal(softClose.ok, true, "soft-close without Cal/brief must pass");

const calWrong = scanCtaA("en", '<p><a href="https://cal.com/puna-tech-r7xi5x/15min">Book free</a></p>');
assert.equal(calWrong.hasCalOrBrief, true);
assert.equal(calWrong.ok, false, "Cal + old CTA label must fail");

const calRight = scanCtaA("en", `<p><a href="https://cal.com/puna-tech-r7xi5x/15min">${copy.en.book}</a></p>`);
assert.equal(calRight.hasCalOrBrief, true);
assert.equal(calRight.ok, true, "Cal + CTA A label must pass");

const briefRightEs = scanCtaA("es", `<p><a href="/es#brief">${copy.es.sendBrief}</a></p>`);
assert.equal(briefRightEs.hasCalOrBrief, true);
assert.equal(briefRightEs.ok, true, "brief + ES CTA A label must pass");

const briefWrongEs = scanCtaA("es", '<p><a href="/es#brief">Escribinos</a></p>');
assert.equal(briefWrongEs.hasCalOrBrief, true);
assert.equal(briefWrongEs.ok, false, "brief + non-CTA-A label must fail");

const calLinkNoLabel = scanCtaA("en", '<p><a href="https://cal.com/puna-tech-r7xi5x/15min">Book a call</a></p>');
assert.equal(calLinkNoLabel.hasCalOrBrief, true);
assert.equal(calLinkNoLabel.ok, false, "Cal link without CTA A must fail");

// --- validateEditorialPair ---------------------------------------------------
const en = (overrides = {}) => ({
  locale: "en",
  title: "Operational title",
  excerpt: "Operational excerpt",
  meta_title: "Operational title",
  meta_description: "Operational meta description",
  content: '<p>Body copy</p><a href="/services/ai-automation">Explore the service</a>',
  related_service_slug: "ai-automation",
  ...overrides,
});
const es = (overrides = {}) => ({
  locale: "es",
  title: "Título operativo",
  excerpt: "Extracto operativo",
  meta_title: "Título operativo",
  meta_description: "Descripción operativa",
  content: '<p>Cuerpo</p><a href="/es/servicios/automatizacion-ia">Explorar el servicio</a>',
  related_service_slug: "automatizacion-ia",
  ...overrides,
});

// 1. Missing href → fail
assert.ok(
  validateEditorialPair([en({ content: "<p>No service link in the body.</p>" })]).some((error) =>
    error.includes("falta enlace in-body al servicio (/services/ai-automation)"),
  ),
  "missing in-body service href must fail",
);

// 2. Correct href → pass
assert.deepEqual(validateEditorialPair([en(), es()]), [], "valid pair must pass");

// 3. Wrong service → fail
assert.ok(
  validateEditorialPair([en({ content: '<a href="/services/custom-software">svc</a>' })]).some((error) =>
    error.includes("falta enlace in-body al servicio (/services/ai-automation)"),
  ),
  "wrong service link must fail",
);

// 3b. Missing related_service_slug → fail
assert.ok(
  validateEditorialPair([en({ related_service_slug: "" })]).some((error) => error.includes("related_service_slug")),
  "missing related_service_slug must fail",
);

// 4. Soft close without Cal → CTA OK
assert.deepEqual(validateEditorialPair([en({ content: '<p>Body</p><a href="/services/ai-automation">svc</a> Map the next step.</p>' })]), [], "soft close must not fail CTA");

// 5. Cal + wrong CTA label → fail
const ctaMismatch = validateEditorialPair([
  en({ content: '<a href="/services/ai-automation">svc</a><a href="https://cal.com/puna-tech-r7xi5x/15min">Book free</a>' }),
]);
assert.ok(ctaMismatch.some((error) => error.includes("CTA Cal/brief presente pero el texto no es CTA A")), "CTA mismatch must fail");
assert.ok(ctaMismatch.some((error) => error.includes("banlist")), "old CTA must also hit banlist");

// 5b. Cal + CTA A label → pass
assert.deepEqual(
  validateEditorialPair([
    en({ content: `<a href="/services/ai-automation">svc</a><a href="https://cal.com/puna-tech-r7xi5x/15min">${copy.en.book}</a>` }),
  ]),
  [],
  "Cal + CTA A must pass",
);

// 6. Banlist hit → fail with the expected message
assert.ok(
  validateEditorialPair([en({ content: '<a href="/services/ai-automation">svc</a><p>We revolutionize operations.</p>' })]).includes(
    'EN: banlist: "revolutionize".',
  ),
  "banlist hit must fail with the canonical message",
);

// Banlist also scans title/excerpt.
assert.ok(
  validateEditorialPair([en({ title: "A guarantee for your team" })]).some((error) => error.startsWith('EN: banlist: "guarantee"')),
  "title must be scanned for banlist",
);

console.log("Editorial quality: allowlist, in-body href, banlist and CTA A gates passed.");
