<script lang="ts">
  import type { MenuButton, MenuItemData } from './Menu.js';
  import type { MenuOptions, MenuState } from '@beerush/composer';
  import { MenuType } from '@beerush/composer';
  import MenuItem from './MenuItem.svelte';

  export let menu: MenuState;
  export let type: MenuType = MenuType.DROPDOWN;
  export let backdrop = true;
  export let items: MenuItemData[] = [];

  const action = (item: MenuItemData) => {
    return (element: HTMLElement) => {
      return menu.item(element, item) as never;
    };
  };

  const select = (e: CustomEvent<MenuButton>) => {
    if (e.detail.action) {
      e.detail.action(e as never);
    }
  };

  $: options = { type, backdrop } as MenuOptions;
</script>

<section role="menu" tabindex="0" class="menu fade-in"
         use:menu.menu={options}
         on:menu-select={select}>
  {#if items.length}
    {#each items as item}
      {#if item.type === 'separator'}
        <div class="menu-separator"></div>
      {:else if item.type === 'button'}
        <MenuItem item={action(item)}
                  type={item.type}
                  text={item.text}
                  icon={item.icon}
                  keys={item.keys}
                  disabled={item.disabled} />
      {:else if item.type === 'link'}
        <MenuItem item={action(item)}
                  type={item.type}
                  text={item.text}
                  icon={item.icon}
                  href={item.href}
                  keys={item.keys}
                  disabled={item.disabled} />
      {/if}
    {/each}
  {:else}
    <slot></slot>
  {/if}
</section>
