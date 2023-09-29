<script lang="ts">
  import { Icon, InputUnit } from '../core/index.js';
  import { session } from '@beerush/anchor';
  import type { CanvasViewport } from '../document/index.js';
  import { nodes, StorageKeys } from '../document/index.js';

  const viewport = session<CanvasViewport>(StorageKeys.VIEWPORT, {} as never);
  const { selections } = nodes;

  let linkRadius = true;

  const assign = (e: CustomEvent<{ name: string, value: number }>) => {
    selections.forEach(node => {
      if (linkRadius) {
        for (const key of
          [ 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius' ]) {
          node.styles.set({
            [key]: e.detail.value,
          });
        }
      } else {
        node.styles.set({
          [e.detail.name]: e.detail.value,
        });
      }
    });
  };

  $: unit = $viewport.unit;
  $: rect = nodes.rects.get($selections[0] ?? null) ?? {} as never;

  $: idtTopLeft = $selections.every(n => n.styles.borderTopLeftRadius === rect?.borderTopLeftRadius);
  $: idtTopRight = $selections.every(n => n.styles.borderTopRightRadius === rect?.borderTopRightRadius);
  $: idtBottomLeft = $selections.every(n => n.styles.borderBottomLeftRadius === rect?.borderBottomLeftRadius);
  $: idtBottomRight = $selections.every(n => n.styles.borderBottomRightRadius === rect?.borderBottomRightRadius);
</script>

<h6 class="text-center">Radius</h6>
<div class="flex-row items-center gap-md">
  <div class="flex-col gap-md">
    <InputUnit class="small gap-sm" {unit}
               label="TL"
               tooltip="Top-Left Radius"
               name="borderTopLeftRadius"
               indeterminate={!idtTopLeft}
               value={rect?.borderTopLeftRadius}
               on:change={assign} />
    <InputUnit class="small gap-sm" {unit}
               label="BL"
               tooltip="Bottom-Left Radius"
               name="borderBottomLeftRadius"
               indeterminate={!idtBottomLeft}
               value={rect?.borderBottomLeftRadius}
               on:change={assign} />
  </div>
  <div class="flex-col gap-md">
    <InputUnit class="small gap-sm" {unit}
               label="TR"
               tooltip="Top-Right Radius"
               name="borderTopRightRadius"
               indeterminate={!idtTopRight}
               value={rect?.borderTopRightRadius}
               on:change={assign} />
    <InputUnit class="small gap-sm" {unit}
               label="BR"
               tooltip="Bottom-Right Radius"
               name="borderBottomRightRadius"
               indeterminate={!idtBottomRight}
               value={rect?.borderBottomRightRadius}
               on:change={assign} />
  </div>
  <div class="flex-row items-center gap-md">
    <Icon clickable
          tooltip="Link all radius"
          name={linkRadius ? 'link' : 'link_off'}
          class={linkRadius ? 'active' : ''}
          on:click={() => linkRadius = !linkRadius} />
  </div>
</div>
