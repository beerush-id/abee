<script lang="ts">
  import { type DirectionX, type DirectionY, popup } from '@beerush/utils/client';

  export let text = '';
  export let description = '';
  export let xDir: DirectionX = 'between';
  export let yDir: DirectionY = 'below';
  export let bounding: HTMLElement | undefined = undefined;
</script>
<div use:popup={ { action: 'hover', container: '.popup-portal', options: { xDir,yDir, bounding } } }
     class="tooltip fade-in">
  <slot>
    {#if text}
      <span>{text}</span>
    {/if}
    {#if description}
      <span class="description">{description}</span>
    {/if}
  </slot>
</div>
