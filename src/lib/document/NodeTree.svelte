<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { Icon, Tree } from '../core/index.js';
  import { ICON_MAP, type Node, nodes } from './Node.js';

  export let items: State<Node[]> = [] as never;

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

  $: rows = [ ...$items ].reverse();
</script>

{#each rows as node}
  <Tree label={node.name || 'Layer'}
        icon={node.locked ? 'lock' : ICON_MAP[node.type]}
        expandable={node.children?.length}
        active={node.selected}
        on:mouseenter={() => hover(node, true)}
        on:mouseleave={() => hover(node, false)}
        on:click={e => select(e, node)}>
    <svelte:fragment slot="header">
      <div class="tree-actions">
        <Icon clickable
              name={node.visible ? 'visibility' : 'visibility_off'}
              tooltip="Toggle Visibility"
              on:click={() => node.visible = !node.visible} />
        <Icon clickable
              name={node.printable ? 'print' : 'print_disabled'}
              tooltip="Toggle Printable"
              on:click={() => node.printable = !node.printable} />
        <Icon clickable
              name={node.locked ? 'lock' : 'no_encryption'}
              tooltip="Toggle Locked"
              on:click={() => node.locked = !node.locked} />
      </div>
    </svelte:fragment>
    {#if node.children?.length}
      <svelte:self items={node.children} />
    {/if}
  </Tree>
{/each}
