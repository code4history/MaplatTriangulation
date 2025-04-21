import { triangulate } from '../src/triangulation';
import { hasEdge } from '../src/core/edgeOps';
import { describe, it, expect } from 'vitest';

it('removes forbidden edges', () => {
  const pts = [[0,0],[1,0],[1,1],[0,1]] as [number,number][];
  const res = triangulate(pts, { forbiddenEdges: [[0,2]] });
  // 三角網に辺 (0,2) が含まれていないことを確認
  expect(hasEdge(res.triangles, 0, 2)).toBe(false);
});