<script lang="ts">
  import Icon from './Icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import { draggable, DragWith } from '@beerush/composer';

  const dispatch = createEventDispatcher<{
    click: MouseEvent;
    mouseenter: MouseEvent;
    mouseleave: MouseEvent;
  }>();

  export let label: string;
  export let expandable: boolean | number = false;
  export let open = true;
  export let disabled = false;
  export let active = false;
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
<section class="tree-item"
         class:expandable
         class:open
         use:draggable={DragWith.Vertical}
         on:drag-end={console.log}>
  <header class="tree-header" class:disabled>
    {#if expandable}
      <div class="tree-expander" class:placeholder={!expandable}>
        <Icon clickable name={open ? 'expand_more' : 'chevron_right'} class="transform" on:click={toggleExpand} />
      </div>
    {/if}
    <button class="reset tree-button flex-row items-center gap-sm flex-1" class:active
            on:mouseenter={mouseenter}
            on:mouseleave={mouseleave}
            on:click={click}>
      {#if icon}
        <Icon name={icon} />
      {/if}
      <span>{label}</span>
    </button>
    <slot name="header"></slot>
  </header>
  {#if expandable && open}
    <section class="tree-children flex-col">
      <slot></slot>
    </section>
  {/if}
</section>
