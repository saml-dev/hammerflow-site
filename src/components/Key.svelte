<script>
  import { fade, fly } from 'svelte/transition';

  let { idx, children } = $props();
</script>

<kbd
  style="transition-delay: {(idx + 2) * 100}ms;"
  class="px-5 py-3 text-lg font-medium font-mono transition-all text-gray-900 bg-white border border-gray-200 rounded-lg select-none"
  out:fade
>
  {@render children()}
</kbd>

<style>
  kbd {
    margin-top: 2px;
    margin-bottom: 3px;
    box-shadow: 0px 3px 0px 0px #00000024;

    @starting-style {
      transform: translateY(-10px);
      opacity: 0;
    }
  }
</style>
