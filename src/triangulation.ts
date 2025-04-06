import Delaunator from 'delaunator';

export interface Point {
  x: number;
  y: number;
}

export interface TriangulationResult {
  triangles: number[][];
  pointsA: Point[];
  pointsB: Point[];
}

export function generateTriangulation(pointsA: Point[], pointsB: Point[]): TriangulationResult {
  if (pointsA.length !== pointsB.length) {
    throw new Error('対応点の数が異なります。');
  }

  const coordsA = pointsA.map(p => [p.x, p.y]);
  const delaunay = Delaunator.from(coordsA);

  const triangles: number[][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2]
    ]);
  }

  return {
    triangles,
    pointsA,
    pointsB
  };
}