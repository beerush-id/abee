<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { createHueSwatches } from '@beerush/composer/color';
  import Tooltip from '../Tooltip.svelte';

  export let primary = '#ff0000';
  export let value = primary;

  const dispatch = createEventDispatcher<{
    select: string;
    change: string;
  }>();

  const select = (color: string) => {
    value = color;

    dispatch('select', value);
    dispatch('change', value);
  };

  $: groups = createHueSwatches(primary);
</script>

<div class="color-swatches">
  <div class="swatch-group">
    {#each groups.lightness as colors}
      <div class="color-group">
        {#each colors as color}
          <button class="reset swatch"
                  on:click={() => select(color)}
                  class:active={value === color}
                  style:--color={color}>
            <Tooltip text={color} />
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  .color-swatches {
    display: flex;
    flex-direction: column;
    gap: var(--tq-space-md);
  }

  .swatch-group {
    border-radius: var(--tq-radius-md);
    overflow: hidden;
  }

  .color-group {
    display: flex;
    flex-wrap: wrap;
  }

  .swatch {
    flex: 1;
    aspect-ratio: 1;
    position: relative;
    background: var(--color);

    &.active {
      box-shadow: inset 0 0 0 2px var(--tq-color-background);
    }
  }
</style>
