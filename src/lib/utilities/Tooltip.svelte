<script lang="ts">
  import { createPopup, type DirectionX, type DirectionY } from '@beerush/utils/client';

  export let text: string | void = null;
  export let xDir: DirectionX = 'between';
  export let yDir: DirectionY = 'below';
</script>
<div use:createPopup={ { action: 'hover', container: '.popup-container', options: { xDir,yDir } } }
     class="tooltip fade-in">
  <slot>
    {#if text}
      {text}
    {/if}
  </slot>
</div>
