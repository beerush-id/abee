<script lang="ts">
  import { getContext } from 'svelte';
  import type { Picker } from '@beerush/composer/color';
  import { PickerKey } from '@beerush/composer/color';

  export let picker: Picker = getContext<Picker>(PickerKey.Picker);
  export let vertical = getContext(PickerKey.Vertical);
</script>
{#if picker}
  <div class="color-slider"
       class:vertical
       style="background-image: linear-gradient(to {vertical ? 'bottom':'right'}, {picker.hues.join(', ')})">
    <div class="slider-track" use:picker.hue></div>
  </div>
{/if}
