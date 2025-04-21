import { describe, it, expect } from 'vitest';
import { detectEdgeIntersections, detectFlippedTrianglesSmart as detectFlippedTriangles, detectTJunctions } from '../src/topology/errors';
import { Point } from '../src/types';

// 1. Edge intersection (diagonals cross)
it('detects edge intersection', () => {
  const pts: Point[] = [[0,0],[2,0],[2,2],[0,2]];
  // triangles with diagonals 0‑2 and 1‑3 crossing
  const tris = new Uint32Array([0,1,2,0,3,1]);
  expect(detectEdgeIntersections(tris, pts).length).toBeGreaterThan(0);
});

// 2. Flipped triangle between planes
it('detects flipped triangle between planes', () => {
  const ptsA: Point[] = [[0,0],[1,0],[0,1]];
  const ptsB: Point[] = [[0,0],[0,1],[1,0]]; // reversed orientation
  const tris = new Uint32Array([0,1,2]);
  expect(detectFlippedTriangles(tris, ptsA, ptsB).length).toBe(1);
});

// 3. T‑junction detection (point 2 lies on edge 0‑1)
it('detects T‑junction', () => {
  const pts: Point[] = [[0,0],[2,0],[1,0],[1,2]];
  const tris = new Uint32Array([0,1,3,1,2,3]);
  expect(detectTJunctions(tris, pts).length).toBeGreaterThan(0);
});