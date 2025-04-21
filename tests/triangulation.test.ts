import { describe, test, expect } from 'vitest';
import { Point } from './types';
import { triangulate } from '../src/triangulation';

describe('Delaunay Triangulation', () => {
  test('should generate triangles correctly', () => {
    const pointsA: Point[] = [
      [0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]
    ];
    const pointsB: Point[] = pointsA.map(([x, y]) => [x + 1, y + 1]);

    const { triangles } = triangulate(pointsA);

    // 3 の倍数長であること
    expect(triangles.length % 3).toBe(0);
    expect(triangles.length).toBeGreaterThan(0);

    // 各頂点インデックスの範囲をチェック
    for (let i = 0; i < triangles.length; i++) {
      expect(triangles[i]).toBeGreaterThanOrEqual(0);
      expect(triangles[i]).toBeLessThan(pointsA.length);
    }
  });
});
