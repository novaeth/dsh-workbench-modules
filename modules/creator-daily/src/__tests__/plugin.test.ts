import { describe, expect, it } from 'vitest';
import { apply, inject, name } from '../host';
import { apply as applyClient, inject as injectClient } from '../client';

function fakeCtx(service: unknown) {
  const faces: unknown[] = [];
  return {
    faces,
    ctx: {
      get: () => service,
      effect: (fn: () => void | (() => void)) => {
        fn();
        return () => {};
      },
    },
  };
}

describe('creator-daily 的面', () => {
  it('插件名就是包名', () => {
    expect(name).toBe('@dsh-workbench/module-creator-daily');
  });

  it('两侧都只注入外壳交出来的那个服务', () => {
    expect(inject).toEqual(['workbenchUnits']);
    expect(injectClient).toEqual(['workbenchUnits']);
  });

  it('宿主半侧把自己的面注册进外壳', () => {
    const { ctx, faces } = fakeCtx({
      register: (face: unknown) => {
        faces.push(face);
        return () => {};
      },
    });
    apply(ctx as never);
    expect(faces).toHaveLength(1);
    expect((faces[0] as { unit: string }).unit).toBe('creator-daily');
  });

  it('浏览器半侧把卡片注册进外壳', () => {
    const { ctx, faces } = fakeCtx({
      registerUnit: (face: unknown) => {
        faces.push(face);
        return () => {};
      },
    });
    applyClient(ctx as never);
    expect(faces).toHaveLength(1);
    expect((faces[0] as { unit: string }).unit).toBe('creator-daily');
  });

  it('外壳没交服务时不注册、也不抛', () => {
    const { ctx } = fakeCtx(undefined);
    expect(() => apply(ctx as never)).not.toThrow();
    expect(() => applyClient(ctx as never)).not.toThrow();
  });
});
