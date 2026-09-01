// ============================================================
// ResponsiveAutoTable — Horizontal Overflow Algorithm
// Pure calculation function. No DOM access.
// ============================================================

import { VisibilityResult } from './types';

/**
 * Resolves whether horizontal scrolling should be enabled on the
 * table wrapper container based on the visibility result and user mode.
 */
export function resolveOverflow(
  visibilityResult: VisibilityResult,
  horizontalScrollMode: 'auto' | 'always' | 'never' = 'auto'
): { enableHorizontalScroll: boolean } {
  if (horizontalScrollMode === 'always') {
    return { enableHorizontalScroll: true };
  }

  if (horizontalScrollMode === 'never') {
    return { enableHorizontalScroll: false };
  }

  // 'auto' mode: only enable if always-visible columns exceed available container width
  return {
    enableHorizontalScroll: Boolean(visibilityResult.needsHorizontalScroll),
  };
}
