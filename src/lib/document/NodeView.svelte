<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { anchor } from '@beerush/anchor';
  import { onDestroy } from 'svelte';
  import { style } from '@beerush/utils/client';
  import { NODE_ELEMENTS } from './Registry.js';
  import { type Node, nodes } from './Node.js';

  export let node: State<Node>;
  export let editable = false;
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
  <node-view contenteditable class="node-view" class:selected={$node.selected}
             bind:this={bindings.element}
             bind:innerHTML={$node.text}
             use:style={$rect}>
    {#if $node.children?.length}
      {#each $node.children as child}
        <svelte:self node={child} {editable} />
      {/each}
    {/if}
  </node-view>
{:else}
  <node-view class="node-view"
             class:selected={$node.selected}
             class:hover={$node.hovered}
             bind:this={bindings.element}
             use:style={$rect}>
    {#if $node.type === 'text'}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html $node.text}
    {/if}
    {#if $node.children?.length}
      {#each $node.children as child}
        <svelte:self node={child} {editable} />
      {/each}
    {/if}
  </node-view>
{/if}

<style lang="scss">
  .node-view {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: default;
    pointer-events: all;

    &.selected {
      pointer-events: none;
    }

    &.hover:not(.selected):before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: dashed 1px rgba(0, 0, 255, 0.5);
    }
  }
</style>
