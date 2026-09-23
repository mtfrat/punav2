import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface DecisionActor {
  email: string;
  userId?: string;
  source: "web" | "telegram";
}

export interface ExecutionResult {
  ok: boolean;
  message: string;
  executedDecisions: number[];
  details?: Record<string, any>;
}

function getSupabaseClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[NightshiftExecutor] Supabase URL or Key missing.");
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function loadDecisionsState(): Promise<Record<string, any>> {
  const state: Record<string, any> = {};

  // 1. Try filesystem state
  try {
    const raw = await readFile(resolve(process.cwd(), "reports", "decisions-state.json"), "utf-8");
    Object.assign(state, JSON.parse(raw));
  } catch {}

  // 2. Fallback/merge from Supabase audit log for durability across serverless deploys
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("entity_id, after_state, created_at")
        .eq("entity_type", "nightshift_decision")
        .order("created_at", { ascending: true });

      if (data && Array.isArray(data)) {
        for (const row of data) {
          if (row.entity_id && row.after_state) {
            state[row.entity_id] = {
              status: row.after_state.status || "approved",
              updated_at: row.created_at,
              notes: row.after_state.notes || "",
            };
          }
        }
      }
    } catch {}
  }

  return state;
}

export async function saveDecisionsState(state: Record<string, any>): Promise<void> {
  try {
    const dir = resolve(process.cwd(), "reports");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "decisions-state.json"), JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("[NightshiftExecutor] Could not write decisions-state.json (expected in serverless):", err);
  }
}

async function getReportMarkdown(dateStr: string): Promise<string> {
  const reportsDir = resolve(process.cwd(), "reports");
  try {
    const filePath = join(reportsDir, `morning-brief-${dateStr}-puna-tech.md`);
    return await readFile(filePath, "utf-8");
  } catch {}

  // Fallback to searching any report with that date
  return "";
}

interface ParsedProspect {
  name: string;
  market: string;
  vertical: string;
  role: string;
  friction: string;
  strategy: string;
  subject: string;
}

interface ParsedSocialPost {
  channel: "linkedin" | "x" | "instagram";
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
}

function parseReportData(markdown: string) {
  const lines = markdown.split("\n");

  // Parse Social
  const socialPosts: ParsedSocialPost[] = [];
  let inSocial = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("### 📱 Redes Sociales & Autopost")) inSocial = true;
    else if (line.startsWith("### ")) inSocial = false;
    else if (inSocial && line.startsWith("- **[")) {
      const match = line.match(/- \*\*\[(LINKEDIN|X|INSTAGRAM)\]\*\* ["']?([^"']+)["']?/i);
      if (match) {
        const rawChannel = match[1].toLowerCase() as "linkedin" | "x" | "instagram";
        const hook = match[2];
        const nextLine = lines[i + 1]?.trim() || "";
        socialPosts.push({
          channel: rawChannel,
          hook,
          body: hook,
          cta: "¿Cómo manejan hoy este proceso en su equipo? Los leemos.",
          hashtags: ["#PunaTech", "#SoftwareEngineering", "#AIWorkflows"],
        });
      }
    }
  }

  // Parse Prospects with robust parser
  const prospects: ParsedProspect[] = [];
  let inProspects = false;
  let currentProspect: Partial<ParsedProspect> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("### 🎯 Prospección B2B")) inProspects = true;
    else if (line.startsWith("### ")) inProspects = false;
    else if (inProspects && line.startsWith("- **") && line.includes("Target:")) {
      if (currentProspect?.name) {
        prospects.push({ ...currentProspect } as ParsedProspect);
      }
      const nameMatch = line.match(/- \*\*([^*]+)\*\*/);
      const name = nameMatch ? nameMatch[1].trim() : "Empresa B2B";
      const roleMatch = line.match(/Target:\*?\s*(.+)$/);
      const role = roleMatch ? roleMatch[1].replace(/^[\*\s]+|[\*\s]+$/g, "") : "Contacto Clave";
      const vertMatch = line.match(/\[([^\]]+)\]/);
      const vertical = vertMatch ? vertMatch[1].trim() : "Operaciones B2B";

      const beforeTarget = line.split("—")[0] || line;
      const afterName = beforeTarget.replace(/- \*\*[^*]+\*\*\s*/, "").trim();
      const beforeBrackets = afterName.split("[")[0].trim();
      const market = beforeBrackets.replace(/^\(|\)$/g, "").trim() || "LatAm";

      currentProspect = {
        name,
        market,
        vertical,
        role,
        friction: "",
        strategy: "",
        subject: "",
      };
    } else if (currentProspect && line.includes("*Cuello de botella:*")) {
      currentProspect.friction = line.replace(/.*\*Cuello de botella:\*/, "").trim();
    } else if (currentProspect && line.includes("*Estrategia:*")) {
      currentProspect.strategy = line.replace(/.*\*Estrategia:\*/, "").trim();
    } else if (currentProspect && line.includes("*Asunto sugerido:*")) {
      currentProspect.subject = line.replace(/.*\*Asunto sugerido:\*/, "").replace(/["']/g, "").trim();
    }
  }
  if (currentProspect?.name) {
    prospects.push({ ...currentProspect } as ParsedProspect);
  }

  return { socialPosts, prospects };
}

