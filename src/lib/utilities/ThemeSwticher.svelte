<script lang="ts">
  import Tooltip from './Tooltip.svelte';
  import { Icon } from '../core/index.js';

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
        on:click={toggle}
        class:light={theme === 'light'}
        class:dark={theme === 'dark'}>
  <Icon>{theme === 'system' ? 'contrast' : theme + '_mode' }</Icon>
  <Tooltip yDir="above">Toggle Theme</Tooltip>
</button>

<style>
  .icon-button.light {
    color: var(--tq-palette-orange-400);
  }

  .icon-button.dark {
    color: var(--tq-palette-white);
  }
</style>
