export const SOCIAL_CHANNELS = ["linkedin", "x", "instagram"] as const;
export const SOCIAL_DRAFT_STATUSES = ["draft", "approved", "rejected", "published", "archived"] as const;
export const SOCIAL_CAMPAIGN_STATUSES = SOCIAL_DRAFT_STATUSES;
export const SOCIAL_LOCALES = ["en", "es"] as const;

export type SocialChannel = (typeof SOCIAL_CHANNELS)[number];
export type SocialDraftStatus = (typeof SOCIAL_DRAFT_STATUSES)[number];
export type SocialCampaignStatus = (typeof SOCIAL_CAMPAIGN_STATUSES)[number];
export type SocialLocale = (typeof SOCIAL_LOCALES)[number];

export const SOCIAL_CHANNEL_LIMITS: Record<SocialChannel, number> = {
  linkedin: 3000,
  x: 280,
  instagram: 2200,
};

const statusLabels: Record<SocialDraftStatus, string> = {
  draft: "Borrador",
  approved: "Aprobado",
  rejected: "Rechazado",
  published: "Publicado",
  archived: "Archivado",
};

const channelLabels: Record<SocialChannel, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
};

export function isSocialChannel(value: string): value is SocialChannel {
  return SOCIAL_CHANNELS.includes(value as SocialChannel);
}

export function isSocialStatus(value: string): value is SocialDraftStatus {
  return SOCIAL_DRAFT_STATUSES.includes(value as SocialDraftStatus);
}

export function isSocialLocale(value: string): value is SocialLocale {
  return SOCIAL_LOCALES.includes(value as SocialLocale);
}

export function socialStatusLabel(value: string | null | undefined) {
  return isSocialStatus(value || "") ? statusLabels[value as SocialDraftStatus] : "Sin estado";
}

export function socialChannelLabel(value: string | null | undefined) {
  return isSocialChannel(value || "") ? channelLabels[value as SocialChannel] : "Canal desconocido";
}

export function socialLocaleLabel(value: string | null | undefined) {
  return value === "es" ? "Español" : value === "en" ? "English" : "Idioma desconocido";
}

export function countSocialCharacters(value: string) {
  return Array.from(value.normalize("NFC")).length;
}

export function validateSocialContent(channel: SocialChannel, value: string) {
  const content = value.trim();
  if (!content) return "El contenido no puede quedar vacío.";
  const count = countSocialCharacters(content);
  const limit = SOCIAL_CHANNEL_LIMITS[channel];
  if (count > limit) return `${socialChannelLabel(channel)} admite hasta ${limit} caracteres en este flujo. El borrador tiene ${count}.`;
  return null;
}

export function validateRejectionReason(value: string) {
  const reason = value.trim();
  if (reason.length < 10) return "Explicá el motivo con al menos 10 caracteres.";
  if (reason.length > 1000) return "El motivo no puede superar 1000 caracteres.";
  return null;
}

export function deriveSocialCampaignStatus(statuses: SocialDraftStatus[]): SocialCampaignStatus {
  const active = statuses.filter((status) => status !== "archived");
  if (!active.length) return "archived";
  if (active.every((status) => status === "published")) return "published";
  if (active.every((status) => status === "approved" || status === "published")) return "approved";
  if (active.some((status) => status === "rejected")) return "rejected";
  return "draft";
}

const socialTransitions: Record<SocialDraftStatus, SocialDraftStatus[]> = {
  draft: ["approved", "rejected", "archived"],
  approved: ["draft", "rejected", "published", "archived"],
  rejected: ["draft", "approved", "archived"],
  published: ["approved", "archived"],
  archived: [],
};

export function canTransitionSocialDraft(from: string, to: string) {
  return isSocialStatus(from) && isSocialStatus(to) && socialTransitions[from].includes(to);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
