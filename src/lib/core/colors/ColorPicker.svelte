<script lang="ts">
  import {
    colorValue,
    createPicker,
    EventType,
    hexToRgb,
    Hsl,
    hslToHex,
    PickerKey,
    type RGB,
    Rgb,
    rgbToHex,
  } from '@beerush/composer/color';
  import { FormField, Tooltip } from '../index.js';
  import { createEventDispatcher, onDestroy, setContext } from 'svelte';
  import ColorHueSlider from './ColorHueSlider.svelte';
  import ColorAlphaSlider from './ColorAlphaSlider.svelte';
  import ColorSwatch from './ColorSwatch.svelte';

  export let primary = '#ff0000';
  export let value = primary;
  export let vertical = true;

  let mode = 'hex';
  let [ hue, saturation, lightness, alpha ] = colorValue(value).hsla;

  const picker = createPicker({ value, orientation: vertical ? 'vertical' : 'horizontal', swatchesLength: 16 });

  setContext(PickerKey.Picker, picker);
  setContext(PickerKey.Vertical, vertical);

  const dispatch = createEventDispatcher<{
    input: string;
    change: string;
  }>();

  const dispatchAll = () => {
    dispatch('change', value);
  };

  const unsubscribe = picker.subscribe((e) => {
    assign(e.detail);

    if (e.type === EventType.Change) {
      dispatch('change', value);
    } else {
      dispatch('input', value);
    }
  });

  const assign = (color: string) => {
    value = color;
    [ hue, saturation, lightness, alpha ] = colorValue(value).hsla;
  };
  const usePalette = (color: string) => {
    assign(color);
    dispatchAll();
  };
  const useSwatch = (e: CustomEvent<string>) => {
    assign(e.detail);
    dispatchAll();
  };

  const hexInput = (e: Event) => {
    assign((e.target as HTMLInputElement).value);
    dispatchAll();
  };

  const rgbInput = (channel: Rgb, e: Event) => {
    const target = e.target as HTMLInputElement;

    if (target.value) {
      const values = [ ...rgb ];
      values[channel] = parseInt(target.value);
      assign(rgbToHex(...(values as RGB)));
      dispatch('input', value);
    }
  };

  const hslInput = (channel: Hsl, e: Event) => {
    const target = e.target as HTMLInputElement;

    if (target.value) {
      const values = [ ...colorValue(value).hsl ];
      values[channel] = parseInt(target.value);
      assign(hslToHex(...(values as Hsl)));
      dispatch('input', value);
    }
  };

  $: rgb = hexToRgb(value);
  $: shades = picker.shades(hue, saturation);

  onDestroy(() => {
    unsubscribe();
    picker.destroy();
  });
</script>

<div class="color-picker flex-col gap-md"
     style:--hue-color={hslToHex(hue, 100, 50)}
     style:--alpha={alpha}
     style:--color-value={hslToHex(hue, saturation, lightness)}>
  <div class="picker-wrap flex-row gap-sm">
    <div role="button" tabindex="-1" class="color-wheel flex-1">
      <div class="color-pointer" use:picker.area={value}></div>
    </div>
    <ColorHueSlider />
    <ColorAlphaSlider />
  </div>
  <div class="flex-row items-center gap-sm">
    <div class="flex-row gap-sm flex-1">
      {#if mode === 'hex'}
        <FormField class="small">
          <input type="text" {value} on:input={hexInput}>
          <span class="placeholder">Hex Code</span>
        </FormField>
      {:else if mode === 'rgb'}
        <FormField class="small">
          <input type="number" min="0" max="255"
                 value={rgb[Rgb.Red]}
                 on:input={(e) => rgbInput(Rgb.Red, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Red</span>
        </FormField>
        <FormField class="small">
          <input type="number" min="0" max="255"
                 value={rgb[Rgb.Green]}
                 on:input={(e) => rgbInput(Rgb.Green, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Green</span>
        </FormField>
        <FormField class="small">
          <input type="number" min="0" max="255"
                 value={rgb[Rgb.Blue]}
                 on:input={(e) => rgbInput(Rgb.Blue, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Blue</span>
        </FormField>
      {:else if mode === 'hsl'}
        <FormField class="small">
          <input type="number" min="0" max="360"
                 value={hue}
                 on:input={e => hslInput(Hsl.Hue, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Hue</span>
        </FormField>
        <FormField class="small">
          <input type="number" min="0" max="100"
                 value={saturation}
                 on:input={e => hslInput(Hsl.Saturation, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Sat</span>
        </FormField>
        <FormField class="small">
          <input type="number" min="0" max="100"
                 value={lightness}
                 on:input={e => hslInput(Hsl.Lightness, e)}
                 on:blur={() => dispatch('change', value)}>
          <span class="placeholder">Light</span>
        </FormField>
      {/if}
    </div>
    <div class="select-wrap" style:--input-width="72px">
      <FormField select class="small select">
        <select bind:value={mode}>
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
        <span class="placeholder">Mode</span>
      </FormField>
    </div>
  </div>
  <div class="color-shades flex-row items-center gap-sm">
    <div class="color-preview transparent-pattern fill-before"></div>
    <div class="flex-row items-center flex-1">
      {#each shades as shade}
        <button class="reset color-shade" on:click={() => usePalette(shade)} style:background-color={shade}>
          <Tooltip text={shade} />
        </button>
      {/each}
    </div>
  </div>
  <ColorSwatch {value} {primary} on:change={useSwatch} />
</div>

<style lang="scss">
  .color-picker {
    --input-width: 100%;
    user-select: none;
  }

  .picker-wrap {
    aspect-ratio: 4/3;
  }

  .color-wheel {
    position: relative;
    border-radius: var(--tq-radius-md);
    cursor: default;
    appearance: none;
    outline: none;
  }

  .color-wheel {
    height: 100%;
    background: var(--hue-color);
    border-radius: var(--tq-radius-md);
    position: relative;
    border: 1px solid var(--hue-color);
    overflow: hidden;

    &:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(to bottom, hsl(0 0% 100%) 0%, hsl(0 0% 100% / 0) 50%, hsl(0 0% 0% / 0) 50%, hsl(0 0% 0%) 100%),
      linear-gradient(to right, hsl(0 0% 50%) 0%, hsl(0 0% 50% / 0) 100%);
      z-index: 0;
    }
  }

  .color-pointer {
    position: absolute;
    left: var(--picker-x, 0);
    top: var(--picker-y, 0);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px var(--hue-color);
    margin-top: -5px;
    margin-left: -5px;
    z-index: 2;
  }

  .color-preview {
    --pattern-size: 10px;
    height: 22px;
    aspect-ratio: 1;
    border: 1px solid var(--tq-input-outline-color);
    border-radius: var(--tq-radius-md);

    &:before {
      background: var(--color-value);
      opacity: var(--alpha);
      border-radius: var(--tq-radius-sm-odd);
    }
  }

  .color-shades {
    width: 100%;
    border-radius: var(--tq-radius-md);
    overflow: hidden;
  }

  .color-shades {
    flex-wrap: wrap;
  }

  .color-shade {
    flex: 1;
    aspect-ratio: 1;
  }
</style>
