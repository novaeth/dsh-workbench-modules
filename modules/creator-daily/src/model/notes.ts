export interface MetricRow {
  readonly metric: string;
  readonly total: string;
  readonly trend: string;
}

export interface NoteRow {
  readonly id: string;
  readonly title: string;
  readonly date: string;
  readonly views: string;
  readonly likes: string;
  readonly collects: string;
  readonly comments: string;
  readonly url: string;
}

export interface DraftInput {
  readonly title: string;
  readonly content: string;
  readonly images: readonly string[];
  readonly topics: readonly string[];
}

export const DRAFT_TITLE_LIMIT = 20;
export const DRAFT_IMAGE_LIMIT = 9;

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function rowOf(item: unknown): Record<string, unknown> {
  return typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
}

export function normalizeMetrics(raw: unknown): MetricRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = rowOf(item);
    return { metric: text(row['metric']), total: text(row['total']), trend: text(row['trend']) };
  });
}

export function normalizeNotes(raw: unknown): NoteRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const row = rowOf(item);
    return {
      id: text(row['id']),
      title: text(row['title']),
      date: text(row['date']),
      views: text(row['views']),
      likes: text(row['likes']),
      collects: text(row['collects']),
      comments: text(row['comments']),
      url: text(row['url']),
    };
  });
}

export function draftProblemOf(input: DraftInput): string | undefined {
  const title = input.title.trim();
  if (title === '') return '标题不能为空';
  if (title.length > DRAFT_TITLE_LIMIT) return `标题最多 ${String(DRAFT_TITLE_LIMIT)} 字`;
  if (input.content.trim() === '') return '正文不能为空';
  if (input.images.length > DRAFT_IMAGE_LIMIT) return `图片最多 ${String(DRAFT_IMAGE_LIMIT)} 张`;
  return undefined;
}

export function draftSummaryOf(input: DraftInput): string {
  const parts = [`标题「${input.title.trim()}」`, `正文 ${String(input.content.trim().length)} 字`];
  if (input.images.length > 0) parts.push(`图片 ${String(input.images.length)} 张`);
  if (input.topics.length > 0) parts.push(`话题 ${String(input.topics.length)} 个`);
  return parts.join(' · ');
}
