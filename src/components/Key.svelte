<script>
  import { fade, fly } from 'svelte/transition';

  let { idx, children } = $props();
</script>

<kbd
  class="animated-key px-5 py-3 text-lg font-medium font-mono text-gray-900 bg-white border border-gray-200 rounded-lg cursor-pointer select-none"
>
  {@render children()}
</kbd>

<style>
  kbd {
    transition:
      margin 100ms ease-in-out,
      box-shadow 100ms ease-in-out;
    margin-top: 2px;
    margin-bottom: 3px;
    box-shadow: 0px 3px 0px 0px #00000024;

    &:hover {
      margin-top: 0px;
      margin-bottom: 5px;
      box-shadow: 0px 5px 0px 0px #00000024;
    }
    &:active {
      margin-top: 5px;
      margin-bottom: 0px;
      box-shadow: 0px 0px 0px 0px #00000000;
    }
  }
</style>
