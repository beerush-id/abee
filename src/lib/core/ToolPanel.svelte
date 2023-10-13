<script lang="ts">
  import Icon from './Icon.svelte';

  export let title = 'Panel';
  export let icon = '';
  export let open = true;
  export let scrollable = false;
  export let collapsible = true;

  let className = '';
  export { className as class };
</script>

{#if collapsible}
  <details class="flex-col card elevated elevated-md {className}" bind:open>
    <summary class="flex-row items-center p-md pb-0 gap-md">
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
  <div class="flex-col card elevated elevated-md {className}">
    <div class="flex-row items-center p-md pb-0 gap-md">
      {#if icon}
        <Icon class="icon-md" name={icon} />
      {/if}
      <h5>{title}</h5>
      <span class="flex-1" />
      <slot name="header"></slot>
    </div>
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
</style>
