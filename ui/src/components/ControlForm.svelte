<script lang="ts">
  const { initialCount = 500, generate } = $props<{ initialCount?: number, generate?: (detail: { pointCount: number }) => void }>();

  let pointCount = $state(initialCount);

  const handleSubmit = () => {
    generate?.({ pointCount });
  };
</script>

<div>
  <input type="number" bind:value={pointCount} />
  <button onclick={handleSubmit}>点群生成</button>
</div>