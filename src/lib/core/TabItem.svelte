<script lang="ts">
  import { parseId, type Tab, type TabId } from '@beerush/composer';
  import { getContext } from 'svelte';
  import type { State } from '@beerush/anchor';

  export let active: boolean | undefined = undefined;
  export let vertical: boolean | undefined = undefined;
  export let compact: boolean | undefined = undefined;
  export let reversed: boolean | undefined = undefined;

  let className = '';
  export { className as class };

  const tab: State<Tab> = getContext('tab');
  export let id: TabId = tab.createItemId();

  $: _active = active ?? $tab.active === parseId(id);
  $: _vertical = vertical ?? $tab.options.vertical;
  $: _compact = compact ?? $tab.options.compact;
  $: _reversed = reversed ?? $tab.options.reversed;
</script>

{#if _active}
  <div class="tab-item {className}"
       class:reversed={_reversed}
       class:compact={_compact}
       class:vertical={_vertical}
       class:active={_active}>
    <slot />
  </div>
{/if}

<style lang="scss">
  .tab-item:not(.compact) {
    padding: var(--tq-space-md);
  }

  .tab-item.vertical {
    height: 100%;
  }
</style>
