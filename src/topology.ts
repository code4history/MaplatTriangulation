// src/topology.ts (スイープラインアルゴリズム, TypedArray高速化版)
import { TriangulationResult, Point } from './triangulation';

interface Event {
  x: number;
  segment: number;
  isStart: boolean;
}

// 座標情報をFloat64Arrayで保持
function createTypedPoints(points: Point[]): Float64Array {
  const coords = new Float64Array(points.length * 2);
  points.forEach((p, i) => {
    coords[i * 2] = p.x;
    coords[i * 2 + 1] = p.y;
  });
  return coords;
}

// 辺のY座標比較
const compareY = (coords: Float64Array, idx1: number, idx2: number, x: number): number => {
  const x1 = coords[idx1 * 2], y1 = coords[idx1 * 2 + 1];
  const x2 = coords[idx2 * 2], y2 = coords[idx2 * 2 + 1];
  if (x1 === x2) return Math.min(y1, y2);
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
};

// 2辺が交差するかチェック
const intersects = (coords: Float64Array, s1: number, e1: number, s2: number, e2: number): boolean => {
  const ccw = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) => (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  const [ax, ay, bx, by, cx, cy, dx, dy] = [
    coords[s1 * 2], coords[s1 * 2 + 1], coords[e1 * 2], coords[e1 * 2 + 1],
    coords[s2 * 2], coords[s2 * 2 + 1], coords[e2 * 2], coords[e2 * 2 + 1]
  ];

  return (
    ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) &&
    ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy)
  );
};

export function detectTopologyErrors(result: TriangulationResult): [number, number][] {
  const { triangles, pointsA } = result;
  const coords = createTypedPoints(pointsA);

  const edges: number[][] = [];
  triangles.forEach(tri => {
    edges.push([tri[0], tri[1]], [tri[1], tri[2]], [tri[2], tri[0]]);
  });

  const events: Event[] = [];
  edges.forEach((seg, idx) => {
    const [start, end] = seg;
    if (coords[start * 2] < coords[end * 2]) {
      events.push({ x: coords[start * 2], segment: idx, isStart: true });
      events.push({ x: coords[end * 2], segment: idx, isStart: false });
    } else {
      events.push({ x: coords[end * 2], segment: idx, isStart: true });
      events.push({ x: coords[start * 2], segment: idx, isStart: false });
    }
  });

  events.sort((a, b) => a.x - b.x);

  const activeSet: number[] = [];
  const errors: [number, number][] = [];

  events.forEach(event => {
    const { segment, isStart, x } = event;
  
    if (isStart) {
      activeSet.forEach(activeSeg => {
        const [s1, e1] = edges[segment];
        const [s2, e2] = edges[activeSeg];
  
        // 共通頂点を持つ場合はスキップ
        if (s1 === s2 || s1 === e2 || e1 === s2 || e1 === e2) return;
  
        if (intersects(coords, s1, e1, s2, e2)) {
          errors.push([segment, activeSeg]);
        }
      });
      activeSet.push(segment);
      activeSet.sort((a, b) =>
        compareY(coords, edges[a][0], edges[b][0], x) -
        compareY(coords, edges[a][1], edges[b][1], x));
    } else {
      const idx = activeSet.indexOf(segment);
      if (idx !== -1) activeSet.splice(idx, 1);
    }
  });

  return errors;
}
