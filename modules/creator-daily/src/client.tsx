import { createElement as h } from 'react';
import type { ClientContext, UnitClientApi, UnitClientFace } from '@dsh-workbench/core/contract';
import { CreatorCard } from './components/CreatorCard';
import { DECLARED_TOOLS } from './declared-tools';
import { creatorDailyMessages } from './messages';

const UNIT_ID = 'creator-daily';

const face: UnitClientFace = {
  unit: UNIT_ID,
  messages: creatorDailyMessages,
  card: (props) =>
    h(CreatorCard, {
      refreshToken: props.refreshToken,
      onRefresh: props.onRefresh,
      t: props.t,
    }),
  approval: {
    tools: [DECLARED_TOOLS.saveDraft.name],
    plan: (input, t) => {
      const args = input.args;
      const title = typeof args['title'] === 'string' ? args['title'] : '';
      const content = typeof args['content'] === 'string' ? args['content'] : '';
      const images = Array.isArray(args['images']) ? args['images'].length : 0;
      const topics = Array.isArray(args['topics']) ? args['topics'].length : 0;
      const parts = [`标题「${title}」`, `正文 ${String(content.trim().length)} 字`];
      if (images > 0) parts.push(`图片 ${String(images)} 张`);
      if (topics > 0) parts.push(`话题 ${String(topics)} 个`);
      return {
        object: t('creator-daily.approval.object'),
        objectLabel: t('creator-daily.approval.objectLabel'),
        change: parts.join(' · '),
        target: t('creator-daily.approval.target'),
        impact: t('creator-daily.approval.impact'),
      };
    },
  },
};

export const inject = ['workbenchUnits'];

export function apply(ctx: ClientContext): void {
  const units = (ctx.get as (name: string) => UnitClientApi | undefined)('workbenchUnits');
  if (units === undefined) {
    console.warn(`[${UNIT_ID}] 外壳没有提供 workbenchUnits 服务：这张卡片装不进来`);
    return;
  }
  ctx.effect(() => units.registerUnit(face), `module-creator-daily: 注册 ${UNIT_ID}`);
}
