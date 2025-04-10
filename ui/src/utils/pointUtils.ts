import type { PointPair } from '../types';

// ランダムなアフィン変換（スケール、平行移動、30度単位回転）とガウス揺らぎを適用して点群生成
export function generatePoints(count: number): PointPair[] {
  const points: PointPair[] = [];

  // スケール（拡大縮小）
  const scaleX = Math.random() * 2 + 0.5;  // 0.5〜2.5
  const scaleY = Math.random() * 2 + 0.5;  // 0.5〜2.5

  // 平行移動
  const translateX = Math.random() * 500 - 250;  // -250〜250
  const translateY = Math.random() * 500 - 250;  // -250〜250

  // 30度単位で回転を設定 (30, 60, 90, ..., 330)
  const rotationDegree = (Math.floor(Math.random() * 11) + 1) * 30;
  const rotationRad = rotationDegree * (Math.PI / 180);

  const cosR = Math.cos(rotationRad);
  const sinR = Math.sin(rotationRad);

  for (let i = 0; i < count; i++) {
    const x = Math.random() * 1000;
    const y = Math.random() * 1000;

    // ガウス揺らぎ
    const fluctuationX = gaussianRandom() * 30;
    const fluctuationY = gaussianRandom() * 30;

    // スケール → 回転 → 平行移動 → 揺らぎの順に適用
    const transformedX = (x * scaleX) * cosR - (y * scaleY) * sinR + translateX + fluctuationX;
    const transformedY = (x * scaleX) * sinR + (y * scaleY) * cosR + translateY + fluctuationY;

    points.push({
      a: { x, y },
      b: { x: transformedX, y: transformedY },
    });
  }

  return points;
}

// Box-Muller法で正規分布乱数生成
function gaussianRandom(mean = 0, stddev = 1) {
  let u = 1 - Math.random(); // [0,1) → (0,1]
  let v = Math.random();
  return mean + stddev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
