import { describe, test, expect } from 'vitest';
import { detectTopologyErrors } from '../src/topology';
import { triangulate } from '../src/triangulation';
import fs from 'node:fs';
import path from 'node:path';

const pointsDir = path.join(__dirname, 'points');

// テストデータをすべて読み込む
const files = fs.readdirSync(pointsDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(pointsDir, file);
  const testData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const { title, pointsA, pointsB } = testData;

  describe(`Generated Data Test: ${title || file}`, () => {
    test('should generate triangulation without topology errors', () => {
      const flat = triangulate(pointsA).triangles;
      const triplets: number[][] = [];
      for (let i = 0; i < flat.length; i += 3) {
        triplets.push([flat[i], flat[i+1], flat[i+2]]);
      }
      const result = { triangles: triplets, pointsA, pointsB };
      const errors = detectTopologyErrors(result);

      expect(errors.length).toBe(0);
    });
  });
});
