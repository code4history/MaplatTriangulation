import { describe, it, expect } from 'vitest';
import { segmentsIntersect } from '../src/core/geometry';
import { computeConvexHull, isHullEdge } from '../src/core/convexHull';
import { hasEdge, flipEdge } from '../src/core/edgeOps';

describe('geometry utils', () => {
  it('segmentsIntersect positive & negative cases', () => {
    expect(
      segmentsIntersect([0, 0], [2, 2], [0, 2], [2, 0])
    ).toBe(true);
    expect(
      segmentsIntersect([0, 0], [1, 1], [2, 2], [3, 3])
    ).toBe(false);
  });
});

describe('convexHull utils', () => {
  it('computeConvexHull returns square', () => {
    const pts: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1], [0.4, 0.4]];
    const hull = computeConvexHull(pts);
    expect(hull.sort()).toEqual([0, 1, 2, 3].sort());
    expect(isHullEdge(hull, 0, 1)).toBe(true);
    expect(isHullEdge(hull, 0, 2)).toBe(false);
  });
});

describe('edgeOps', () => {
  it('flipEdge flips internal diagonal', () => {
    const tris = new Uint32Array([0, 1, 2, 0, 2, 3]); // square by diagonal 0‑2
    const ok = flipEdge(tris, 0, 2);
    expect(ok).toBe(true);
    expect(hasEdge(tris, 1, 3)).toBe(true);
    expect(hasEdge(tris, 0, 2)).toBe(false);
  });
});
