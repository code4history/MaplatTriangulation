/**
 * モノトーンチェーン法で凸包を計算
 * 戻り値: 反時計回りインデックス配列（終端重複なし）
 */
export function computeConvexHull(pts: [number, number][]): number[] {
  const idx = pts.map((_, i) => i)
                 .sort((i, j) => pts[i][0] - pts[j][0] || pts[i][1] - pts[j][1]);

  const cross = (i: number, j: number, k: number) =>
    (pts[j][0] - pts[i][0]) * (pts[k][1] - pts[i][1]) -
    (pts[j][1] - pts[i][1]) * (pts[k][0] - pts[i][0]);

  const lower: number[] = [];
  for (const i of idx) {
    while (lower.length >= 2 &&
           cross(lower[lower.length - 2], lower[lower.length - 1], i) <= 0) {
      lower.pop();
    }
    lower.push(i);
  }

  const upper: number[] = [];
  for (let p = idx.length - 1; p >= 0; p--) {
    const i = idx[p];
    while (upper.length >= 2 &&
           cross(upper[upper.length - 2], upper[upper.length - 1], i) <= 0) {
      upper.pop();
    }
    upper.push(i);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** 凸包上の辺か（順不同） */
export function isHullEdge(hull: number[], u: number, v: number): boolean {
  for (let i = 0; i < hull.length; i++) {
    const j = (i + 1) % hull.length;
    if ((hull[i] === u && hull[j] === v) || (hull[i] === v && hull[j] === u)) return true;
  }
  return false;
}
