<script lang="ts">
  import Key from './Key.svelte';

  let { keys }: { keys: string[] } = $props();

  // let idx: number | undefined = $state(Math.floor(Math.random() * keys.length));
  // let currentKeys = $derived(idx !== undefined ? keys[idx][0].split(' ') : []);

  // async function sleep(ms: number) {
  //   return new Promise((resolve) => setTimeout(resolve, ms));
  // }

  // $effect(() => {
  //   let interval = setInterval(async () => {
  //     let prev = idx;
  //     idx = undefined;
  //     await tick();
  //     await sleep(500);
  //     idx = ((prev || 0) + 1) % keys.length;
  //   }, 4000);
  //   return () => clearInterval(interval);
  // });
</script>

<div class="flex gap-x-3">
  {#each keys as key, i}
    <Key idx={i}>{key}</Key>
  {/each}
</div>
