<script>
  import external from '../assets/external.svg';
  let { href, children } = $props();
</script>

<a
  {href}
  target="_blank"
  rel="noopener noreferrer"
  class="underline hover:decoration-2 relative flex items-center gap-2"
>
  {@render children()}
  <img
    src={external.src}
    alt="external link"
  />
</a>
