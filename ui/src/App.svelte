<script lang="ts">
  import CanvasPair from './components/CanvasPair.svelte';
  import ControlForm from './components/ControlForm.svelte';
  import PointDataEditor from './components/PointDataEditor.svelte';
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

<button onclick={toggleTriangulation}>
  三角網を {isTriangulationShown ? '非表示にする' : '表示する'}
</button>

<CanvasPair
  {pointPairs}
  {triangles}
  {isTriangulationShown}
/>

<ControlForm on:generate={handleGenerate} initialCount={500} />
<PointDataEditor points={pointPairs} on:update={handleUpdate} />
