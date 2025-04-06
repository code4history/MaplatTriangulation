# 開発環境セットアップとドロネー三角網生成 (TypeScript)

## 1. 必要パッケージのインストール（ターミナルで実行）

```bash
npm init vite@latest maplat-triangulation -- --template vanilla-ts
cd maplat-triangulation
npm install
npm install delaunator
npm install -D vitest jsdom @types/delaunator
```

## 2. vite.config.ts を作成（プロジェクトルートに配置）

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'jsdom'
  }
});
```

## 3. 基本的なドロネー三角網生成関数を作成 (`src/triangulation.ts`)

```typescript
import Delaunator from 'delaunator';

export interface Point {
  x: number;
  y: number;
}

export function generateDelaunay(points: Point[]) {
  const coords = points.map(p => [p.x, p.y]);
  const delaunay = Delaunator.from(coords);

  // 三角形のインデックス情報を整理（型を明示）
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
```

## 4. 動作確認用テストケースを作成 (`tests/triangulation.test.ts`)

```typescript
import { describe, test, expect } from 'vitest';
import { generateDelaunay, Point } from '../src/triangulation';

describe('Delaunay Triangulation', () => {
  test('should generate triangles correctly', () => {
    const points: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0.5, y: 0.5 }
    ];

    const triangles = generateDelaunay(points);

    // 基本的な確認: 三角形が4つ生成されることを確認
    expect(triangles.length).toBe(4);

    // 三角形インデックスが妥当か確認
    triangles.forEach(tri => {
      expect(tri.length).toBe(3);
      tri.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(points.length);
      });
    });
  });
});
```

## 5. `package.json`のscriptsにテストコマンド追加

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "test": "vitest"
}
```

## 6. 動作確認

テストを実行するには以下を実行

```bash
npm run test
```

## 7. 最終的に残すべき最低限の構成

```
maplat-triangulation/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src
│   └── triangulation.ts
└── tests
    └── triangulation.test.ts
```
