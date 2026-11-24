export interface TopicRow {
  readonly site: string;
  readonly rank: number;
  readonly title: string;
  readonly heat: string;
  readonly url: string;
}

export interface SourceResult {
  readonly site: string;
  readonly ok: boolean;
  readonly code?: string;
  readonly message?: string;
}

function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function rankOf(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function rowOf(item: unknown): Record<string, unknown> {
  return typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
}

export function normalizeZhihu(raw: unknown): TopicRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = rowOf(item);
    return {
      site: '知乎',
      rank: rankOf(row['rank'], index + 1),
      title: text(row['title']),
      heat: text(row['heat']),
      url: text(row['url']),
    };
  });
}

export function normalizeWeibo(raw: unknown): TopicRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = rowOf(item);
    const heat = text(row['hot_value']);
    return {
      site: '微博',
      rank: rankOf(row['rank'], index + 1),
      title: text(row['word']),
      heat: heat === '' ? '' : `${heat} 热度`,
      url: text(row['url']),
    };
  });
}

export function normalizeBilibili(raw: unknown): TopicRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = rowOf(item);
    const play = text(row['play']);
    return {
      site: 'B 站',
      rank: rankOf(row['rank'], index + 1),
      title: text(row['title']),
      heat: play === '' ? '' : `${play} 播放`,
      url: text(row['url']),
    };
  });
}

export function mergeTopics(rows: readonly TopicRow[], limit: number): TopicRow[] {
  return rows
    .filter((row) => row.title !== '')
    .sort((left, right) => left.rank - right.rank)
    .slice(0, limit);
}
