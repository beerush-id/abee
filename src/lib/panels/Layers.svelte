<script lang="ts">
  import { session } from '@beerush/anchor';
  import { Icon, ToolPanel } from '../core/index.js';
  import type { Document } from '../document/index.js';
  import { nodes, NodeTree, StorageKeys } from '../document/index.js';

  export let page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  const { selections } = nodes;
</script>
<ToolPanel title="Layers" icon="layers" class="flex-1" scrollable collapsible={false}>
  <svelte:fragment slot="header">
    <div class="clickable flex-row items-center gap-xs">
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
      {#if $selections.length}
        <Icon clickable
              name="deselect"
              tooltip="Select None"
              class="icon-md"
              on:click={() => nodes.deselectAll()} />
        <div class="sp-x"></div>
        <Icon clickable
              name="delete"
              tooltip="Delete"
              class="icon-md"
              on:click={() => nodes.removeSelected()} />
      {/if}
    </div>
  </svelte:fragment>
  <section class="tree-list">
    <NodeTree items={$page.nodes} />
  </section>
</ToolPanel>

<style lang="scss">
  .clickable {
    pointer-events: all;
  }
</style>
