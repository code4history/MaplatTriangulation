import { describe, test, expect } from 'vitest';
import { detectTopologyErrors } from '../src/topology';
import { TriangulationResult } from '../src/triangulation';

const pointsNoError = [
  { x: 10, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 30 },
  { x: 30, y: 10 }, { x: 40, y: 20 }, { x: 30, y: 30 }
];

const trianglesNoError = [
  [0, 1, 2], [3, 4, 5]
];

const pointsWithError = [
  { x: 10, y: 10 }, { x: 20, y: 20 }, { x: 10, y: 30 }, { x: 20, y: 40 },
  { x: 30, y: 10 }, { x: 40, y: 20 }, { x: 30, y: 30 }, { x: 40, y: 40 }
];

const trianglesWithError = [
  [0, 3, 1], [0, 2, 3],
  [4, 7, 5], [4, 6, 7],
  [1, 4, 5], [1, 5, 2] // 意図的に交差する辺を作成
];

describe('Topology Error Detection', () => {
  test('should detect no topology errors', () => {
    const result: TriangulationResult = {
      triangles: trianglesNoError,
      pointsA: pointsNoError,
      pointsB: pointsNoError
    };

    const errors = detectTopologyErrors(result);

    // デバッグ情報を表示
    // console.log('Errors detected (should be 0):', errors);

    expect(errors.length).toBe(0);
  });

  test('should detect topology errors', () => {
    const result: TriangulationResult = {
      triangles: trianglesWithError,
      pointsA: pointsWithError,
      pointsB: pointsWithError
    };

    const errors = detectTopologyErrors(result);

    // デバッグ情報を表示
    // console.log('Errors detected (should be > 0):', errors);

    expect(errors.length).toBeGreaterThan(0);
  });
});
