import type { HostContext, UnitModuleFace, UnitRegistry } from '@dsh-workbench/core/contract';

const PLUGIN_ID = '@dsh-workbench/module-creator-daily';

const UNIT_ID = 'creator-daily';

const creatorDailyHost: UnitModuleFace = {
  unit: UNIT_ID,
  mount: () => ({ routes: {}, registerTools: () => [] }),
};

export const name = PLUGIN_ID;

export const inject = ['workbenchUnits'];

export function apply(ctx: HostContext): void {
  const units = (ctx.get as (name: string) => UnitRegistry | undefined)('workbenchUnits');
  if (units === undefined) {
    ctx.logger?.warn?.(`[${UNIT_ID}] 外壳没有提供 workbenchUnits 服务：这个模块装不进来`);
    return;
  }
  ctx.effect(() => units.register(creatorDailyHost), `module-creator-daily: 注册 ${UNIT_ID}`);
}
