import type { Point } from '../../src/types';

// 対応点セットのデータ構造
export interface PointPair {
  a: Point; // 平面Aの点
  b: Point; // 平面Bの対応点
}