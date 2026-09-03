import { audit, type AdminContext } from "./admin.server.ts";
import { calendarLocalToUtc } from "./social-calendar.ts";
import { isUuid } from "./social-studio.ts";

export type ScheduleConflict = {
  id: string;
  channel: string;
  locale: string;
  scheduled_for: string;
  campaign_id: string;
  campaign_title: string;
};

export class SocialScheduleError extends Error {
  constructor(readonly code: string, readonly status: number, message: string) {
    super(message);
    this.name = "SocialScheduleError";
  }
}

function mapDatabaseError(error: { code?: string; message?: string } | null) {
  const message = error?.message || "";
  if (error?.code === "40001" || message.includes("social_variant_conflict")) return new SocialScheduleError("conflict", 409, "La variante cambió en otra pestaña. Recargá antes de continuar.");
  if (message.includes("social_variant_not_schedulable")) return new SocialScheduleError("not_schedulable", 409, "Sólo una variante aprobada o programada puede guardar una fecha.");
  if (message.includes("social_variant_not_scheduled")) return new SocialScheduleError("not_scheduled", 409, "La variante ya no está programada. Recargá antes de continuar.");
  if (message.includes("social_schedule_must_be_future")) return new SocialScheduleError("past_time", 422, "Elegí una fecha futura en hora de Buenos Aires.");
  if (error?.code === "22007" || message.includes("invalid_social_schedule")) return new SocialScheduleError("invalid_time", 422, "Elegí una fecha válida en intervalos de 15 minutos.");
  return new SocialScheduleError("schedule_failed", 400, "No se pudo guardar la programación.");
}

async function loadVariant(context: AdminContext, variantId: string) {
  if (!isUuid(variantId)) throw new SocialScheduleError("not_found", 404, "Variante inválida.");
  const result = await context.service
    .from("content_distribution_drafts")
    .select("id,campaign_id,channel,locale,status,scheduled_for,updated_at")
    .eq("id", variantId)
    .maybeSingle();
  if (result.error || !result.data) throw new SocialScheduleError("not_found", 404, "Variante no encontrada.");
  return result.data;
}

export async function scheduleSocialVariant(context: AdminContext, input: {
  variantId: string;
  expectedUpdatedAt: string;
  localScheduledFor: string;
  allowConflict: boolean;
}) {
  const before = await loadVariant(context, input.variantId);
  if (!input.expectedUpdatedAt || before.updated_at !== input.expectedUpdatedAt) {
    throw new SocialScheduleError("conflict", 409, "La variante cambió en otra pestaña. Recargá antes de continuar.");
  }

  let resolved: Date;
  try { resolved = calendarLocalToUtc(input.localScheduledFor); }
  catch { throw new SocialScheduleError("invalid_time", 422, "Elegí una fecha válida en intervalos de 15 minutos."); }
  if (resolved.valueOf() <= Date.now()) throw new SocialScheduleError("past_time", 422, "Elegí una fecha futura en hora de Buenos Aires.");

  const result = await context.service.rpc("schedule_social_variant", {
    target_variant_id: input.variantId,
    expected_updated_at: input.expectedUpdatedAt,
    target_local_scheduled_for: input.localScheduledFor,
    allow_conflict: input.allowConflict,
  });
  if (result.error) throw mapDatabaseError(result.error);
  const row = (Array.isArray(result.data) ? result.data[0] : result.data) as Record<string, unknown> | null;
  if (!row) throw new SocialScheduleError("schedule_failed", 400, "No se pudo guardar la programación.");

  if (!row.applied) {
    const from = new Date(resolved.valueOf() - 7_200_000).toISOString();
    const to = new Date(resolved.valueOf() + 7_200_000).toISOString();
    const conflictsResult = await context.service
      .from("content_distribution_drafts")
      .select("id,campaign_id,channel,locale,scheduled_for,social_campaigns(title)")
      .eq("channel", before.channel)
      .eq("status", "scheduled")
      .neq("id", before.id)
      .gt("scheduled_for", from)
      .lt("scheduled_for", to)
      .order("scheduled_for");
    const conflicts = (conflictsResult.data || []).map((item: any) => ({
      id: item.id,
      campaign_id: item.campaign_id,
      channel: item.channel,
      locale: item.locale,
      scheduled_for: item.scheduled_for,
      campaign_title: Array.isArray(item.social_campaigns) ? item.social_campaigns[0]?.title || "Campaña" : item.social_campaigns?.title || "Campaña",
    })) as ScheduleConflict[];
    return { applied: false as const, conflicts, resolvedAt: resolved.toISOString(), before };
  }

  await audit(context, {
    action: before.status === "scheduled" ? "reschedule" : "schedule",
    entityType: "distribution_draft",
    entityId: before.id,
    before: { status: before.status, channel: before.channel, scheduled_for: before.scheduled_for },
    after: { status: "scheduled", channel: before.channel, scheduled_for: row.scheduled_at },
  });
  return { applied: true as const, scheduledAt: String(row.scheduled_at), before };
}

export async function unscheduleSocialVariant(context: AdminContext, input: { variantId: string; expectedUpdatedAt: string }) {
  const before = await loadVariant(context, input.variantId);
  if (!input.expectedUpdatedAt || before.updated_at !== input.expectedUpdatedAt) {
    throw new SocialScheduleError("conflict", 409, "La variante cambió en otra pestaña. Recargá antes de continuar.");
  }
  const result = await context.service.rpc("unschedule_social_variant", {
    target_variant_id: input.variantId,
    expected_updated_at: input.expectedUpdatedAt,
  });
  if (result.error) throw mapDatabaseError(result.error);
  await audit(context, {
    action: "unschedule",
    entityType: "distribution_draft",
    entityId: before.id,
    before: { status: before.status, channel: before.channel, scheduled_for: before.scheduled_for },
    after: { status: "approved", channel: before.channel, scheduled_for: null },
  });
  return before;
}
