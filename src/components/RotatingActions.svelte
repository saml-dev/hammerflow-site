<script lang="ts">
  import { tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { quartOut } from 'svelte/easing';
  import Key from './Key.svelte';
  import { animate, stagger } from 'motion';

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

  async function nextAction2() {
    // fade out
    await animate(
      document.querySelectorAll('.animated'),
      { opacity: 0 },
      { duration: 0.5 },
    );
    // change visible action
    idx = ((idx || 0) + 1) % actions.length;
    await tick();
    // slide/fade in
    await animate(
      document.querySelectorAll('.animated'),
      { opacity: [0, 1], y: [-10, 0] },
      { duration: 0.3, delay: stagger(0.1) },
    );
    setTimeout(nextAction2, ANIMATION_DURATION);
  }

  async function mount() {
    idx = Math.floor(Math.random() * actions.length);
    await tick();
    await slideIn('.animated-key');

    await sleep(200);

    await slideIn('.animated');

    setTimeout(nextAction2, ANIMATION_DURATION);
  }

  function slideIn(selector: string) {
    const elems = document.querySelectorAll(selector);
    return animate(
      elems,
      { opacity: [0, 1], y: [-10, 0] },
      { duration: 0.3, delay: stagger(0.1), ease: 'easeOut' },
    );
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
      {#each currentKeys as key, i}
        <Key idx={i}>{key}</Key>
      {/each}
    </div>
  </div>
  <div
    class="h-1.5 overflow-hidden rounded-full bg-white w-24 text-white inset-shadow-sm inset-shadow-[#eef2db]"
  >
    {#if currentAction}
      <div
        class="animated translate-x-26 bg-green-400/50 size-3 blur-xs rounded-full"
      ></div>
    {/if}
  </div>
  <div
    class="bg-white rounded-lg p-2 w-80 max-w-[96vw] h-36 shadow grid place-items-center relative"
  >
    {#if currentAction?.action}
      <p
        class="animated opacity-0 text-sm text-gray-600 absolute top-1.5 left-3"
      >
        {currentAction?.action}
      </p>
    {/if}
    <div class="animated opacity-0 flex items-center justify-center gap-3">
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
