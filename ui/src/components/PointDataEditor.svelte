<script lang="ts">
  const props = $props<{
    jsonText: string;
    onJsonChange: (newJson: string) => void;
  }>();

  let localJson = $state(props.jsonText);

  // 親からpropsが変化したらローカル状態に同期
  $effect(() => {
    localJson = props.jsonText;
  });

  function handleInput() {
    props.onJsonChange(localJson);
  }
</script>

<textarea rows="20" cols="50" bind:value={localJson} oninput={handleInput}></textarea>
