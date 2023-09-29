<script lang="ts">
  import { persistent, session } from '@beerush/anchor';
  import type { CanvasSettings, Document } from '../document/index.js';
  import { nodes, StorageKeys } from '../document/index.js';
  import { Icon, Tooltip } from '../core/index.js';
  import { ruler } from '@beerush/utils';
  import { onDestroy } from 'svelte';

  export let page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  export let settings = persistent<CanvasSettings>(StorageKeys.SETTINGS, {} as never);

  const { selections } = nodes;

  $: small = $settings.smallToolButton;
  $: alignTarget = $selections.length > 1 ? ($page.settings.alignTarget || 'selection') : 'page';

  const resizeNodes = (scope: 'width' | 'height' | 'all' = 'all', bound: 'selection' | 'page' = 'selection') => {
    if (bound === 'selection') {
      const last = [ ...selections ].pop();
      const rest = selections.slice(0, -1);

      const { width, height } = last?.styles || { width: 0, height: 0 };

      for (const node of rest) {
        const rect = scope === 'width' ? { width } : scope === 'height' ? { height } : { width, height };
        node.styles.set(rect);
      }
    } else if (bound === 'page') {
      const width = ruler.mm(page.width).px;
      const height = ruler.mm(page.height).px;

      for (const node of selections) {
        const rect = scope === 'width' ? { width } : scope === 'height' ? { height } : { width, height };
        node.styles.set(rect);
      }
    }
  };

  const alignNodes = (scope: 'vertical' | 'horizontal' | 'all', align: 'start' | 'center' | 'end') => {
    const last = [ ...selections ].pop();
    const rest = selections.slice(0, -1);

    const { left, top, width, height } = alignTarget === 'selection'
                                         ? last?.styles || { left: 0, top: 0, width: 0, height: 0 }
                                         : { left: 0, top: 0, width: ruler.mm(page.width).px, height: ruler.mm(page.height).px };

    const center = { left: left + width / 2, top: top + height / 2 };
    for (const node of (alignTarget === 'selection' ? rest : selections)) {
      const rect = { ...node.styles };

      if (scope === 'vertical') {
        if (align === 'start') rect.top = top;
        else if (align === 'center') rect.top = center.top - rect.height / 2;
        else if (align === 'end') rect.top = top + height - rect.height;
      } else if (scope === 'horizontal') {
        if (align === 'start') rect.left = left;
        else if (align === 'center') rect.left = center.left - rect.width / 2;
        else if (align === 'end') rect.left = left + width - rect.width;
      } else if (scope === 'all') {
        if (align === 'start') {
          rect.left = left;
          rect.top = top;
        } else if (align === 'center') {
          rect.left = center.left - rect.width / 2;
          rect.top = center.top - rect.height / 2;
        } else if (align === 'end') {
          rect.left = left + width - rect.width;
          rect.top = top + height - rect.height;
        }
      }

      node.styles.set(rect);
    }
  };

  const keyup = (e: KeyboardEvent) => {
    if (!selections.length || (e.target instanceof HTMLInputElement)) {
      return;
    }

    let x = 0;
    let y = 0;

    if (e.key === 'ArrowUp') {
      y = -1;
    } else if (e.key === 'ArrowDown') {
      y = 1;
    } else if (e.key === 'ArrowLeft') {
      x = -1;
    } else if (e.key === 'ArrowRight') {
      x = 1;
    }

    if (e.shiftKey) {
      x *= 10;
      y *= 10;
    } else if (e.ctrlKey) {
      x *= 0.1;
      y *= 0.1;
    }

    if (x || y) {
      for (const node of selections) {
        const rect = { ...node.styles };
        (rect.left as number) += x;
        (rect.top as number) += y;
        node.styles.set(rect);
      }
    }
  };

  window.addEventListener('keyup', keyup);

  onDestroy(() => {
    window.removeEventListener('keyup', keyup);
  });
</script>

<section class="flex-row-center gap-md">
  {#if $selections.length > 1}
    <button class="icon-button" class:small on:click={() => resizeNodes()}>
      <Icon name="resize" />
      <Tooltip text="Make Same Size" />
    </button>
    <button class="icon-button" class:small on:click={() => resizeNodes('width')}>
      <Icon name="width" />
      <Tooltip text="Make Same Width" />
    </button>
    <button class="icon-button" class:small on:click={() => resizeNodes('height')}>
      <Icon name="height" />
      <Tooltip text="Make Same Height" />
    </button>
    <button class="icon-button"
            class:active={$page.settings.alignTarget === 'page'}
            class:small on:click={() => page.settings.alignTarget = 'page'}>
      <Icon name="document_scanner" />
      <Tooltip text="Align to Page" />
    </button>
    <button class="icon-button"
            class:active={$page.settings.alignTarget === 'selection'}
            class:small on:click={() => page.settings.alignTarget = 'selection'}>
      <Icon name="select_all" />
      <Tooltip text="Align to Selection" />
    </button>
    <div class="sp-x"></div>
  {/if}
  {#if $selections.length === 1}
    <button class="icon-button" class:small on:click={() => resizeNodes('all', 'page')}>
      <Icon name="resize" />
      <Tooltip text="Resize to Page Size" />
    </button>
    <button class="icon-button" class:small on:click={() => resizeNodes('width', 'page')}>
      <Icon name="width" />
      <Tooltip text="Resize to Page Width" />
    </button>
    <button class="icon-button" class:small on:click={() => resizeNodes('height', 'page')}>
      <Icon name="height" />
      <Tooltip text="Resize to Page Height" />
    </button>
    <div class="sp-x"></div>
  {/if}
  {#if $selections.length}
    <button class="icon-button" class:small on:click={() => alignNodes('horizontal', 'start')}>
      <Icon name="align_horizontal_left" />
      <Tooltip text="Align Horizontal Left" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('horizontal', 'center')}>
      <Icon name="align_horizontal_center" />
      <Tooltip text="Align Horizontal Center" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('horizontal', 'end')}>
      <Icon name="align_horizontal_right" />
      <Tooltip text="Align Horizontal Right" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('all', 'center')}>
      <Icon name="center_focus_strong" />
      <Tooltip text="Align Center" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('vertical', 'start')}>
      <Icon name="align_vertical_top" />
      <Tooltip text="Align Vertical Top" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('vertical', 'center')}>
      <Icon name="align_vertical_center" />
      <Tooltip text="Align Vertical Center" />
    </button>
    <button class="icon-button" class:small on:click={() => alignNodes('vertical', 'end')}>
      <Icon name="align_vertical_bottom" />
      <Tooltip text="Align Vertical Bottom" />
    </button>
  {/if}
</section>
