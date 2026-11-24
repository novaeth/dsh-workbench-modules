import type { ToolDefinition, ToolRegistry } from '@dsh-workbench/core/contract';
import { TEXT_OUTPUT, recordOf } from '@dsh-workbench/shared/host';
import { DECLARED_TOOLS } from '../declared-tools';
import { draftProblemOf, type DraftInput } from '../model/notes';
import type { Readers } from './readers';

function limitOf(raw: unknown, fallback: number, max: number): number {
  const value = Number(recordOf(raw)['limit']);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.floor(value), max);
}

function stringsOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((one): one is string => typeof one === 'string' && one.trim() !== '').map((one) => one.trim());
}

export function registerTools(tools: ToolRegistry, readers: Readers): (() => void)[] {
  const topics: ToolDefinition = {
    name: DECLARED_TOOLS.topics.name,
    description: '读取知乎、微博、B 站热榜，返回排名、标题、热度与链接。只读。',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: '每个平台读多少条，默认 5，最多 20。' },
      },
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    async execute(raw) {
      const limit = limitOf(raw, 5, 20);
      const { topics: rows, sources } = await readers.topics(limit);
      if (rows.length === 0) {
        const detail = sources.filter((one) => !one.ok).map((one) => `${one.site}：${one.message ?? one.code ?? ''}`);
        return { ok: false, text: detail.length === 0 ? '三个热榜都没有读到内容。' : `没有读到内容。${detail.join('；')}` };
      }
      const lines = rows.slice(0, limit * 3).map((row) => `${row.site} #${String(row.rank)} ${row.title}${row.heat === '' ? '' : `（${row.heat}）`}${row.url === '' ? '' : ` ${row.url}`}`);
      return { ok: true, text: lines.join('\n') };
    },
  };

  const notes: ToolDefinition = {
    name: DECLARED_TOOLS.notes.name,
    description: '读取小红书创作者数据：概览指标与最近笔记。只读。',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'integer', description: '最近笔记读多少条，默认 5，最多 20。' },
      },
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    async execute(raw) {
      const limit = limitOf(raw, 5, 20);
      const { metrics, notes: rows, sources } = await readers.notes(limit);
      if (metrics.length === 0 && rows.length === 0) {
        const detail = sources.filter((one) => !one.ok).map((one) => one.message ?? one.code ?? '');
        return { ok: false, text: detail.length === 0 ? '没有读到笔记数据。' : `没有读到笔记数据。${detail.join('；')}` };
      }
      const metricLines = metrics.map((row) => `${row.metric} ${row.total}${row.trend === '' ? '' : `（${row.trend}）`}`);
      const noteLines = rows.map((row) => `${row.title} · ${row.date} · 观看 ${row.views} 赞 ${row.likes} 藏 ${row.collects} 评 ${row.comments}`);
      return { ok: true, text: [...metricLines, ...noteLines].join('\n') };
    },
  };

  const saveDraft: ToolDefinition = {
    name: DECLARED_TOOLS.saveDraft.name,
    description: '把一条图文笔记存进小红书草稿箱（需要批准）。只写草稿，不发布。',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '笔记标题，最多 20 字。' },
        content: { type: 'string', description: '笔记正文。' },
        images: { type: 'array', items: { type: 'string' }, description: '本地图片路径，最多 9 张。' },
        topics: { type: 'array', items: { type: 'string' }, description: '话题标签，不含 # 号。' },
      },
      required: ['title', 'content'],
      additionalProperties: false,
    },
    output: TEXT_OUTPUT,
    async execute(raw) {
      const body = recordOf(raw);
      const input: DraftInput = {
        title: typeof body['title'] === 'string' ? body['title'] : '',
        content: typeof body['content'] === 'string' ? body['content'] : '',
        images: stringsOf(body['images']),
        topics: stringsOf(body['topics']),
      };
      const problem = draftProblemOf(input);
      if (problem !== undefined) return { ok: false, text: problem };
      const result = await readers.saveDraft({
        title: input.title.trim(),
        content: input.content,
        images: input.images,
        topics: input.topics,
      });
      return { ok: result.ok, text: result.text };
    },
  };

  return [topics, notes, saveDraft].map((tool) => tools.register(tool));
}
