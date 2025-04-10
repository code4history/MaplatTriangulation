<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let initialCount: number = 500;
  let pointCount: number = initialCount;

  function generatePoints() {
    dispatch('generate', { pointCount });
  }
</script>

<div class="control-form">
  点数: <input type="number" bind:value={pointCount} min="1" />
  <button on:click={generatePoints}>点群生成</button>
</div>

<style>
.control-form {
  margin-top: 1em;
}
input {
  width: 80px;
}
</style>
