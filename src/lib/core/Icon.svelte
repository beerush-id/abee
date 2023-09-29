<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  import type { DirectionX, DirectionY } from '@beerush/utils/client';
  import { createEventDispatcher } from 'svelte';

  export let name = '';
  export let size = '';
  export let color = '';
  export let tooltip = '';
  export let xDir: DirectionX = 'between';
  export let yDir: DirectionY = 'below';
  export let clickable = false;

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();
</script>
<span role={clickable ? 'button' : ''} class="icon material-symbols-outlined {className}"
      class:clickable
      on:click={e => dispatch('click', e)}
      style:--icon-size={size}
      style:--icon-color={color}>
  <slot>
    {#if name}
      {name}
    {/if}
  </slot>
  {#if tooltip}
    <Tooltip {xDir} {yDir} text={tooltip} />
  {/if}
</span>
