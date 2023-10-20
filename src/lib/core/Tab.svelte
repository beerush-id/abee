<script lang="ts">
  import { createTab, style, type StyleDeclarations } from '@beerush/composer';
  import { setContext } from 'svelte';

  export let name: string = crypto.randomUUID();
  export let vertical = false;
  export let reversed = false;
  export let compact = false;
  export let collapsible = false;
  export let rounded = false;
  export let styles: StyleDeclarations = {};
  const tab = createTab(name, { allowEmpty: collapsible, reversed, vertical, compact });

  let className = '';
  export { className as class };

  setContext('tab', tab);
</script>

<div class="tab {className}"
     class:open={$tab.active !== -1}
     class:rounded
     class:vertical
     class:reversed
     class:compact
     use:style={styles}>
  {#if !vertical && !reversed}
    <div class="tab-header">
      <slot name="header"></slot>
    </div>
  {/if}
  {#if $tab.active !== -1}
    <div class="tab-content {className}">
      <slot></slot>
    </div>
  {/if}
  {#if vertical || reversed}
    <div class="tab-header">
      <slot name="header"></slot>
    </div>
  {/if}
</div>

<style lang="scss">
  .tab {
    --content-width: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    &.rounded.open {
      border-radius: var(--tq-radius-lg);
    }

    &:not(.open).rounded {
      overflow: hidden;

      &.vertical {
        border-top-left-radius: var(--tq-radius-lg);
        border-bottom-left-radius: var(--tq-radius-lg);
      }

      &:not(.vertical) {
        border-bottom-right-radius: var(--tq-radius-lg);
        border-bottom-left-radius: var(--tq-radius-lg);
      }
    }

    &.vertical {
      flex-direction: row;
      height: 100%;

      & > .tab-header {
        flex-direction: column;
        height: 100%;
        border-top-left-radius: 0;

        &:after {
          width: var(--tab-header-border-width, 1px);
          height: 100%;
        }
      }

      & > .tab-content {
        flex: 1;
        height: 100%;
      }
    }

    & > .tab-content {
      width: var(--content-width);
    }

    &:not(.open) > .tab-header:after {
      display: none;
    }

    &.reversed {
      &:not(.vertical) {
        & > .tab-header {
          &:after {
            top: 0;
            border-bottom: none;
            border-top: 1px solid var(--tab-header-border-color, var(--tq-color-border));
          }
        }
      }

      &.vertical {
        & > .tab-header {
          &:after {
            width: 100%;
            height: var(--tab-header-border-width, 1px);
          }
        }
      }
    }
  }

  .tab-header {
    display: flex;
    flex-direction: row;
    position: relative;
    background: var(--tq-color-background-shade);
    border-top-left-radius: var(--tq-radius-lg);
    overflow: hidden;

    &:after {
      content: "";
      display: block;
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: var(--tab-header-border-width, 1px);
      background-color: var(--tab-header-border-color, var(--tq-color-border));
    }
  }

  .tab-content {
    width: 100%;
    overflow: auto;
  }
</style>
