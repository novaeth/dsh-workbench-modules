import { describe, expect, it } from 'vitest';
import { mergeTopics, normalizeBilibili, normalizeWeibo, normalizeZhihu } from '../topics';

describe('热榜行归一', () => {
  it('知乎：rank/title/heat/url', () => {
    const rows = normalizeZhihu([{ rank: 1, title: '如何看待 X', heat: '1234 万热度', url: 'https://www.zhihu.com/question/1' }]);
    expect(rows).toEqual([{ site: '知乎', rank: 1, title: '如何看待 X', heat: '1234 万热度', url: 'https://www.zhihu.com/question/1' }]);
  });

  it('微博：word 当标题，hot_value 变成热度', () => {
    const rows = normalizeWeibo([{ rank: 2, word: '话题', hot_value: 99, url: 'https://s.weibo.com/x' }]);
    expect(rows[0]?.title).toBe('话题');
    expect(rows[0]?.heat).toBe('99 热度');
  });

  it('B 站：play 变成播放', () => {
    const rows = normalizeBilibili([{ rank: 3, title: '视频', play: '10.0万', url: '' }]);
    expect(rows[0]?.heat).toBe('10.0万 播放');
  });

  it('不是数组时返回空', () => {
    expect(normalizeZhihu(undefined)).toEqual([]);
    expect(normalizeWeibo({})).toEqual([]);
  });

  it('合并：丢掉空标题，按 rank 排序，按上限截断', () => {
    const merged = mergeTopics(
      [
        { site: '知乎', rank: 5, title: '五', heat: '', url: '' },
        { site: '微博', rank: 1, title: '一', heat: '', url: '' },
        { site: 'B 站', rank: 2, title: '', heat: '', url: '' },
        { site: 'B 站', rank: 3, title: '三', heat: '', url: '' },
      ],
      2,
    );
    expect(merged.map((row) => row.title)).toEqual(['一', '三']);
  });
});
