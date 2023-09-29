<script lang="ts">
  import { Dialog, Icon, Tooltip } from '../core/index.js';
  import type { CanvasSettings, CanvasViewport } from '../document/index.js';
  import { DocumentSetting, StorageKeys } from '../document/index.js';
  import type { Canvas } from '../canvas/index.js';
  import { persistent, session } from '@beerush/anchor';

  export let canvas: Canvas;
  const viewport = session<CanvasViewport>(StorageKeys.VIEWPORT, {} as never);
  const settings = persistent<CanvasSettings>(StorageKeys.SETTINGS, {} as never);

  let settingDg: Dialog;

  $: small = $settings.smallToolButton;
</script>
<div class="right-tool-panel flex-row items-center gap-md">
  <button class="icon-button" class:small on:click={() => canvas.zoomIn()}>
    <Icon name="zoom_in" />
    <Tooltip text="Zoom In" />
  </button>
  <span class="flex-row items-center justify-center" style:width="36px">{Math.round($viewport.scale * 100)}%</span>
  <button class="icon-button" class:small disabled={$viewport.scale <= 0.1} on:click={() => canvas.zoomOut()}>
    <Icon name="zoom_out" />
    <Tooltip text="Zoom Out" />
  </button>
  <button class="icon-button" class:small on:click={() => canvas.zoomFit()}>
    <Icon name="crop_free" />
    <Tooltip text="Zoom to fit" />
  </button>
  <button class="icon-button" class:small on:click={() => canvas.zoomFit('width')}>
    <Icon name="width_full" />
    <Tooltip text="Fit to Viewport Width" />
  </button>
  <button class="icon-button" class:small
          disabled={$viewport.scale === 1}
          on:click={() => canvas.zoomFull()}>
    <Icon name="zoom_in_map" />
    <Tooltip text="Zoom to 100%" />
  </button>
  <div class="sp-x"></div>
  <button class="icon-button active" class:small>
    <Icon name="all_inclusive" />
    <Tooltip text="Paper Roll Mode" />
  </button>
  <button class="icon-button"
          class:small
          class:active={$settings.showRulers}
          on:click={() => settings.showRulers = !settings.showRulers}>
    <Icon name="straighten" />
    <Tooltip text="Toggle Rulers" />
  </button>
  <button class="icon-button" class:small on:click={() => settingDg?.show()}>
    <Icon name="display_settings" />
    <Tooltip text="Document Settings" />
  </button>
  <Dialog bind:this={settingDg}
          name="document-settings"
          title="Document Settings"
          class="dialog-md"
          autofocus>
    <svelte:fragment slot="content">
      <DocumentSetting />
    </svelte:fragment>
    <svelte:fragment slot="footer">
      <div class="flex-1"></div>
      <button class="solid" on:click={() => settingDg?.hide()}>Done</button>
    </svelte:fragment>
  </Dialog>
</div>
