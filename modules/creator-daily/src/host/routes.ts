import type { Readers } from './readers';

export const OVERVIEW_ROUTE = 'creator-daily/overview';

export function overviewAnswer(readers: Readers, limit: number): Promise<unknown> {
  return Promise.all([readers.topics(limit), readers.notes(limit)]).then(([topics, notes]) => ({
    ok: true,
    topics: topics.topics,
    metrics: notes.metrics,
    notes: notes.notes,
    sources: [...topics.sources, ...notes.sources],
    at: new Date().toISOString(),
  }));
}
