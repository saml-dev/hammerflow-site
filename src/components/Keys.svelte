<script>
  import { tick } from 'svelte';
  import Key from './Key.svelte';
  let keys = [
    ['leader', 'a', 'm'],
    ['leader', 't'],
  ];
  let idx = $state(0);
  let currentKeys = $derived(idx !== undefined ? keys[idx] : []);

  async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  $effect(() => {
    let interval = setInterval(async () => {
      let prev = idx;
      idx = undefined;
      await tick();
      await sleep(500);
      idx = (prev + 1) % keys.length;
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="m-10 flex gap-x-3">
  {#each currentKeys as key, i}
    <Key idx={i}>{key}</Key>
  {/each}
</div>
