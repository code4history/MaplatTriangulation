import { describe, it, expect } from 'vitest';
import { triangulate } from '../src/triangulation';

it('inserts required edges', () => {
  const pts = [[0,0],[1,0],[1,1],[0,1]] as [number,number][];
  const res = triangulate(pts, { requiredEdges: [[0,2]] });
  expect(Array.from(res.triangles)).toContain(0);
  expect(Array.from(res.triangles)).toContain(2);
});