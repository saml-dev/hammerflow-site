<script lang="ts">
  const { first, second } = $props();
  let firstTab = $state(true);
</script>

<div>
  <h2>Quick Start</h2>
  <div class="mt-3 bg-white rounded-lg shadow-sm border border-gray-800/10">
    <div class="w-full grid grid-cols-2">
      <button
        class={{
          'py-3 rounded-tl-lg': true,
          'bg-gray-100 text-gray-400 border-b border-b-gray-200': !firstTab,
          ' ': firstTab,
        }}
        onclick={() => (firstTab = true)}
      >
        I'm new to hammerspoon
      </button>
      <button
        class={{
          'py-3 rounded-tr-lg': true,
          'bg-gray-100 text-gray-400 border-b border-b-gray-200': firstTab,
        }}
        onclick={() => (firstTab = false)}>I already use hammerspoon</button
      >
    </div>
    <div class="p-3">
      {#if firstTab}
        {@render first()}
      {:else}
        {@render second()}
      {/if}
    </div>
  </div>
</div>
