import { describe, expect, it } from 'vitest';
import { draftProblemOf, draftSummaryOf, normalizeMetrics, normalizeNotes } from '../notes';

describe('笔记数据归一', () => {
  it('指标行', () => {
    expect(normalizeMetrics([{ metric: '观看', total: '1200', trend: '1 → 3' }])).toEqual([
      { metric: '观看', total: '1200', trend: '1 → 3' },
    ]);
  });

  it('笔记行', () => {
    const rows = normalizeNotes([{ id: 'n1', title: '标题', date: '11-24', views: '10', likes: '2', collects: '1', comments: '0', url: 'u' }]);
    expect(rows[0]).toMatchObject({ id: 'n1', title: '标题', views: '10' });
  });

  it('不是数组时返回空', () => {
    expect(normalizeMetrics(undefined)).toEqual([]);
    expect(normalizeNotes('x')).toEqual([]);
  });
});

describe('草稿校验', () => {
  const base = { title: '标题', content: '正文', images: [], topics: [] };

  it('标题不能为空', () => {
    expect(draftProblemOf({ ...base, title: '  ' })).toBe('标题不能为空');
  });

  it('标题最多 20 字', () => {
    expect(draftProblemOf({ ...base, title: '一'.repeat(21) })).toBe('标题最多 20 字');
  });

  it('正文不能为空', () => {
    expect(draftProblemOf({ ...base, content: ' ' })).toBe('正文不能为空');
  });

  it('图片最多 9 张', () => {
    expect(draftProblemOf({ ...base, images: Array.from({ length: 10 }, (_, index) => `/${String(index)}.png`) })).toBe('图片最多 9 张');
  });

  it('合规时没有问题', () => {
    expect(draftProblemOf(base)).toBeUndefined();
  });

  it('摘要写清标题、字数、图片与话题', () => {
    expect(draftSummaryOf({ title: '标题', content: '正文正文', images: ['/a.png'], topics: ['话题'] })).toBe('标题「标题」 · 正文 4 字 · 图片 1 张 · 话题 1 个');
  });
});
