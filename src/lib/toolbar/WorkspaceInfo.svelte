<script lang="ts">
  import { Icon } from '../core/index.js';
  import type { CanvasPointer, CanvasSettings, CanvasViewport, Document } from '../document/index.js';
  import { nodes, StorageKeys } from '../document/index.js';
  import type { Ruler } from '@beerush/utils';
  import { persistent, session } from '@beerush/anchor';

  export let ruler: Ruler;

  const page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  const viewport = session<CanvasViewport>(StorageKeys.VIEWPORT, {} as never);
  const pointer = session<CanvasPointer>(StorageKeys.POINTER, {} as never);
  const settings = persistent<CanvasSettings>(StorageKeys.SETTINGS, {} as never);

  const { rects } = nodes;

  const { mm, px } = ruler;
</script>

<section class="flex-row items-center gap-md" style:--this-icon-cursor="default" style:cursor="default">
  <Icon name="newsmode" tooltip="Document Info" class="icon-md" />
  <div class="flex-row items-center gap-xs">
    <Icon name="width" class="icon-md" />
    <span>{mm($page.width)[$viewport.unit]}{$viewport.unit}</span>
  </div>
  <div class="flex-row items-center gap-xs">
    <Icon name="height" class="icon-md" />
    <span>{mm($page.height)[$viewport.unit]}{$viewport.unit}</span>
  </div>
  <div class="flex-row items-center gap-xs">
    <Icon name="background_dot_large" class="icon-md" />
    <span>{$page.dpi} DPI</span>
  </div>
  <div class="flex-row items-center gap-xs">
    <Icon name="pageview" class="icon-md" />
    <span>{Math.round($viewport.scale * 100)}%</span>
  </div>
  <div class="flex-row items-center gap-xs">
    <Icon name="layers" class="icon-md" />
    <span>{$rects.size} Layers</span>
  </div>
  {#if $settings.showPointerPosition}
    <div class="flex-row items-center gap-xs">
      <Icon name="arrow_selector_tool" class="icon-md" />
      <span>{px($pointer.x)[$viewport.unit].toLocaleString()}{$viewport.unit}</span>
      <span>, {px($pointer.y)[$viewport.unit].toLocaleString()}{$viewport.unit}</span>
    </div>
  {/if}
</section>
