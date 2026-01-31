export interface PostVariant {
  id: string;
  label: string;
  style: "hook" | "guide" | "promo";
  styleName: string;
  text: string;
  textMarkdown: string;
  textHtml: string;
  tokensUsed: number;
  createdAt: Date;
}

export interface InlineButton {
  id: string;
  text: string;
  type: "url" | "callback";
  payload: string;
  row: number;
}

export interface PostMedia {
  id: string;
  type: "photo" | "video" | "gif" | "document";
  url: string;
  thumbnailUrl?: string;
  generatedBy?: string;
  meta?: Record<string, unknown>;
}

export type PostStatus = "draft" | "scheduled" | "sending" | "sent" | "failed" | "cancelled";

export interface Post {
  id: string;
  userId?: string;
  channelId?: string;
  botTokenId?: string;
  ideaText: string;
  variants: PostVariant[];
  chosenVariantId?: string;
  editedTextMarkdown?: string;
  editedTextHtml?: string;
  media: PostMedia[];
  buttons: InlineButton[];
  scheduleDatetime?: Date;
  timezone?: string;
  status: PostStatus;
  logs?: string[];
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

export interface IdeaFormData {
  idea: string;
  tone: ToneOption;
  length: LengthOption;
  goal: string;
  targetAudience: string;
  systemPromptId?: string;
  variantsCount: number;
}

export type ToneOption = "drive" | "info" | "promo" | "friendly" | "formal";
export type LengthOption = "short" | "medium" | "long";

export const TONE_LABELS: Record<ToneOption, string> = {
  drive: "Драйвовый",
  info: "Информативный",
  promo: "Продающий",
  friendly: "Дружелюбный",
  formal: "Формальный",
};

export const LENGTH_LABELS: Record<LengthOption, string> = {
  short: "Короткий (1-3 предложения)",
  medium: "Средний (4-6 предложений)",
  long: "Длинный (7+ предложений)",
};