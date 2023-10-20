<script lang="ts">
  import { slider } from '@beerush/composer';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    input: number;
    change: number;
  }>();

  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';

  const input = (e: CustomEvent<number>) => {
    dispatch('input', e.detail);
    console.log(e.detail);
  };

  const change = (e: CustomEvent<number>) => {
    value = e.detail;
    dispatch('change', value);
    console.log(value);
  };

  let focus = false;

  $: options = {
    min: parseFloat(min),
    max: parseFloat(max),
    step: parseFloat(step),
    value: parseFloat(value),
    orientation,
  };

  $:console.log(options);
</script>

<div class="range-input" class:focus>
  <div role="button" tabindex="0" class="range-slider"
       use:slider={options}
       on:focus={() => focus = true}
       on:blur={() => focus = false}
       on:slider-input={input}
       on:slider-change={change}></div>
</div>

<style lang="scss">
  .range-input {
    position: relative;
    height: 12px;
    padding: 0;
  }

  .range-slider {
    height: calc(100% + 4px);
    aspect-ratio: 1;
    position: absolute;
    top: 0;
    left: 0;
    background: var(--tq-color-primary);
    translate: -50% -2px;
    border-radius: 50%;
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
  }
</style>
