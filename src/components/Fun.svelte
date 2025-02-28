<script>
  import { onMount } from 'svelte';
  import { quartIn } from 'svelte/easing';

  export function tapeSlap(node, { duration = 200, delay = 1500 }) {
    const transform = getComputedStyle(node).transform.replace('none', '');
    return {
      delay,
      duration,
      css: (t) => {
        const eased = quartIn(t);
        const scale = 1.7 - 0.7 * eased; // Start larger, scale down
        const x = -25 * eased + 25; // Move left
        const y = 50 * eased - 50; // Move down
        const z = 400 * eased - 400; // move "into" screen
        const opacity = eased > 0.2 ? 1 : 5 * eased;
        return `
          opacity:${opacity};
          transform: ${transform}
            scale(${scale})
            translate3D(${x}px, ${y}px, ${z}px)
           ;
        `;
      },
    };
  }
</script>

<span
  in:tapeSlap
  aria-label="and fun"
  class="fun-overlay group-hover:opacity-0! -rotate-[4deg] md:-rotate-[7deg] -translate-1/2 top-1/2 md:top-[40%] rounded tracking-widest transition-all whitespace-nowrap px-[.7em] md:py-[.1em]"
>
  fun 🎉
</span>

<style lang="postcss">
  .fun-overlay {
    position: absolute;
    /* top: 35%; */
    left: 50%;
    background-color: hsl(147, 65%, 85%);
    opacity: 1;
    font-family: 'Comic Sans MS', sans-serif;
    font-size: 0.9em;
    color: #333;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  }
</style>
