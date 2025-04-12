<script lang="ts">
  import Canvas from './Canvas.svelte';
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

  function handlePointSelect(index: number | null) {
    selectedIndex = index;
    console.log('CanvasPair received pointselect:', selectedIndex);
  }

  function handlePointMoveA({ index, point }: { index: number; point: Point }) {
    pointPairs[index] = { ...pointPairs[index], a: point };
    console.log('CanvasPair received pointmove (A):', index, point);
  }

  function handlePointMoveB({ index, point }: { index: number; point: Point }) {
    pointPairs[index] = { ...pointPairs[index], b: point };
    console.log('CanvasPair received pointmove (B):', index, point);
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
