<script lang="ts">
  import type { CanvasSettings, CanvasViewport, Document } from './Document.js';
  import { createRuler, entries, KNOWN_UNITS } from '@beerush/utils';
  import { FormField, InputUnit } from '../core/index.js';
  import { persistent, session } from '@beerush/anchor';
  import { StorageKeys } from './Registry.js';

  const page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  const viewport = session<CanvasViewport>(StorageKeys.VIEWPORT, {} as never);
  const settings = persistent<CanvasSettings>(StorageKeys.SETTINGS, {} as never);
  const ruler = createRuler('mm');
</script>

<div class="doc-dialog flex-col gap-xl"
     style:--input-width="100%">
  <div class="flex-row items-center gap-lg">
    <InputUnit {ruler} unit="mm" placeholder="Document Width" bind:value={$page.width} />
    <InputUnit {ruler} unit="mm" placeholder="Document Height" bind:value={$page.height} />
    <FormField placeholder="Document DPI" unit="dpi">
      <input type="number" bind:value={$page.dpi}>
    </FormField>
  </div>
  <h5>Margins</h5>
  <div class="flex-row items-center gap-lg">
    <InputUnit {ruler} unit="mm" placeholder="Top" bind:value={$page.settings.marginTop} />
    <InputUnit {ruler} unit="mm" placeholder="Bottom" bind:value={$page.settings.marginBottom} />
    <InputUnit {ruler} unit="mm" placeholder="Left" bind:value={$page.settings.marginLeft} />
    <InputUnit {ruler} unit="mm" placeholder="Right" bind:value={$page.settings.marginRight} />
  </div>
  <div class="divider"></div>
  <h4>Viewport Settings</h4>
  <div class="flex-row items-center gap-lg">
    <InputUnit {ruler} unit="mm" placeholder="Canvas Size" bind:value={$viewport.boardSize} />
    <FormField placeholder="Screen PPI" unit="ppi">
      <input type="number" bind:value={$viewport.dpi}>
    </FormField>
    <FormField select placeholder="Display Unit" class="flex-0">
      <select bind:value={$viewport.unit}>
        {#each entries(KNOWN_UNITS) as unit}
          <option value={unit[0]}>{unit[1].label}</option>
        {/each}
      </select>
    </FormField>
  </div>
  <div class="flex-row items-center gap-lg">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$settings.showPointerPosition}>
      <span class="checkbox-label">Show pointer position.</span>
    </label>
  </div>
  <div class="flex-row items-center gap-lg">
    <label class="checkbox">
      <input type="checkbox" bind:checked={$settings.snapToPixel}>
      <span class="checkbox-label">Snap to Pixels.</span>
    </label>
  </div>
</div>
