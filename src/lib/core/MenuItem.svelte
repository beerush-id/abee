<script lang="ts">
  import Icon from './Icon.svelte';
  import type { MenuItemType } from './Menu.js';

  export let type: MenuItemType = 'button';
  export let icon = '';
  export let text = '';
  export let href = '';
  export let keys: string[] = [];
  export let disabled = false;

  export let item = (element: HTMLElement) => {
    return {
      update: () => null,
      destroy: () => null,
    };
  };

  let className = '';
  export { className as class };
</script>

{#if type === 'button'}
  <button use:item class="reset menu-item {className}" disabled={disabled} {...$$restProps}>
    {#if icon}
      <Icon class="icon-lg" name={icon} />
    {/if}
    <span>{text}</span>
    {#if keys}
      <span class="flex-1"></span>
      <span class="menu-item-keys">{keys.join('+')}</span>
    {/if}
  </button>
{:else if type === 'link'}
  <a use:item href={href} class="menu-item {className}" class:disabled={disabled} {...$$restProps}>
    {#if icon}
      <Icon class="icon-lg" name={icon} />
    {/if}
    <span>{text}</span>
    {#if keys}
      <span class="flex-1"></span>
      <span class="menu-item-keys">{keys.join('+')}</span>
    {/if}
  </a>
{:else if type === 'separator'}
  <span class="menu-separator"></span>
{/if}
