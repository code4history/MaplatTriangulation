// scripts/generateTestData.ts
import fs from 'node:fs';

interface Point {
  x: number;
  y: number;
}

interface TestData {
  title: string;
  pointsA: Point[];
  pointsB: Point[];
}

// ランダムな値を生成
const rand = (min: number, max: number): number => Math.random() * (max - min) + min;

// ガウス分布に従ったランダムな揺らぎを生成
const gaussianNoise = (mean = 0, stdDev = 1): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
};

// 点群を生成
const generatePoints = (count: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    points.push({ x: rand(0, 1000), y: rand(0, 1000) });
  }
  return points;
};

// アフィン変換
const affineTransform = (points: Point[]): Point[] => {
  const scaleX = rand(0.5, 2);
  const scaleY = rand(0.5, 2);
  const shear = rand(-0.5, 0.5);
  const rotate = rand(0, 2 * Math.PI);
  const translateX = rand(-200, 200);
  const translateY = rand(-200, 200);
  const flipY = Math.random() < 0.5 ? -1 : 1;

  return points.map(p => {
    let x = p.x * scaleX + p.y * shear;
    let y = p.y * scaleY;
    const rotatedX = x * Math.cos(rotate) - y * Math.sin(rotate);
    const rotatedY = x * Math.sin(rotate) + y * Math.cos(rotate);
    return { x: rotatedX + translateX, y: flipY * rotatedY + translateY };
  });
};

// 点群Bを生成（非線形対応）
const generatePointsB = (points: Point[]): Point[] => {
  return points.map(p => ({
    x: p.x + gaussianNoise(0, rand(1, 5)),
    y: p.y + gaussianNoise(0, rand(1, 5))
  }));
};

// メイン処理
const count = Math.floor(rand(400, 600));
const pointsA = generatePoints(count);
const pointsA_ = affineTransform(pointsA);
const pointsB = generatePointsB(pointsA_);

const testData: TestData = {
  title: "",
  pointsA,
  pointsB
};

fs.writeFileSync('tests/points/testData.json', JSON.stringify(testData, null, 2));

console.log('Test data generated successfully.');