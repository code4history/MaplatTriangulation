<script lang="ts">
  import CanvasPair from './components/CanvasPair.svelte';
  import { generatePoints } from './utils/pointUtils';
  import type { PointPair } from './types';

  let pointPairs = $state<PointPair[]>(generatePoints(500));
  let triangles = $state<number[][]>([]);
  let isTriangulationShown = $state(false);

  function handleGenerate(event: CustomEvent<{ pointCount: number }>) {
    pointPairs = generatePoints(event.detail.pointCount);
    triangles = [];
    isTriangulationShown = false;
  }

  function handleUpdate(event: CustomEvent<PointPair[]>) {
    pointPairs = event.detail;
    triangles = [];
    isTriangulationShown = false;
  }

  async function toggleTriangulation() {
    if (!isTriangulationShown) {
      const { generateTriangulation } = await import('../../src/triangulation');
      const pointsA = pointPairs.map(p => p.a);
      const pointsB = pointPairs.map(p => p.b);
      const result = generateTriangulation(pointsA, pointsB);
      triangles = result.triangles;
      isTriangulationShown = true;
    } else {
      triangles = [];
      isTriangulationShown = false;
    }
  }
</script>

<CanvasPair
  {pointPairs}
  {triangles}
  {isTriangulationShown}
/>
