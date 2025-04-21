import { TriangulationResult, Point } from './triangulation';
import { segmentsIntersect } from './core/geometry';

/**
 * 単一平面で交差チェックを行う補助（将来 2 平面対応時に拡張予定）
 * ここではまだ利用していませんが、既存 UI との互換のため残置。
 */

function createTypedPoints(points: Point[]): Float64Array {
  const coords = new Float64Array(points.length * 2);
  points.forEach((p, i) => {
    coords[i * 2] = p[0];
    coords[i * 2 + 1] = p[1];
  });
  return coords;
}

// ...交差検出ロジック本体（未使用）...
export function dummyValidate(_tri: TriangulationResult): boolean {
  return true;
}

/**
 * 三角網内で「共有頂点を持たない2辺が交差している」ペアを検出
 * – エラーのペアを文字列 "u‑v x‑y" 形式で返すだけの簡易版
 *   （十分に高速ではないがテスト用途には問題なし）
 */
export function detectTopologyErrors(res: TriangulationResult): string[] {
  const { triangles, pointsA } = res;
  const edges: [number, number][] = [];

  // 辺リストを生成（重複排除）
  triangles.forEach(([a, b, c]) => {
    [[a, b], [b, c], [c, a]].forEach(([u, v]) => {
      if (u > v) [u, v] = [v, u];
      const key = `${u}-${v}`;
      if (!edges.some(([x, y]) => x === u && y === v)) edges.push([u, v]);
    });
  });

  const errors: string[] = [];
  for (let i = 0; i < edges.length; i++) {
    const [u1, v1] = edges[i];
    const p1 = pointsA[u1], p2 = pointsA[v1];
    for (let j = i + 1; j < edges.length; j++) {
      const [u2, v2] = edges[j];
      // 共有頂点があるならスキップ
      if (u1 === u2 || u1 === v2 || v1 === u2 || v1 === v2) continue;
      const q1 = pointsA[u2], q2 = pointsA[v2];
      if (segmentsIntersect(p1, p2, q1, q2)) {
        errors.push(`${u1}-${v1} ${u2}-${v2}`);
      }
    }
  }
  return errors;
}