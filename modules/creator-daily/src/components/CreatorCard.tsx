import { createElement as h } from 'react';
import { kit } from '@dsh-workbench/core/client';
import type { MetricRow, NoteRow } from '../model/notes';
import type { SourceResult, TopicRow } from '../model/topics';

const ROUTE = 'creator-daily/overview';

const { Card } = kit.components;
const { useApiResource } = kit.hooks;

export interface OverviewPayload {
  readonly ok: boolean;
  readonly topics?: readonly TopicRow[];
  readonly metrics?: readonly MetricRow[];
  readonly notes?: readonly NoteRow[];
  readonly sources?: readonly SourceResult[];
}

export interface CreatorCardProps {
  readonly refreshToken: number;
  readonly onRefresh: () => void;
  readonly t: (key: string) => string;
}

function sourceLine(source: SourceResult, t: (key: string) => string): string {
  if (source.code === 'auth-required') return `${source.site}：${t('creator-daily.login')}`;
  return `${source.site}：${source.message ?? source.code ?? t('creator-daily.unreadable')}`;
}

export function CreatorCard(props: CreatorCardProps): ReturnType<typeof h> {
  const resource = useApiResource<OverviewPayload>(ROUTE, { limit: 5 }, props.refreshToken);
  const value = resource.value;
  const topics = value?.topics ?? [];
  const metrics = value?.metrics ?? [];
  const notes = value?.notes ?? [];
  const failed = (value?.sources ?? []).filter((one) => !one.ok);
  const nothing = topics.length === 0 && metrics.length === 0 && notes.length === 0;

  const body: ReturnType<typeof h>[] = [];
  if (resource.phase === 'error') {
    body.push(h('p', { key: 'error' }, `${props.t('creator-daily.unreadable')}${resource.error?.code ?? ''} ${resource.error?.message ?? ''}`));
  } else if (value === undefined) {
    body.push(h('p', { key: 'loading' }, props.t('creator-daily.loading')));
  } else {
    body.push(h('p', { key: 'topics-title' }, props.t('creator-daily.topics')));
    if (topics.length === 0) {
      body.push(h('p', { key: 'topics-empty' }, props.t('creator-daily.empty')));
    } else {
      body.push(
        h(
          'ul',
          { key: 'topics' },
          topics.slice(0, 5).map((row) =>
            h('li', { key: `${row.site}-${String(row.rank)}-${row.title}` }, `#${String(row.rank)} ${row.title} · ${row.site}${row.heat === '' ? '' : ` · ${row.heat}`}`),
          ),
        ),
      );
    }

    body.push(h('p', { key: 'metrics-title' }, props.t('creator-daily.metrics')));
    if (metrics.length === 0) {
      body.push(h('p', { key: 'metrics-empty' }, props.t('creator-daily.empty')));
    } else {
      body.push(
        h(
          'ul',
          { key: 'metrics' },
          metrics.map((row) => h('li', { key: row.metric }, `${row.metric} ${row.total}${row.trend === '' ? '' : ` · ${row.trend}`}`)),
        ),
      );
    }

    body.push(h('p', { key: 'notes-title' }, props.t('creator-daily.notes')));
    if (notes.length === 0) {
      body.push(h('p', { key: 'notes-empty' }, props.t('creator-daily.empty')));
    } else {
      body.push(
        h(
          'ul',
          { key: 'notes' },
          notes.slice(0, 3).map((row) => h('li', { key: row.id === '' ? row.title : row.id }, `${row.title} · ${row.date} · 观看 ${row.views} 赞 ${row.likes}`)),
        ),
      );
    }

    if (nothing) body.push(h('p', { key: 'hint' }, props.t('creator-daily.emptyHint')));
  }

  if (failed.length > 0) {
    for (const source of failed) body.push(h('p', { key: `fail-${source.site}` }, sourceLine(source, props.t)));
  }

  return h(
    Card,
    {
      t: props.t,
      title: props.t('creator-daily.cardTitle'),
      refreshing: resource.phase === 'loading',
      onRefresh: props.onRefresh,
    },
    ...body,
  );
}
