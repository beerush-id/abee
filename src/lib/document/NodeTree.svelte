<script lang="ts">
  import { session, type State } from '@beerush/anchor';
  import { StorageKeys } from './Registry.js';
  import type { Document } from './Document.js';
  import { Tree } from '../core/index.js';
  import { ICON_MAP, type Node, nodes } from './Node.js';

  const page = session<Document>(StorageKeys.DOCUMENT, {} as never);
  export let items = page.nodes;

  const select = (e: CustomEvent<MouseEvent>, node: State<Node>) => {
    if (e.detail.ctrlKey) {
      nodes.toggleSelect(node, true);
    } else if (e.detail.shiftKey) {
      const last = nodes.selections[nodes.selections.length - 1];
      nodes.selectRange(last, node);
    } else {
      nodes.select(node);
    }
  };

  const hover = (node: State<Node>, hovered: boolean) => {
    node.hovered = hovered;
  };
</script>

{#each $items as node}
  <Tree label={node.name || 'Layer'}
        icon={ICON_MAP[node.tag]}
        expandable={node.children?.length}
        selected={node.selected}
        on:mouseenter={() => hover(node, true)}
        on:mouseleave={() => hover(node, false)}
        on:click={e => select(e, node)}>
    {#if node.children?.length}
      <svelte:self items={node.children} />
    {/if}
  </Tree>
{/each}
