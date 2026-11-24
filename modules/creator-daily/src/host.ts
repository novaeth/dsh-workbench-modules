import type { ToolRegistry, UnitModuleFace } from '@dsh-workbench/core/contract';
import { defineUnitHostPlugin, factOfRoute } from '@dsh-workbench/shared/host';
import { approvalOf } from './host/approval';
import { createReaders, UNIT_ID } from './host/readers';
import { OVERVIEW_ROUTE, overviewAnswer } from './host/routes';
import { registerTools } from './host/tools';
import { DECLARED_TOOLS } from './declared-tools';

const PLUGIN_ID = '@dsh-workbench/module-creator-daily';

const face: UnitModuleFace = {
  unit: UNIT_ID,
  mount: (deps) => {
    const readers = createReaders(deps);
    return {
      routes: {
        [OVERVIEW_ROUTE]: (search: URLSearchParams) => {
          const raw = Number(search.get('limit'));
          const limit = Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 20) : 5;
          return overviewAnswer(readers, limit);
        },
      },
      registerTools: () => {
        const tools = deps.ctx.get<ToolRegistry>('tools');
        if (tools === undefined) {
          deps.logger?.warn?.(`[${UNIT_ID}] 外壳没有提供 tools 服务：这些工具注册不进去`);
          return [];
        }
        return registerTools(tools, readers);
      },
      factsOf: (call) => {
        if (
          call.source === DECLARED_TOOLS.topics.name ||
          call.source === DECLARED_TOOLS.notes.name ||
          call.source === DECLARED_TOOLS.saveDraft.name
        ) {
          return [factOfRoute(OVERVIEW_ROUTE)];
        }
        return undefined;
      },
      ...approvalOf(),
    };
  },
};

const plugin = defineUnitHostPlugin({ name: PLUGIN_ID, unit: UNIT_ID, face });

export const name = plugin.name;

export const inject = plugin.inject;

export const apply = plugin.apply;
