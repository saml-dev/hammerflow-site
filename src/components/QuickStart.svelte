<script lang="ts">
  const { first, second } = $props();
  let firstTab = $state(true);
</script>

<div>
  <h2>Quick Start</h2>
  <div
    class="mt-3 bg-white/20 backdrop-blur-3xl rounded-lg shadow-sm border border-gray-800/10"
  >
    <div class="w-full grid grid-cols-2">
      <button
        class={{
          'py-3 px-1 rounded-tl-lg text-sm md:text-base text-balance': true,
          'border-b border-b-gray-200': !firstTab,
          'bg-soft-yellow': firstTab,
        }}
        onclick={() => (firstTab = true)}
      >
        I'm new to hammerspoon
      </button>
      <button
        class={{
          'py-3 px-1 rounded-tr-lg text-sm md:text-base text-balance': true,
          'border-b border-b-gray-200': firstTab,
          'bg-soft-yellow': !firstTab,
        }}
        onclick={() => (firstTab = false)}>I already use hammerspoon</button
      >
    </div>
    <div class="p-3 pt-8 bg-soft-yellow rounded-b-lg">
      {#if firstTab}
        {@render first()}
      {:else}
        {@render second()}
      {/if}
    </div>
  </div>
</div>
