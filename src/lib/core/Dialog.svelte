<script lang="ts">
  import { createDialog, type PopupInstance } from '@beerush/utils/client';
  import { onDestroy, onMount } from 'svelte';
  import { session } from '@beerush/anchor';

  let dialog: PopupInstance;
  let overlay: HTMLElement;
  let element: HTMLElement;
  let className = '';

  export let title = '';
  export let name = '';
  export let autofocus = false;

  const state = session(`dialog://${ name || 'global' }`, {
    open: false,
  });

  export { className as class };

  export const show = (cb?: () => void) => {
    dialog.show(undefined, cb);
    state.open = true;
    focus();
  };

  export const hide = () => {
    dialog.hide();
    state.open = false;
  };

  export const focus = () => {
    if (autofocus) {
      const focusable = element.querySelector('input, button, select, textarea, [tabindex]');

      if (focusable) {
        (focusable as HTMLElement).focus();
      }
    }
  };

  const onClose = () => {
    state.open = false;
  };

  onMount(() => {
    dialog = createDialog(element as HTMLDialogElement, { container: '.popup-container', overlay });

    if (state.open) {
      dialog.show();
    }
  });

  onDestroy(() => {
    dialog.destroy();
  });
</script>

<div role="button"
     tabindex="-1"
     bind:this={overlay}
     class="dialog-overlay fade-in"
     on:click={hide}
     on:keypress={hide}></div>
<section bind:this={element} class="dialog card elevated fade-in {className}" on:close={onClose}>
  <header class="card-header">
    {#if title}
      <h3>{title}</h3>
    {/if}
    <span class="flex-1"></span>
  </header>
  <main class="card-content">
    <slot name="content"></slot>
  </main>
  <footer class="card-footer">
    <slot name="footer"></slot>
  </footer>
  <slot></slot>
</section>
