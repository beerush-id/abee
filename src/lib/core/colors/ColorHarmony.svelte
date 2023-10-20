<script lang="ts">
  import Tab from '../Tab.svelte';
  import TabItem from '../TabItem.svelte';
  import TabButton from '../TabButton.svelte';
  import ColorWheel from './ColorWheel.svelte';
  import Tooltip from '../Tooltip.svelte';
  import { Harmony } from '@beerush/composer/color';
  import { createEventDispatcher } from 'svelte';

  export let name = 'color-harmony';
  export let primary = '#ff0000';
  export let value = primary;
  export let vertical = false;

  const dispatch = createEventDispatcher<{
    change: string;
  }>();

  const change = (e: CustomEvent<string>) => {
    dispatch('change', e.detail);
  };
</script>

<Tab {name} {vertical}>
  <svelte:fragment slot="header">
    <div class="base-picker tab-button">
      <input type="color" bind:value={primary}>
      <Tooltip text="Base Color" />
    </div>
    <slot name="header"></slot>
    <TabButton icon="clock_loader_10" id={Harmony.Complementary}>Complementary</TabButton>
    <TabButton icon="clock_loader_20" id={Harmony.SplitComplementary}>Split Complementary</TabButton>
    <TabButton icon="clock_loader_40" id={Harmony.Analogous}>Analogous</TabButton>
    <TabButton icon="clock_loader_60" id={Harmony.Triadic}>Triadic</TabButton>
    <TabButton icon="clock_loader_80" id={Harmony.Tetradic}>Tetradic</TabButton>
    <TabButton icon="clock_loader_90" id={Harmony.Square}>Square</TabButton>
    <TabButton icon="gradient" id={Harmony.Monochromatic}>Monochromatic</TabButton>
  </svelte:fragment>
  <slot></slot>
  <TabItem id={Harmony.Complementary}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Complementary} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.SplitComplementary}>
    <ColorWheel bind:primary bind:value harmony={Harmony.SplitComplementary} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.Analogous}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Analogous} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.Monochromatic}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Monochromatic} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.Triadic}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Triadic} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.Tetradic}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Tetradic} showSwatches on:change={change} />
  </TabItem>
  <TabItem id={Harmony.Square}>
    <ColorWheel bind:primary bind:value harmony={Harmony.Square} showSwatches on:change={change} />
  </TabItem>
</Tab>

<style lang="scss">
  .base-picker {
    aspect-ratio: 1;
    padding: var(--tq-space-sm);

    input {
      width: 100%;
      height: 100%;
    }
  }
</style>
