import { describe, test, expect } from 'vitest';
import { generateDelaunay, Point } from '../src/triangulation';

describe('Delaunay Triangulation', () => {
  test('should generate triangles correctly', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0.5, y: 0.5 }
    ];

    const triangles = generateDelaunay(points);

    // 基本的な確認: 三角形が2つ生成されることを確認
    expect(triangles.length).toBe(4);

    // 三角形インデックスが妥当か確認
    triangles.forEach(tri => {
      expect(tri.length).toBe(3);
      tri.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(points.length);
      });
    });
  });
});