<script lang="ts">
  import { tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';
  import Key from './Key.svelte';

  let { actions }: { actions: [string, KeyBindingAction][] } = $props();

  let idx: number | undefined = $state(undefined);
  let currentKeys = $derived(
    idx !== undefined ? actions[idx][0].split(' ') : [],
  );
  let currentAction: KeyBindingAction | undefined = $derived(
    idx !== undefined ? actions[idx][1] : undefined,
  );
  const ANIMATION_DURATION = 4000;

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function nextAction() {
    let prev = idx;
    idx = undefined;
    await tick();
    await sleep(700);
    idx = ((prev || 0) + 1) % actions.length;
    setTimeout(nextAction, ANIMATION_DURATION);
  }

  $effect(() => {
    idx = Math.floor(Math.random() * actions.length);
    setTimeout(nextAction, ANIMATION_DURATION);
  });
</script>

<div
  class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2"
>
  <div class=" md:w-60 h-15 flex justify-center md:justify-end">
    <div class="flex gap-x-3">
      {#each currentKeys as key, i (key)}
        <Key idx={i}>{key}</Key>
      {/each}
    </div>
  </div>
  <div
    class="h-1.5 overflow-hidden rounded-full bg-white w-24 text-white inset-shadow-sm inset-shadow-[#eef2db]"
  >
    {#if currentAction}
      <div
        in:fly={{
          x: -120,
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
    class="bg-white rounded-lg p-2 w-80 max-w-[96vw] h-36 shadow flex items-center justify-center gap-3 relative"
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

  <!-- 
   this is here to load all the images on page load instead of when 
   they appear in the rotation to avoid pop in. 
   -->
  {#each actions as action}
    {#if action[1].icon}
      <img
        src={action[1].icon}
        alt={action[1].label}
        hidden
      />
    {/if}
  {/each}
</div>
