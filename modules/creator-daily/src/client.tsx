import { createElement as h } from 'react';
import { kit } from '@dsh-workbench/core/client';
import type { ClientContext, UnitClientApi, UnitClientFace } from '@dsh-workbench/core/contract';
import { creatorDailyMessages } from './messages';

const UNIT_ID = 'creator-daily';

const creatorDailyClient: UnitClientFace = {
  unit: UNIT_ID,
  messages: creatorDailyMessages,
  card: (props) => {
    const { Card, IconBrandMark } = kit.components;
    return h(
      Card,
      {
        t: props.t,
        title: props.t('creatorDaily.cardTitle'),
        refreshing: false,
        onRefresh: props.onRefresh,
      },
      h('p', null, h(IconBrandMark, { size: 16 }), ' ', props.t('creatorDaily.heading')),
      h('p', null, props.t('creatorDaily.body')),
    );
  },
};

export const inject = ['workbenchUnits'];

export function apply(ctx: ClientContext): void {
  const units = (ctx.get as (name: string) => UnitClientApi | undefined)('workbenchUnits');
  if (units === undefined) {
    console.warn(`[${UNIT_ID}] 外壳没有提供 workbenchUnits 服务：这张卡片装不进来`);
    return;
  }
  ctx.effect(() => units.registerUnit(creatorDailyClient), `module-creator-daily: 注册 ${UNIT_ID}`);
}
