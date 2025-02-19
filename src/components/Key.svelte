<script>
  import { fade, fly } from 'svelte/transition';

  let { idx, children } = $props();
</script>

<kbd
  class="px-3 py-2 text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg"
  style="--motion-delay: {idx * 250}ms;"
  in:fly={{ y: -10, duration: 150, delay: idx * 250 }}
  out:fade={{ duration: 150 }}
>
  {@render children()}
</kbd>

<style>
  kbd {
    box-shadow: 0px 3px 0px 0px #00000014;
  }
</style>
