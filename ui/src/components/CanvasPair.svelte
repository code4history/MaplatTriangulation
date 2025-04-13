<script lang="ts">
  import Canvas from './Canvas.svelte';
  import PointDataEditor from './PointDataEditor.svelte';
  import { generatePoints } from '../utils/pointUtils';
  import type { PointPair, Point } from '../types';

  const props = $props<{
    pointPairs: PointPair[];
    triangles: number[][] | null;
    isTriangulationShown: boolean;
  }>();

  let pointPairs = $state<PointPair[]>(props.pointPairs);
  let triangles = $state<number[][] | null>(props.triangles);
  let isTriangulationShown = $state<boolean>(props.isTriangulationShown);
  let selectedIndex = $state<number | null>(null);
  let newPointCount = $state(500);

  // JSONの内容を三角網の表示状態に応じて切り替え
  let jsonText = $derived(() => {
    if (isTriangulationShown && triangles) {
      return JSON.stringify({
        triangles,
        pointsA: pointPairs.map(p => p.a),
        pointsB: pointPairs.map(p => p.b),
      }, null, 2);
    } else {
      return JSON.stringify(pointPairs, null, 2);
    }
  });

  function handleJsonChange(newJson: string) {
    try {
      const parsed = JSON.parse(newJson);
      if (Array.isArray(parsed)) {
        pointPairs = parsed;
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }

  function handlePointSelect(index: number | null) {
    selectedIndex = index;
  }

  function handlePointMoveA({ index, point }: { index: number; point: Point }) {
    pointPairs[index] = { ...pointPairs[index], a: point };
  }

  function handlePointMoveB({ index, point }: { index: number; point: Point }) {
    pointPairs[index] = { ...pointPairs[index], b: point };
  }

  function regeneratePoints() {
    pointPairs = generatePoints(newPointCount);
    triangles = [];
    isTriangulationShown = false;
    selectedIndex = null;
  }

// CanvasPair.svelte内の三角網トグル処理を修正
async function toggleTriangulation() {
  if (!isTriangulationShown) {
    const { generateTriangulation } = await import('../../../src/triangulation');
    const pointsA = pointPairs.map(p => p.a);
    const pointsB = pointPairs.map(p => p.b);
    const result = generateTriangulation(pointsA, pointsB);
    
    // 🔸デバッグ用console.logを追加
    console.log('三角網が生成されました:', result.triangles);

    triangles = result.triangles;
    isTriangulationShown = true;
  } else {
    triangles = [];
    isTriangulationShown = false;

    // 🔸デバッグ用console.logを追加（非表示時の確認用）
    console.log('三角網が非表示になりました');
  }
}
</script>

<div style="margin-bottom:1rem;">
  <input type="number" bind:value={newPointCount} min="1" style="width:100px; margin-right:8px;">
  <button onclick={regeneratePoints}>
    新しい点群を生成（{newPointCount}点）
  </button>
  <button onclick={toggleTriangulation} style="margin-left:8px;">
    三角網を{isTriangulationShown ? '非表示にする' : '表示する'}
  </button>
</div>

<div style="display:flex; gap:1rem;">
  <Canvas
    points={pointPairs.map(p => p.a)}
    triangles={isTriangulationShown ? triangles : null}
    selectedIndex={selectedIndex}
    onPointSelect={handlePointSelect}
    onPointMove={handlePointMoveA}
  />

  <Canvas
    points={pointPairs.map(p => p.b)}
    triangles={isTriangulationShown ? triangles : null}
    selectedIndex={selectedIndex}
    onPointSelect={handlePointSelect}
    onPointMove={handlePointMoveB}
  />
</div>

<PointDataEditor
  jsonText={jsonText()}
  onJsonChange={handleJsonChange}
/>
