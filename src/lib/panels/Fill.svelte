<script lang="ts">
  import { nodes } from '../document/index.js';
  import { onDestroy } from 'svelte';
  import { ColorHarmony, ColorPicker, Tab, TabButton, TabItem } from '../core/index.js';

  export let name = 'fill-color';
  export let primary = 'ff0000';
  export let value = primary;

  const { selections } = nodes;

  const unsubscribe = selections.subscribe((items) => {
    if (items.length) {
      const { backgroundColor } = items[0].styles;

      if (backgroundColor !== 'transparent') {
        value = backgroundColor as string;
      }
    }
  });

  const input = (e: CustomEvent<string>) => {
    value = e.detail;

    for (const node of selections) {
      node.styles.backgroundColor = value;
    }
  };

  onDestroy(() => {
    unsubscribe();
  });
</script>

<Tab {name} class="h-full">
  <svelte:fragment slot="header">
    <TabButton id="solid" icon="colors">Solid</TabButton>
    <TabButton id="gradient" icon="gradient">Gradient</TabButton>
  </svelte:fragment>
  <TabItem compact id="solid">
    <ColorHarmony name={name + '-harmony'} vertical bind:value bind:primary on:change={input}>
      <svelte:fragment slot="header">
        <TabButton id="picker" icon="colorize" tooltip="Color Picker" />
      </svelte:fragment>
      <TabItem id="picker">
        <ColorPicker {primary} bind:value on:input={input} on:change={input} />
      </TabItem>
    </ColorHarmony>
  </TabItem>
</Tab>
