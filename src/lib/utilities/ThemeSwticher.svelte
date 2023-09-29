<script lang="ts">
  import { Icon, Tooltip } from '@beerush/abee/core';

  const { Toqin } = window;

  export let small = false;
  export let xDir = 'after';
  export let yDir = 'between';
  let theme = Toqin.getTheme();

  const toggle = () => {
    theme = Toqin.getTheme();

    if (theme === 'system') {
      theme = 'light';
    } else if (theme === 'light') {
      theme = 'dark';
    } else {
      theme = 'system';
    }

    Toqin.setTheme(theme);
  };
</script>

<button type="button"
        class="icon-button"
        class:small
        on:click={toggle}
        class:light={theme === 'light'}
        class:dark={theme === 'dark'}>
  <Icon>{theme === 'system' ? 'contrast' : theme + '_mode' }</Icon>
  <Tooltip {xDir} {yDir}>Toggle Theme</Tooltip>
</button>

<style>
  .icon-button.light {
    color: var(--tq-palette-orange-400);
  }

  .icon-button.dark {
    color: var(--tq-palette-white);
  }
</style>
