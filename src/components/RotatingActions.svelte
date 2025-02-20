<script lang="ts">
  import { tick } from 'svelte';
  import Keys from './Keys.svelte';
  import { fade, fly } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';

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
      await sleep(700);
      idx = ((prev || 0) + 1) % actions.length;
    }, 6000);
    return () => clearInterval(interval);
  });

  function onKeyClick() {}
</script>

<div class="flex items-center justify-center gap-2 mt-12">
  <div class="w-60 flex justify-end">
    <Keys keys={currentKeys} />
  </div>
  <div
    class="h-1.5 overflow-hidden rounded-full bg-white w-24 text-white inset-shadow-sm inset-shadow-[#eef2db]"
  >
    {#if currentAction}
      <div
        in:fly={{
          x: -145,
          opacity: 1,
          duration: 1000,
          easing: quartOut,
          delay: currentKeys.length * 110,
        }}
        class="translate-x-26 bg-green-400/50 size-3 blur-xs rounded-full"
      ></div>
    {/if}
  </div>
  <div
    class="bg-white rounded-lg p-2 w-80 h-36 shadow flex items-center justify-center gap-3 relative"
  >
    {#if currentAction?.action}
      <p
        in:fly={{ y: -3, duration: 200, delay: currentKeys.length * 110 + 350 }}
        out:fade
        class="text-sm text-gray-600 absolute top-1.5 left-3"
      >
        {currentAction?.action}
      </p>
    {/if}
    {#if currentAction?.icon}
      <img
        src={currentAction.icon}
        class="size-10"
        alt={currentAction?.label}
        in:fly={{ y: -6, delay: currentKeys.length * 110 + 650 }}
        out:fade
      />
    {/if}
    {#if currentAction?.label}
      <span
        in:fly={{ y: -6, delay: currentKeys.length * 110 + 650 }}
        out:fade
        style="font-size: {currentAction.fontSize || '2.25rem'};"
        class="font-medium line-clamp-1">{currentAction?.label}</span
      >
    {/if}
  </div>
</div>
