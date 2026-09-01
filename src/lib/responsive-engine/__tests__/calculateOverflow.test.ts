import { describe, it, expect } from 'vitest';
import { resolveOverflow } from '../calculateOverflow';
import { VisibilityResult } from '../types';

describe('resolveOverflow', () => {
  it('16. Auto mode when no overflow is needed', () => {
    const visResult: VisibilityResult = {
      visibleKeys: ['c1', 'c2'],
      hiddenKeys: [],
      needsHorizontalScroll: false,
      totalVisibleWidth: 400,
    };

    const res = resolveOverflow(visResult, 'auto');
    expect(res.enableHorizontalScroll).toBe(false);
  });

  it('17. Auto mode when overflow is needed', () => {
    const visResult: VisibilityResult = {
      visibleKeys: ['c1', 'c2'],
      hiddenKeys: [],
      needsHorizontalScroll: true,
      totalVisibleWidth: 600,
    };

    const res = resolveOverflow(visResult, 'auto');
    expect(res.enableHorizontalScroll).toBe(true);
  });

  it('18. Always mode enables overflow regardless of content width', () => {
    const visResult: VisibilityResult = {
      visibleKeys: ['c1'],
      hiddenKeys: [],
      needsHorizontalScroll: false,
      totalVisibleWidth: 100,
    };

    const res = resolveOverflow(visResult, 'always');
    expect(res.enableHorizontalScroll).toBe(true);
  });

  it('19. Never mode disables overflow regardless of content width', () => {
    const visResult: VisibilityResult = {
      visibleKeys: ['c1'],
      hiddenKeys: [],
      needsHorizontalScroll: true,
      totalVisibleWidth: 800,
    };

    const res = resolveOverflow(visResult, 'never');
    expect(res.enableHorizontalScroll).toBe(false);
  });
});
