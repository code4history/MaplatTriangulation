<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { PointPair } from '../types';

  export let points: PointPair[] = [];

  const dispatch = createEventDispatcher();
  let jsonText: string = JSON.stringify(points, null, 2);

  // JSONが更新されたら親に通知
  function handleJsonInput() {
    try {
      const parsed = JSON.parse(jsonText);
      dispatch('update', parsed);
    } catch (error) {
      // エラーは無視
    }
  }

  $: jsonText = JSON.stringify(points, null, 2);
</script>

<textarea bind:value={jsonText} on:input={handleJsonInput} rows="15" cols="80"></textarea>

<style>
textarea {
  width: 100%;
  font-family: monospace;
}
</style>
