import { animate, stagger } from 'motion';

export function fadeOut(selector: string) {
  const elems = document.querySelectorAll(selector);
  return animate(elems, { opacity: 0 }, { duration: 0.5 });
}

export function slideIn(selector: string, _stagger = 0.2) {
  const elems = document.querySelectorAll(selector);
  return animate(
    elems,
    { opacity: [0, 1], y: [-10, 0] },
    { duration: 0.3, delay: stagger(_stagger), ease: 'easeOut' },
  );
}

export function flingDot() {
  return animate(
    '.animated-green-dot',
    {
      x: [0, 120],
    },
    {
      duration: 0.3,
      ease: 'easeOut',
    },
  );
}
