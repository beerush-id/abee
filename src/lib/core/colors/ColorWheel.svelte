<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    colorValue,
    createHarmonyWheels,
    createLightnessMap,
    createSaturationMap,
    Harmony,
  } from '@beerush/composer/color';
  import Tooltip from '../Tooltip.svelte';

  export let primary = '#ff0000';
  export let value = primary;
  export let harmony: Harmony = Harmony.Complementary;
  export let slices = 24;
  export let depth = 32;
  export let showSwatches = false;

  const dispatch = createEventDispatcher<{
    change: string;
  }>();

  const onColor = (color: string) => {
    value = color;
    dispatch('change', color);
  };

  $: paths = createHarmonyWheels(primary, slices, depth);
  $: colors = colorValue(primary)[harmony];
</script>

<div class="color-harmony-wheel flex-col gap-md">
  <div class="color-wheel">
    <svg viewBox="0 0 150 150">
      {#each paths as path}
        <path role="button" tabindex="-1" d={path.path} fill={path.color}
              on:click={() => onColor(path.color)}
              on:keypress={() => onColor(path.color)}>
          <Tooltip text={path.color} />
        </path>
      {/each}
    </svg>
    {#each colors as color}
      <div class="harmony-box"
           style:--color={color.value}
           style:--rotate="{color.hue % 360}deg">
        <button class="reset harmony-item"
                on:click={() => onColor(color.value)}>
          <Tooltip text={color.value} />
        </button>
      </div>
    {/each}
  </div>
  {#if showSwatches}
    <div class="color-swatches">
      {#each colors as color}
        <div class="swatch-list flex-row">
          {#each createLightnessMap(color.value) as sc}
            <button class="reset swatch" style:--color={sc} class:active={value === sc} on:click={() => onColor(sc)}>
              <Tooltip text={sc} />
            </button>
          {/each}
        </div>
      {/each}
    </div>
    <div class="color-swatches">
      {#each colors as color}
        <div class="swatch-list flex-row">
          {#each createSaturationMap(color.value) as sc}
            <button class="reset swatch" style:--color={sc} class:active={value === sc} on:click={() => onColor(sc)}>
              <Tooltip text={sc} />
            </button>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .color-wheel {
    width: calc(100% - var(--tq-space-xl));
    margin: calc(var(--tq-space-xl) / 2);
    aspect-ratio: 1;
    position: relative;
    border-radius: 50%;

    &:after {
      content: "";
      display: block;
      width: 50%;
      height: 50%;
      background: var(--tq-color-background);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      border-radius: 50%;
    }

    svg {
      width: 100%;
      height: 100%;
      z-index: 0;
      box-shadow: 0 0 0 2px var(--tq-color-background);
      border-radius: 50%;
    }

    path {
      cursor: default;
      outline: none;
    }

    .harmony-box {
      --item-size: 20px;
      --item-shift: calc(-1 * (var(--item-size) / 2));
      width: 1px;
      height: 100%;
      position: absolute;
      top: 0;
      left: 50%;
      margin-left: -0.5px;
      rotate: var(--rotate);
      z-index: 1;
    }

    .harmony-item {
      width: var(--item-size);
      aspect-ratio: 1;
      position: absolute;
      top: var(--item-shift);
      left: var(--item-shift);
      border-radius: 50%;
      box-shadow: 0 0 0 2px var(--tq-color-background);
      background: var(--color);
    }
  }

  .color-swatches {
    border-radius: var(--tq-radius-md);
    overflow: hidden;
  }

  .swatch {
    flex: 1;
    aspect-ratio: 1;
    background: var(--color);

    &.active {
      box-shadow: inset 0 0 0 2px var(--tq-color-background);
    }
  }
</style>
