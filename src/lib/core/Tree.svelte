<script lang="ts">
  import Icon from './Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    click: MouseEvent;
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
  }>();

  export let label: string;
  export let expandable: boolean | number = false;
  export let open = true;
  export let disabled = false;
  export let selected = false;
  export let icon = '';

  const click = (e: MouseEvent | KeyboardEvent) => {
    if (disabled) return;
    dispatch('click', e as never);
  };
  const mouseenter = (e: MouseEvent) => {
    if (disabled) return;
    dispatch('mouseenter', e as never);
  };
  const mouseleave = (e: MouseEvent) => {
    if (disabled) return;
    dispatch('mouseleave', e as never);
  };

  const toggleExpand = () => {
    if (disabled) return;
    open = !open;
  };
</script>
<section class="tree-item flex-col gap-sm" class:open>
  <!-- eslint-disable-next-line -->
  <header class="tree-header flex-row items-center gap-xs" class:disabled>
    <div class="tree-expander flex-row-center" class:placeholder={!expandable}>
      {#if expandable}
        <Icon clickable name={open ? 'expand_more' : 'chevron_right'} class="transform" on:click={toggleExpand} />
      {:else}
        <Icon name="switch_access" class="icon-placeholder" />
      {/if}
    </div>
    <button class="reset tree-button flex-row items-center gap-sm" class:selected
            on:mouseenter={mouseenter}
            on:mouseleave={mouseleave}
            on:click={click}>
      {#if icon}
        <Icon name={icon} />
      {/if}
      <span>{label}</span>
    </button>
    <div class="flex-1"></div>
    <slot name="header"></slot>
  </header>
  {#if expandable && open}
    <section class="tree-children flex-col gap-sm">
      <slot></slot>
    </section>
  {/if}
</section>

<style lang="scss">
  .tree-item {
    --icon-size: 18px;
    appearance: none;
  }

  .tree-header {
    cursor: default;
    user-select: none;
    font-size: var(--tq-font-size-xs);

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
    }
  }

  .tree-button {
    transition: all .1s ease-in-out;
    outline: none;
    appearance: none;

    &:hover, &.selected {
      color: var(--tq-color-primary);
    }
  }

  .tree-children {
    padding-left: calc(var(--tq-space-xs) + var(--icon-size));
  }

  .placeholder {
    opacity: 0.2;
  }
</style>
