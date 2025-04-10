<script lang="ts">
  import CanvasPair from './components/CanvasPair.svelte';
  import ControlForm from './components/ControlForm.svelte';
  import PointDataEditor from './components/PointDataEditor.svelte';
  import { generatePoints } from './utils/pointUtils';
  import type { PointPair } from './types';

  let points = $state<PointPair[]>(generatePoints(500));

  function handleGenerate(event: CustomEvent<{ pointCount: number }>) {
    points = generatePoints(event.detail.pointCount);
  }

  function handleUpdate(event: CustomEvent<PointPair[]>) {
    points = event.detail;
  }
</script>

<main>
  <h1>三角網テストUI（JSON連動）</h1>
  <CanvasPair {points} />
  <ControlForm on:generate={handleGenerate} initialCount={500} />
  <PointDataEditor {points} on:update={handleUpdate} />
</main>
