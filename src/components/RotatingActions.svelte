<script lang="ts">
  import { tick } from 'svelte';
  import Keys from './Keys.svelte';
  import { fade, fly } from 'svelte/transition';

  let { actions }: { actions: [string, KeyBindingAction][] } = $props();

  let idx: number | undefined = $state(
    Math.floor(Math.random() * actions.length),
  );
  let currentKeys = $derived(
    idx !== undefined ? actions[idx][0].split(' ') : [],
  );
  let currentAction: KeyBindingAction | undefined = $derived(
    idx !== undefined ? actions[idx][1] : undefined,
  );

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  $effect(() => {
    let interval = setInterval(async () => {
      let prev = idx;
      idx = undefined;
      await tick();
      await sleep(500);
      idx = ((prev || 0) + 1) % actions.length;
    }, 5000);
    return () => clearInterval(interval);
  });
</script>

<div class="flex items-center justify-center gap-2 mt-12">
  <div class="w-55 flex justify-end">
    <Keys keys={currentKeys} />
  </div>
  <hr class="h-1.5 rounded-full bg-white w-24 text-white shadow" />
  <div
    class="bg-white rounded-lg p-2 w-55 h-28 shadow flex items-center justify-center gap-2 relative"
  >
    {#if currentAction?.action}
      <p
        in:fade={{ duration: 100, delay: currentKeys.length * 150 }}
        out:fade={{ duration: 100 }}
        class="text-xs text-gray-600 absolute top-2 left-2"
      >
        {currentAction?.action}
      </p>
    {/if}
    {#if currentAction?.icon}
      <img
        src={currentAction.icon}
        class="size-8"
        alt="VS Code Logo"
        in:fade={{ duration: 100, delay: currentKeys.length * 150 }}
        out:fade={{ duration: 100 }}
      />
    {/if}
    {#if currentAction?.label}
      <span
        in:fly={{ y: -2, duration: 100, delay: (currentKeys.length + 1) * 150 }}
        out:fade={{ duration: 100 }}
        class="text-4xl font-bold">{currentAction?.label}</span
      >
    {/if}
  </div>
</div>
