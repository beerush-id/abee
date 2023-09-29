<script lang="ts">
  import { session, type State } from '@beerush/anchor';
  import { Icon, ToolPanel } from '../core/index.js';
  import type { Document, Node } from '../document/index.js';
  import { nodes, NodeTree, StorageKeys } from '../document/index.js';

  export let page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  const { selections } = nodes;

  const select = (e: MouseEvent, node: State<Node>) => {
    if (e.ctrlKey) {
      nodes.toggleSelect(node, true);
    } else {
      nodes.select(node);
    }
  };

  const hover = (node: Node, hovered: boolean) => {
    node.hovered = hovered;
  };
</script>
<ToolPanel title="Layers" icon="layers" class="flex-1" scrollable collapsible={false}>
  <svelte:fragment slot="header">
    <div class="clickable flex-row items-center gap-md">
      {#if $selections.length > 1}
        <Icon clickable
              name="join"
              class="icon-md text-primary"
              tooltip="Group Layers"
              on:click={() => nodes.group()} />
      {/if}
      <div class="flex-1"></div>
      <Icon clickable
            name="select_all"
            tooltip="Select All"
            class="icon-md"
            on:click={() => nodes.selectAll()} />
      <Icon clickable
            name="deselect"
            tooltip="Select None"
            class="icon-md"
            on:click={() => nodes.deselectAll()} />
      {#if $selections.length}
        <div class="sp-x"></div>
        <Icon clickable
              name="delete"
              tooltip="Delete"
              class="icon-md"
              on:click={() => nodes.removeSelected()} />
      {/if}
    </div>
  </svelte:fragment>
  <section class="tree-list flex-col gap-sm">
    <NodeTree items={$page.nodes} />
  </section>
</ToolPanel>

<style lang="scss">
  .clickable {
    pointer-events: all;
  }
</style>
