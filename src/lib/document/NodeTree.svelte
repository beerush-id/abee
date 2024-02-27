<script lang="ts">
  import type { State } from '@beerush/anchor';
  import type { Node } from './Node.js';
  import NodeTreeItem from './NodeTreeItem.svelte';

  export let items: State<Node[]> = [] as never;

  $: rows = [ ...$items ].reverse();
</script>

{#each rows as node}
  <NodeTreeItem {node}>
    {#if node.children?.length}
      <svelte:self items={node.children} />
    {/if}
  </NodeTreeItem>
{/each}
