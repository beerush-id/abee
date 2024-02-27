<script lang="ts">
  import Icon from './Icon.svelte';

  export let title = '';
  export let icon = '';
  export let open = true;
  export let scrollable = false;
  export let collapsible = true;
  export let compact = false;

  let className = '';
  export { className as class };
</script>

{#if collapsible}
  <details class:card={!compact}
           class:elevated={!compact}
           class:elevated-md={!compact}
           class="tool-panel flex-col {className}"
           bind:open>
    <summary class="panel-header flex-row items-center px-md py-sm gap-md" class:pb-0={open}>
      {#if icon}
        <Icon class="icon-md" name={icon} />
      {/if}
      <h5>{title}</h5>
      <span class="flex-1" />
      <slot name="header"></slot>
      {#if collapsible}
        <Icon name={open ? 'arrow_drop_up' : 'arrow_drop_down'}
              tooltip={open ? 'Collapse' : 'Expand'}
              class="icon-sm" />
      {/if}
    </summary>
    <section class="flex-col gap-md px-md my-md flex-fit"
             class:scrollable
             style:--icon-size="var(--tq-button-icon-size-sm)"
             style:--input-width="calc(100% - var(--icon-size))">
      <slot></slot>
    </section>
  </details>
{:else}
  <div class:card={!compact}
       class:elevated={!compact}
       class:elevated-md={!compact}
       class="tool-panel flex-col {className}">
    {#if title || icon}
      <div class="panel-header flex-row items-center px-md py-sm gap-md">
        {#if icon}
          <Icon class="icon-md" name={icon} />
        {/if}
        <h5>{title}</h5>
        <span class="flex-1" />
        <slot name="header"></slot>
      </div>
    {:else}
      <slot name="header"></slot>
    {/if}
    <section class="flex-col gap-md px-md my-md flex-fit"
             class:scrollable
             style:--icon-size="var(--tq-button-icon-size-sm)"
             style:--input-width="calc(100% - var(--icon-size))">
      <slot></slot>
    </section>
  </div>
{/if}

<style lang="scss">
  summary {
    cursor: default;
    user-select: none;
  }

  .panel-header {
    height: var(--tq-panel-header-height);

    &:not(:last-child) {
      border-bottom: 1px solid var(--tq-color-border);
    }
  }

  .card {
    user-select: none;
  }
</style>
