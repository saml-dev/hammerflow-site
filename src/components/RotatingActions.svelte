<script lang="ts">
  import { tick } from 'svelte';
  import Key from './Key.svelte';
  import { slideIn, fadeOut, flingDot } from '../lib/utils';

  let { actions }: { actions: [string, KeyBindingAction][] } = $props();

  let idx: number | undefined = $state(undefined);
  let currentKeys = $derived(
    idx !== undefined ? actions[idx][0].split(' ') : [],
  );
  let currentAction: KeyBindingAction | undefined = $derived(
    idx !== undefined ? actions[idx][1] : undefined,
  );
  const ANIMATION_PAUSE = 3000;

  async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function nextAction2() {
    await fadeOut('.animated');

    // change visible action, await tick so DOM updates
    idx = ((idx || 0) + 1) % actions.length;
    await tick();

    await animateActionIn();
    setTimeout(nextAction2, ANIMATION_PAUSE);
  }

  async function mount() {
    // wait a bit before starting first animation so
    // user doesn't miss it.
    await sleep(500);

    // mount random action first.
    idx = Math.floor(Math.random() * actions.length);
    await tick();

    await animateActionIn();
    setTimeout(nextAction2, ANIMATION_PAUSE);
  }

  async function animateActionIn() {
    await slideIn('.animated-key');
    await flingDot();
    await slideIn('.animated-action');
  }

  $effect(() => {
    mount();
  });
</script>

<div
  class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2"
>
  <div class="md:w-60 h-15 flex justify-center md:justify-end">
    <div class="flex gap-x-3">
      {#each currentKeys as key (key)}
        <Key>{key}</Key>
      {/each}
    </div>
  </div>
  <div
    class="h-2 overflow-hidden rounded-full bg-white w-24 text-white inset-shadow-sm inset-shadow-[#eef2db]"
  >
    <div
      class="animated-green-dot -translate-x-full bg-green-400/50 size-3 rounded-full"
    ></div>
  </div>
  <div
    class="bg-white rounded-lg p-2 w-80 max-w-[96vw] h-36 shadow grid place-items-center relative"
  >
    {#if currentAction?.action}
      <p
        class="animated animated-action opacity-0 text-sm text-gray-600 absolute top-1.5 left-3"
      >
        {currentAction?.action}
      </p>
    {/if}
    <div
      class="animated animated-action opacity-0 flex items-center justify-center gap-3"
    >
      {#if currentAction?.icon}
        <img
          src={currentAction.icon}
          class="size-10"
          alt={currentAction?.label}
        />
      {/if}
      {#if currentAction?.label}
        <span
          style="font-size: {currentAction.fontSize || '2.25rem'};"
          class="font-medium line-clamp-1">{currentAction?.label}</span
        >
      {/if}
    </div>
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
