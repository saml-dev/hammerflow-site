<script>
  import { fade, fly } from 'svelte/transition';

  let { idx, children } = $props();
</script>

<kbd
  class="px-3 py-2 text-sm font-semibold transition-all text-gray-900 bg-white border border-gray-200 rounded-lg"
  style="--motion-delay: {idx * 250}ms;"
  in:fly={{ y: -2, duration: 100, delay: idx * 150 }}
  out:fade={{ duration: 150 }}
>
  {@render children()}
</kbd>

<style>
  kbd {
    margin-top: 1px;
    margin-bottom: 3px;
    box-shadow: 0px 3px 0px 0px #00000024;

    &:hover {
      margin-top: 0px;
      margin-bottom: 4px;
      box-shadow: 0px 4px 0px 0px #00000024;
    }
    &:active {
      margin-top: 4px;
      margin-bottom: 0px;
      box-shadow: 0px 3px 0px 0px #00000000;
    }
  }
</style>
