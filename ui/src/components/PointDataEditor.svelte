<script lang="ts">
  const { jsonText, jsonchange } = $props<{
    jsonText: string;
    jsonchange?: (detail: string) => void;
  }>();

  let localJson = $state(jsonText);

  // 親からpropsが変化したらローカル状態に同期
  $effect(() => {
    localJson = jsonText;
  });

  const handleInput = (event: Event) => {
    const newJson = (event.target as HTMLTextAreaElement).value;
    jsonchange?.(newJson);
  };
</script>

<textarea rows="20" cols="50" bind:value={localJson} oninput={handleInput}></textarea>
