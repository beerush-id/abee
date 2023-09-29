<script lang="ts">
  import type { CanvasViewport } from '../document/index.js';
  import { nodes, StorageKeys } from '../document/index.js';
  import { FormField, Icon, InputUnit, ToolPanel, Tooltip } from '../core/index.js';
  import { session } from '@beerush/anchor';
  import Document from './Document.svelte';
  import Radius from './Radius.svelte';

  const viewport = session<CanvasViewport>(StorageKeys.VIEWPORT, {} as never);
  const { selections, rects } = nodes;

  const setWidth = (e: CustomEvent<{ value: number }>) => {
    const { value } = e.detail;

    selections.forEach((node) => {
      node.styles.width = value;

      if (linkSize) {
        node.styles.height = value;
      }
    });
  };
  const setHeight = (e: CustomEvent<{ value: number }>) => {
    const { value } = e.detail;

    selections.forEach((node) => {
      node.styles.height = value;

      if (linkSize) {
        node.styles.width = value;
      }
    });
  };
  const setLeft = (e: CustomEvent<{ value: number }>) => {
    const { value } = e.detail;

    selections.forEach((node) => {
      node.styles.left = value;
    });
  };
  const setTop = (e: CustomEvent<{ value: number }>) => {
    const { value } = e.detail;

    selections.forEach((node) => {
      node.styles.top = value;
    });
  };
  const setRotate = (e: Event & { currentTarget: HTMLInputElement }) => {
    selections.forEach((node) => {
      node.styles.rotate = parseFloat((e.target as HTMLInputElement)?.value || '0') as number;
    });
  };

  const togglePosition = () => {
    selections.forEach((node) => {
      node.styles.position = node.styles.position === 'absolute' ? 'relative' : 'absolute';
    });
  };

  let linkSize = false;

  $: unit = $viewport.unit;
  $: rect = rects.get($selections[0]);
  $: idtWidth = $selections.every((node) => node.styles.width === rect?.width);
  $: idtHeight = $selections.every((node) => node.styles.height === rect?.height);
  $: idtLeft = $selections.every((node) => node.styles.left === rect?.left);
  $: idtTop = $selections.every((node) => node.styles.top === rect?.top);
  $: idtRotate = $selections.every((node) => node.styles.rotate === rect?.rotate);
</script>

<ToolPanel title={$rect ? 'Layer Properties' : 'Page Properties'} icon="aspect_ratio" collapsible={false}>
  {#if $rect}
    <div class="flex-row items-center gap-md">
      <InputUnit class="small gap-sm" {unit}
                 icon="width"
                 tooltip="Width"
                 indeterminate={!idtWidth}
                 value={$rect?.width}
                 on:change={setWidth} />
      <InputUnit class="small gap-sm" {unit}
                 icon="height"
                 tooltip="Height"
                 indeterminate={!idtHeight}
                 value={$rect?.height}
                 on:change={setHeight} />
      <Icon clickable
            name={ linkSize ? 'lock' : 'lock_open' }
            class="{ linkSize ? 'active' : '' }"
            on:click={() => linkSize = !linkSize} tooltip="Link Size" />
    </div>
    <div class="flex-row items-center gap-md">
      <InputUnit class="small gap-sm" {unit}
                 label="X"
                 tooltip="Left"
                 indeterminate={!idtLeft}
                 value={$rect?.left}
                 on:change={setLeft} />
      <InputUnit class="small gap-sm" {unit}
                 label="Y"
                 tooltip="Top"
                 indeterminate={!idtTop}
                 value={$rect?.top}
                 on:change={setTop} />
      <Icon clickable
            name={ $rect?.position === 'absolute' ? 'picture_in_picture_alt' : 'move_selection_right' }
            class="{ $rect?.position === 'absolute' ? 'active' : '' }"
            tooltip={ $rect?.position === 'absolute' ? 'Switch to Relative' : 'Switch to Absolute' }
            on:click={togglePosition} />
    </div>
    {#if $selections[0]?.tag !== 'circle'}
      <Radius />
    {/if}
    <h6>Rotation</h6>
    <div class="flex-row items-center gap-md">
      <FormField class="small gap-sm" indeterminate={!idtRotate}>
        <Icon name="flip_camera_android" />
        <input type="number" value={$rect?.rotate || 0} disabled={!$rect} on:input={setRotate}>
        <span class="input-unit">deg</span>
      </FormField>
      <button class="icon-button small">
        <Icon name="aspect_ratio" />
        <Tooltip text="Lock Ratio" />
      </button>
    </div>
  {:else}
    <Document />
  {/if}
</ToolPanel>
