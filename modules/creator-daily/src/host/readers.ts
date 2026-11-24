import type { ExtensionCaller, ExtensionNeed, UnitMountDeps } from '@dsh-workbench/core/contract';
import { extensionCallerOf } from '@dsh-workbench/shared/host';
import {
  normalizeBilibili,
  normalizeWeibo,
  normalizeZhihu,
  type SourceResult,
  type TopicRow,
} from '../model/topics';
import { normalizeMetrics, normalizeNotes, type MetricRow, type NoteRow } from '../model/notes';

export const UNIT_ID = 'creator-daily';

const TIMEOUT_MS = 30000;

type Site = 'zhihu' | 'weibo' | 'bilibili' | 'xiaohongshu';

function callerOf(deps: UnitMountDeps, site: Site): ExtensionCaller | undefined {
  const need = deps.manifest?.needs?.find((one): one is ExtensionNeed => one.kind === 'extension' && one.name === site);
  if (need === undefined) return undefined;
  return extensionCallerOf(deps.data, need, { suiteId: UNIT_ID });
}

function codeOf(error: unknown): string {
  if (typeof error === 'object' && error !== null && typeof (error as { code?: unknown }).code === 'string') {
    return (error as { code: string }).code;
  }
  return 'read-failed';
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function read(
  caller: ExtensionCaller | undefined,
  site: Site,
  label: string,
  argv: readonly string[],
  sources: SourceResult[],
): Promise<unknown> {
  if (caller === undefined) {
    sources.push({ site: label, ok: false, code: 'extension-missing', message: '这个站点的读取命令没有声明' });
    return undefined;
  }
  try {
    const { value } = await caller.json([...argv], { timeoutMs: TIMEOUT_MS });
    sources.push({ site: label, ok: true });
    return value;
  } catch (error) {
    sources.push({ site: label, ok: false, code: codeOf(error), message: messageOf(error) });
    return undefined;
  }
}

export interface TopicsRead {
  readonly topics: readonly TopicRow[];
  readonly sources: readonly SourceResult[];
}

export interface NotesRead {
  readonly metrics: readonly MetricRow[];
  readonly notes: readonly NoteRow[];
  readonly sources: readonly SourceResult[];
}

function markEmpty(sources: SourceResult[], site: string): void {
  const at = sources.findIndex((one) => one.site === site && one.ok);
  if (at !== -1) {
    sources[at] = { site, ok: false, code: 'empty', message: '没有读到内容（可能未登录）' };
  }
}

export interface Readers {
  topics(limit: number): Promise<TopicsRead>;
  notes(limit: number): Promise<NotesRead>;
  saveDraft(input: { title: string; content: string; images: readonly string[]; topics: readonly string[] }): Promise<{ ok: boolean; text: string }>;
}

export function createReaders(deps: UnitMountDeps): Readers {
  const zhihu = callerOf(deps, 'zhihu');
  const weibo = callerOf(deps, 'weibo');
  const bilibili = callerOf(deps, 'bilibili');
  const xiaohongshu = callerOf(deps, 'xiaohongshu');

  return {
    async topics(limit) {
      const sources: SourceResult[] = [];
      const [zhihuRaw, weiboRaw, bilibiliRaw] = await Promise.all([
        read(zhihu, 'zhihu', '知乎', ['hot', '--limit', String(limit)], sources),
        read(weibo, 'weibo', '微博', ['hot', '--limit', String(limit)], sources),
        read(bilibili, 'bilibili', 'B 站', ['hot', '--limit', String(limit)], sources),
      ]);
      const zhihuRows = normalizeZhihu(zhihuRaw);
      const weiboRows = normalizeWeibo(weiboRaw);
      const bilibiliRows = normalizeBilibili(bilibiliRaw);
      if (zhihuRows.length === 0) markEmpty(sources, '知乎');
      if (weiboRows.length === 0) markEmpty(sources, '微博');
      if (bilibiliRows.length === 0) markEmpty(sources, 'B 站');
      return { topics: [...zhihuRows, ...weiboRows, ...bilibiliRows], sources };
    },

    async notes(limit) {
      const sources: SourceResult[] = [];
      const [statsRaw, notesRaw] = await Promise.all([
        read(xiaohongshu, 'xiaohongshu', '小红书', ['creator-stats', '--period', 'seven'], sources),
        read(xiaohongshu, 'xiaohongshu', '小红书', ['creator-notes', '--limit', String(limit)], sources),
      ]);
      const metrics = normalizeMetrics(statsRaw);
      const noteRows = normalizeNotes(notesRaw);
      if (metrics.length === 0) markEmpty(sources, '小红书');
      if (noteRows.length === 0) markEmpty(sources, '小红书');
      return { metrics, notes: noteRows, sources };
    },

    async saveDraft(input) {
      const argv = ['publish', '--title', input.title, '--content', input.content, '--draft'];
      if (input.images.length > 0) argv.push('--images', input.images.join(','));
      if (input.topics.length > 0) argv.push('--topics', input.topics.join(','));
      if (xiaohongshu === undefined) {
        return { ok: false, text: '这个模块没有声明小红书的写入命令' };
      }
      try {
        await xiaohongshu.json(argv, { timeoutMs: 60000 });
        return { ok: true, text: `已存草稿：${input.title}` };
      } catch (error) {
        return { ok: false, text: `存草稿失败：${messageOf(error)}` };
      }
    },
  };
}
