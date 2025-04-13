<script lang="ts">
  import Canvas from './Canvas.svelte';
  import PointDataEditor from './PointDataEditor.svelte';
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

  // $derivedを使ってリアクティブな依存関係を設定
  let jsonText = $derived(() => JSON.stringify(pointPairs, null, 2));

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
</script>

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
