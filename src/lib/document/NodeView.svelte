<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { anchor } from '@beerush/anchor';
  import { onDestroy } from 'svelte';
  import { style } from '@beerush/utils/client';
  import { NODE_ELEMENTS } from './Registry.js';
  import { type Node, nodes } from './Node.js';

  export let node: State<Node>;
  export let editable = false;
  export let interactive = false;

  const rect = nodes.rects.get(node) || anchor({ ...node.styles });
  let element: HTMLDivElement;

  const bindings = {
    set element(elem: HTMLDivElement) {
      NODE_ELEMENTS.delete(element);
      element = elem;

      if (element) {
        NODE_ELEMENTS.set(element, node);
      }
    },
    get element() {
      return element;
    },
  };

  const unsubRect = node.styles.subscribe((r) => {
    rect.set(r);
  }, false);

  onDestroy(() => {
    unsubRect();

    for (const [ e, n ] of NODE_ELEMENTS) {
      if (n === node) {
        NODE_ELEMENTS.delete(e);
      }
    }
  });
</script>

{#if $node.type === 'text' && editable}
  <node-view contenteditable class="node-view"
             class:selected={$node.selected}
             class:printable={$node.printable}
             class:visible={$node.visible}
             class:locked={$node.locked}
             class:dragging={$rect.isDragging}
             class:interactive
             bind:this={bindings.element}
             bind:innerHTML={$node.text}
             use:style={{ styles: $rect }}>
    {#if $node.children?.length}
      {#each $node.children as child}
        <svelte:self node={child} interactive={false} {editable} />
      {/each}
    {/if}
  </node-view>
{:else}
  <node-view class="node-view"
             class:selected={$node.selected}
             class:hover={$node.hovered}
             class:printable={$node.printable}
             class:visible={$node.visible}
             class:locked={$node.locked}
             class:dragging={$rect.isDragging}
             class:interactive
             bind:this={bindings.element}
             use:style={{ styles: $rect }}>
    {#if $node.type === 'text'}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html $node.text}
    {/if}
    {#if $node.children?.length}
      {#each $node.children as child}
        <svelte:self node={child} interactive={false} {editable} />
      {/each}
    {/if}
  </node-view>
{/if}

<style lang="scss">
  .node-view {
    --select-offset: 10px;
    display: none;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: default;
    pointer-events: all;

    &.visible {
      display: flex;
    }

    &.selected {
      pointer-events: none;
    }

    &.locked {
      pointer-events: none;
    }

    &.hover:not(.dragging):before, &.selected:not(.dragging):before {
      content: "";
      position: absolute;
      top: calc((var(--select-offset) / 2) * -1);
      left: calc((var(--select-offset) / 2) * -1);
      width: calc(100% + var(--select-offset));
      height: calc(100% + var(--select-offset));
      outline: dashed 1px rgba(255, 0, 255, 0.5);
    }

    &:not(.interactive) {
      pointer-events: none;
    }
  }
</style>
