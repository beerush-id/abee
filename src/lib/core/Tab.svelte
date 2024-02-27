<script lang="ts">
  import { createTab, style, type StyleDeclarations } from '@beerush/composer';
  import { setContext } from 'svelte';

  export let name: string = crypto.randomUUID();
  export let vertical = false;
  export let reversed = false;
  export let compact = false;
  export let collapsible = false;
  export let styles: StyleDeclarations = {};
  const tab = createTab(name, { allowEmpty: collapsible, reversed, vertical, compact });

  let className = '';
  export { className as class };

  setContext('tab', tab);

  $: open = $tab.active !== -1;
</script>

<div class="tab {className}"
     class:open
     class:vertical
     class:reversed
     class:compact
     use:style={styles}>
  {#if !vertical && !reversed}
    <div class="tab-header" class:vertical class:open>
      <slot name="header"></slot>
    </div>
  {/if}
  {#if open}
    <div class="tab-content" class:vertical class:reversed class:open>
      <slot></slot>
    </div>
  {/if}
  {#if vertical || reversed}
    <div class="tab-header" class:vertical class:reversed class:open>
      <slot name="header"></slot>
    </div>
  {/if}
</div>

<style lang="scss">
  .tab {
    --content-width: 100%;
    display: flex;
    flex-direction: column;

    &.open {
      width: var(--content-width);
    }

    &.vertical {
      flex-direction: row;

      &:not(.flex-1) {
        height: var(--content-height, 100%);
      }
    }
  }

  .tab-header {
    width: 100%;
    height: var(--header-height, var(--tq-panel-header-height));
    display: flex;
    flex-direction: row;
    position: relative;
    background: var(--tq-color-background-shade);
    border-top-left-radius: var(--tq-radius-lg);
    overflow: auto;

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

    &:not(.open):after {
      display: none;
    }

    &.vertical {
      height: 100%;
      width: var(--header-width, var(--tq-panel-header-height-sm));
      flex-direction: column;
      border-top-left-radius: 0;

      &:after {
        width: var(--tab-header-border-width, 1px);
        height: 100%;
      }

      &.reversed:after {
        width: 100%;
        height: var(--tab-header-border-width, 1px);
      }
    }

    &.reversed:after {
      top: 0;
      border-bottom: none;
      border-top: 1px solid var(--tab-header-border-color, var(--tq-color-border));
    }
  }

  .tab-content {
    width: 100%;
    height: calc(100% - var(--header-height, var(--tq-panel-header-height)));

    &.vertical {
      height: 100%;
      width: calc(100% - var(--header-width, var(--tq-panel-header-height-sm)));
    }
  }
</style>
