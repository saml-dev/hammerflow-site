<script>
  import { quartOut } from 'svelte/easing';
  export function tapeSlap(node, { duration = 200, delay = 1500 }) {
    const transform = getComputedStyle(node).transform.replace('none', '');
    return {
      delay,
      duration,
      css: (t) => {
        const eased = quartOut(t);
        const scale = 1.7 - 0.7 * eased; // Start larger, scale down
        const x = -25 * eased + 25; // Move left
        const y = 50 * eased - 50; // Move down
        const z = 200 * eased - 200; // move "into" screen
        const opacity = eased > 0.03 ? 1 : 0;
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
  class="fun-overlay hover:opacity-0 rounded tracking-widest transition-all whitespace-nowrap px-[1em] py-[.1em]"
>
  fun
</span>

<style lang="postcss">
  .fun-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-7deg);
    background-color: #c1f8d3;
    opacity: 1;
    font-family: 'Comic Sans MS', sans-serif;
    font-size: 0.9em;
    color: #333;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  }
</style>
