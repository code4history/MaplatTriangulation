import { describe, test, expect } from 'vitest';
import { generateTriangulation, Point } from '../src/triangulation';

describe('Delaunay Triangulation', () => {
  test('should generate triangles correctly', () => {
    const pointsA: Point[] = [
      [0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5]
    ];
    const pointsB: Point[] = pointsA.map(([x, y]) => [x + 1, y + 1]);

    const result = generateTriangulation(pointsA, pointsB);

    expect(result.triangles.length).toBeGreaterThan(0);
    result.triangles.forEach(tri => {
      expect(tri.length).toBe(3);
      tri.forEach(idx => {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(pointsA.length);
      });
    });
  });
});
