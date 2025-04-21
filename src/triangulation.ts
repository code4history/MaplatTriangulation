import Delaunator from 'delaunator';

/** 内部表現はタプルに統一 */
export type Point = [number, number];

export interface TriangulationResult {
  triangles: number[][];
  pointsA: Point[];
  pointsB: Point[];
}

/**
 * 2 平面対応を後工程で扱う前段フェーズ：
 * まだ必須／禁止制約を入れる前のプレーンな Delaunay 生成
 */
export function generateTriangulation(pointsA: Point[], pointsB: Point[]): TriangulationResult {
  if (pointsA.length !== pointsB.length) {
    throw new Error('対応点の数が異なります。');
  }

  const delaunay = Delaunator.from(pointsA);

  const triangles: number[][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2]
    ]);
  }

  return { triangles, pointsA, pointsB };
}