function mapVertical(rawVertical: string): "general_agency" | "marketing_agency" | "growth_agency" | "creative_agency" {
  const v = rawVertical.toLowerCase();
  if (v.includes("creativ") || v.includes("brand") || v.includes("diseño")) return "creative_agency";
  if (v.includes("growth") || v.includes("performance")) return "growth_agency";
  if (v.includes("marketing") || v.includes("medios") || v.includes("publicidad")) return "marketing_agency";
  return "general_agency";
}

function mapCountryCode(market: string): "AR" | "MX" | "CL" | "CO" | "PE" | "UY" | "CR" {
  const m = market.toLowerCase();
  if (m.includes("chile") || m.includes("cl")) return "CL";
  if (m.includes("méxico") || m.includes("mexico") || m.includes("cdmx")) return "MX";
  if (m.includes("colombia") || m.includes("bogota") || m.includes("medellin")) return "CO";
  if (m.includes("perú") || m.includes("peru") || m.includes("lima")) return "PE";
  if (m.includes("uruguay") || m.includes("montevideo")) return "UY";
  if (m.includes("costa rica")) return "CR";
  return "AR";
}

/**
 * Executes a Nightshift decision or all decisions at once.
 */
export async function executeNightshiftDecision(options: {
  decisionNumOrAll: number | string;
  dateStr: string;
  actor: DecisionActor;
  notes?: string;
  reportContent?: string;
}): Promise<ExecutionResult> {
  const { decisionNumOrAll, dateStr, actor, notes } = options;
  const isAll = String(decisionNumOrAll).toLowerCase() === "all";
  const targetNumbers = isAll ? [1, 2, 3, 4, 5] : [Number(decisionNumOrAll)];

  const markdown = options.reportContent || (await getReportMarkdown(dateStr));
  const { socialPosts, prospects } = parseReportData(markdown);

  const supabase = getSupabaseClient();
  const states = await loadDecisionsState();
  const executedDecisions: number[] = [];
  const actionSummaries: string[] = [];

  for (const num of targetNumbers) {
    const decisionId = `${dateStr}-dec-${num}`;

    // Mark as approved in state
    states[decisionId] = {
      status: "approved",
      updated_at: new Date().toISOString(),
      notes: notes || `Aprobado vía ${actor.source}`,
    };

    // 1. Redes Sociales & Autopost Drafts
    if (num === 1) {
      if (supabase && socialPosts.length > 0) {
        try {
          const campaignTitle = `Campaña Nightshift ${dateStr}`;
          const sourceId = `nightshift-${dateStr}`;

          // Create/update campaign in draft mode
          const { data: campaign, error: campErr } = await supabase
            .from("social_campaigns")
            .upsert(
              {
                title: campaignTitle,
                source_type: "brief",
                source_id: sourceId,
                status: "draft",
                objective: "demonstrate",
                service_cluster: "ai-automation",
                cta_type: "conversation",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "source_type,source_id" }
            )
            .select("id")
            .single();

          if (campErr) {
            console.warn("[NightshiftExecutor] Social campaign upsert warning:", campErr.message);
          }
          if (!campErr && campaign?.id) {
            for (const post of socialPosts) {
              const fullContent = `${post.hook}\n\n${post.body}\n\n${post.cta}\n\n${post.hashtags.join(" ")}`;
              await supabase
                .from("content_distribution_drafts")
                .upsert(
                  {
                    campaign_id: campaign.id,
                    translation_group_id: sourceId,
                    locale: "es",
                    channel: post.channel,
                    content: fullContent.slice(0, post.channel === "x" ? 275 : 2200),
                    hook: post.hook.slice(0, 500),
                    body: post.body.slice(0, 3000),
                    cta: post.cta.slice(0, 300),
                    hashtags: post.hashtags,
                    status: "draft",
                    content_type: "structured",
                    media_strategy: "text_only",
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "translation_group_id,locale,channel" }
                );
            }
            actionSummaries.push(`📱 #1: Generada campaña con ${socialPosts.length} borradores en Autopost Studio (/ops/social).`);
          } else {
            actionSummaries.push(`📱 #1: Aprobado (Redes).`);
          }
        } catch (e: any) {
          console.warn("[NightshiftExecutor] Social insert failed:", e.message);
          actionSummaries.push(`📱 #1: Aprobado.`);
        }
      } else {
        actionSummaries.push(`📱 #1: Aprobado en checklist.`);
      }
      executedDecisions.push(1);
    }

    // 2. B2B Prospects & Outreach Drafts
    else if (num === 2) {
      if (supabase && prospects.length > 0) {
        try {
          let insertedCount = 0;
          for (const pr of prospects) {
            const slug = pr.name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 40);
            const sourceRecordId = `nightshift-${dateStr}-${slug}`;

            const { data: account, error: accErr } = await supabase
              .from("prospect_accounts")
              .upsert(
                {
                  source: "nightshift_ai",
                  source_record_id: sourceRecordId,
                  business_name: pr.name,
                  category: pr.vertical,
                  vertical: mapVertical(pr.vertical),
                  country_code: mapCountryCode(pr.market),
                  city: pr.market,
                  score: 85,
                  status: "new",
                  signals: {
                    cuello_de_botella: pr.friction,
                    estrategia: pr.strategy,
                    target_role: pr.role,
                  },
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "source,source_record_id" }
              )
              .select("id")
              .single();

            if (accErr) {
              console.warn("[NightshiftExecutor] Prospect upsert warning:", accErr.message);
            }
            if (!accErr && account?.id) {
              const draftSubject = (pr.subject || `Optimización operativa para ${pr.name}`).slice(0, 170);
              const draftMessage = [
                `Hola ${pr.role},`,
                "",
                `Detectamos que en ${pr.name} enfrentan un desafío operativo: ${pr.friction}`,
                "",
                `Nuestra propuesta de valor: ${pr.strategy}`,
                "",
                `¿Tendrías 10 minutos esta semana para una breve demo técnica?`,
                "",
                `Saludos,`,
                `Equipo Puna Tech`,
              ].join("\n").slice(0, 2800);

              await supabase
                .from("prospect_drafts")
                .upsert(
                  {
                    prospect_id: account.id,
                    subject: draftSubject,
                    message: draftMessage,
                    status: "draft",
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "prospect_id" }
                );
              insertedCount++;
            }
          }
          actionSummaries.push(`🎯 #2: Importados ${insertedCount} prospectos calificados a /ops/prospects con borradores listos.`);
        } catch (e: any) {
          console.warn("[NightshiftExecutor] Prospect insert failed:", e.message);
          actionSummaries.push(`🎯 #2: Aprobado.`);
        }
      } else {
        actionSummaries.push(`🎯 #2: Aprobado en checklist.`);
      }
      executedDecisions.push(2);
    }

    // 3. Oportunidad de Nicho / Monetización Pasiva
    else if (num === 3) {
      actionSummaries.push(`💡 #3: Aprobada oportunidad de nicho (priorizada para el próximo ciclo nocturno).`);
      executedDecisions.push(3);
    }

    // 4. Demo / Showcase
    else if (num === 4) {
      actionSummaries.push(`🛠️ #4: Aprobado demo interactivo para revisión de integración.`);
      executedDecisions.push(4);
    }

    // 5. Tech Audit / Refactor
    else if (num === 5) {
      actionSummaries.push(`⚡ #5: Aprobado refactor técnico.`);
      executedDecisions.push(5);
    }

    // Record audit entry in Supabase
    if (supabase) {
      try {
        await supabase.from("admin_audit_log").insert({
          actor_user_id: actor.userId || "00000000-0000-0000-0000-000000000000",
          actor_email: actor.email,
          action: "nightshift_decision_approved",
          entity_type: "nightshift_decision",
          entity_id: decisionId,
          after_state: {
            decisionId,
            status: "approved",
            actorSource: actor.source,
            timestamp: new Date().toISOString(),
          },
        });
      } catch {}
    }
  }

  await saveDecisionsState(states);

  return {
    ok: true,
    message: isAll
      ? `🎉 ¡Todas las decisiones de hoy (${executedDecisions.length}) fueron aprobadas y aplicadas!`
      : actionSummaries[0] || `Decisión #${decisionNumOrAll} aprobada exitosamente.`,
    executedDecisions,
    details: {
      actionSummaries,
    },
  };
}
