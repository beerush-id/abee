<script lang="ts">
  import { Icon, InputUnit } from '../core/index.js';
  import { session } from '@beerush/anchor';
  import { type Document, StorageKeys } from '../document/index.js';
  import { createRuler } from '@beerush/utils';

  const page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  const ruler = createRuler('mm');

  let linkSize = false;
  let linkMargins = true;
  let linkSpacing = true;

  const sizeChanged = (e: CustomEvent<{ name: string }>) => {
    if (linkSize) {
      const { name } = e.detail;
      const value = page[name as never];

      for (const key of [ 'width', 'height' ]) {
        if (key !== name) {
          page[key as never] = value as never;
        }
      }
    }
  };

  const spacingChanged = (e: CustomEvent<{ name: string }>) => {
    if (linkSpacing) {
      const { name } = e.detail;
      const value = page.settings[name as never];

      for (const key of [ 'columnGap', 'rowGap' ]) {
        if (key !== name) {
          page.settings[key as never] = value as never;
        }
      }
    }
  };

  const marginChanged = (e: CustomEvent<{ name: string }>) => {
    if (linkMargins) {
      const { name } = e.detail;
      const value = page.settings[name as never];

      for (const key of [ 'marginTop', 'marginBottom', 'marginLeft', 'marginRight' ]) {
        if (key !== name) {
          page.settings[key as never] = value as never;
        }
      }
    }
  };
</script>
<div class="flex-row items-center gap-md">
  <InputUnit {ruler} class="small gap-sm"
             name="width"
             unit="mm"
             icon="width"
             tooltip="Page Width"
             bind:value={$page.width}
             on:change={sizeChanged} />
  <InputUnit {ruler} class="small gap-sm"
             name="height"
             unit="mm"
             icon="height"
             tooltip="Page Height"
             bind:value={$page.height}
             on:change={sizeChanged} />
  <Icon clickable
        name={ linkSize ? 'lock' : 'lock_open' }
        class="{ linkSize ? 'active' : '' }"
        on:click={() => linkSize = !linkSize} tooltip="Link Size" />
</div>
<h6 class="text-center">Spacings</h6>
<div class="flex-row items-center gap-md">
  <InputUnit {ruler} class="small gap-sm"
             name="columnGap"
             unit="mm"
             icon="align_justify_space_between"
             tooltip="Horizontal Spacing"
             bind:value={$page.settings.columnGap}
             on:change={spacingChanged} />
  <InputUnit {ruler} class="small gap-sm"
             name="rowGap"
             unit="mm"
             icon="align_space_between"
             tooltip="Vertical Spacing"
             bind:value={$page.settings.rowGap}
             on:change={spacingChanged} />
  <Icon clickable
        name={ linkSpacing ? 'lock' : 'lock_open' }
        class="{ linkSpacing ? 'active' : '' }"
        on:click={() => linkSpacing = !linkSpacing} tooltip="Link Spacings" />
</div>
<div class="flex-row items-center gap-md">
  <div class="flex-col gap-md flex-1">
    <InputUnit {ruler}
               name="marginTop"
               icon="move_selection_up"
               class="small gap-sm"
               unit="mm"
               tooltip="Margin Top"
               on:change={marginChanged}
               bind:value={$page.settings.marginTop} />
    <InputUnit {ruler}
               name="marginLeft"
               icon="move_selection_left"
               class="small gap-sm"
               unit="mm"
               tooltip="Margin Left"
               on:change={marginChanged}
               bind:value={$page.settings.marginLeft} />
  </div>
  <div class="flex-col gap-md flex-1">
    <InputUnit {ruler}
               name="marginBottom"
               icon="move_selection_down"
               class="small gap-sm"
               unit="mm"
               tooltip="Margin Bottom"
               on:change={marginChanged}
               bind:value={$page.settings.marginBottom} />
    <InputUnit {ruler}
               name="marginRight"
               icon="move_selection_right"
               class="small gap-sm"
               unit="mm"
               tooltip="Margin Right"
               on:change={marginChanged}
               bind:value={$page.settings.marginRight} />
  </div>
  <div class="flex-row items-center">
    <Icon clickable
          class={linkMargins ? 'active' : ''}
          name={linkMargins ? 'lock' : 'lock_open'}
          tooltip="Link Margins" />
  </div>
</div>
