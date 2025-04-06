import Delaunator from 'delaunator';

export interface Point {
  x: number;
  y: number;
}

export function generateDelaunay(points: Point[]) {
  const coords = points.map(p => [p.x, p.y]);
  const delaunay = Delaunator.from(coords);

  // 三角形のインデックス情報を整理
  const triangles: number[][] = [];
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    triangles.push([
      delaunay.triangles[i],
      delaunay.triangles[i + 1],
      delaunay.triangles[i + 2]
    ]);
  }

  return triangles;
}