import { describe, test, expect } from 'vitest';
import { generateTriangulation, Point } from '../src/triangulation';

describe('Delaunay Triangulation', () => {
  test('should generate triangles correctly', () => {
    const pointsA: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0.5, y: 0.5 }
    ];

    // 点群Aに対し、簡単な変換を適用した対応点群Bを作成
    const pointsB: Point[] = pointsA.map(p => ({ x: p.x + 1, y: p.y + 1 }));

    const result = generateTriangulation(pointsA, pointsB);

    // 基本的な確認: 三角形が4つ生成されることを確認
    expect(result.triangles.length).toBe(4);

    // 三角形インデックスが妥当か確認
    result.triangles.forEach(tri => {
      expect(tri.length).toBe(3);
      tri.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(pointsA.length);
      });
    });
  });
});