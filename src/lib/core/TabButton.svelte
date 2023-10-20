<script lang="ts">
  import type { Tab, TabId } from '@beerush/composer';
  import { getContext } from 'svelte';
  import type { State } from '@beerush/anchor';
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';

  export let icon = '';
  export let tooltip = '';
  export let active = false;
  export let reversed: boolean | undefined = undefined;
  export let vertical: boolean | undefined = undefined;
  export let compact: boolean | undefined = undefined;

  let className = '';
  export { className as class };

  const tab: State<Tab> = getContext('tab');
  export let id: TabId = tab.createButtonId();

  $: _active = active ?? $tab.options.active;
  $: _compact = compact ?? $tab.options.compact;
  $: _reversed = reversed ?? $tab.options.reversed;
  $: _vertical = vertical ?? $tab.options.vertical;
</script>

<button class="reset tab-button {className}" use:tab.button={id}
        class:compact={_compact}
        class:active={_active}
        class:vertical={_vertical}
        class:reversed={_reversed}>
  {#if icon}
    <Icon vertical={$tab.options.vertical} name={icon} />
  {/if}
  {#if tooltip}
    <Tooltip text={tooltip} />
  {:else}
    <div class="tab-button-text">
      <slot></slot>
    </div>
  {/if}
</button>

<style lang="scss">
  .tab-button {
    --icon-size: var(--tq-space-xl);
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: var(--tq-font-size-xs);
    border-bottom: 2px solid transparent;
    outline: none;
    transition: var(--tq-transition-ultra-fast);
    gap: var(--tq-space-xs);
    padding: 7px;
    line-height: 1;

    &:hover {
      color: var(--tq-color-primary);
    }

    &.active, &:focus {
      background: var(--tq-color-background-tint);
    }

    &.active {
      border-color: var(--tq-color-primary);
    }

    &.vertical {
      flex-direction: column;
      border-bottom: none;
      border-left: 2px solid transparent;

      &.active {
        border-color: var(--tq-color-primary);
      }

      .tab-button-text {
        writing-mode: vertical-rl;
        text-orientation: mixed;

        &:empty {
          display: none;
        }
      }
    }
  }
</style>
