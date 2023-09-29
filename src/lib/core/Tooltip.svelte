<script lang="ts">
  import { type DirectionX, type DirectionY, popup } from '@beerush/utils/client';

  export let text = '';
  export let xDir: DirectionX = 'between';
  export let yDir: DirectionY = 'below';
  export let bounding: HTMLElement = undefined;
</script>
<div use:popup={ { action: 'hover', container: '.popup-container', options: { xDir,yDir, bounding } } }
     class="tooltip fade-in">
  <slot>
    {#if text}
      {text}
    {/if}
  </slot>
</div>
