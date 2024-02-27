<script lang="ts">
  import type { CanvasSettings, Document } from '../document/index.js';
  import { Icon, Tooltip } from '../core/index.js';
  import { history, persistent, type State } from '@beerush/anchor';
  import { onDestroy } from 'svelte';
  import { hotkey } from '@beerush/utils/client';

  export let doc: State<Document>;
  const settings = persistent<CanvasSettings>('main-settings', {});

  const record = history<Document>(doc);
  record.excludes = [ 'selectedNodes' ];
  const unsub = record.subscribe((d, e) => {
    console.log(d, e);
  }, false);

  onDestroy(() => {
    unsub();
  });

  $: small = $settings.smallToolButton;
</script>

<section class=" flex-row items-center gap-md"
         use:hotkey={{ keys: ['ctrl', 'shift', 'z'], handler: console.log, stopPropagation: true }}
         use:hotkey={{ keys: ['ctrl', 'z'], handler: console.log, stopPropagation: true }}>
  <a href="/" class="button icon-button" class:small>
    <Icon name="home" />
    <Tooltip text="Back to Home" />
  </a>
  <h4>{$doc.name}</h4>
  <div class="sp-x" />
  <button class="icon-button" class:small>
    <Icon name="post_add" />
    <Tooltip text="New Document" />
  </button>
  <button class="icon-button" class:small>
    <Icon name="folder_open" />
    <Tooltip text="Open Document" />
  </button>
  <button class="icon-button" class:small disabled>
    <Icon name="save" />
    <Tooltip text="Save Document" />
  </button>
  <div class="sp-x"></div>
  <button class="icon-button" class:small disabled>
    <Icon name="print" />
    <Tooltip text="Print" />
  </button>
  <button class="icon-button" class:small disabled>
    <Icon name="download" />
    <Tooltip text="Export" />
  </button>
  <!--   <div class="sp-x"></div> -->
  <!--   <button class="icon-button" class:small disabled={!$record.canUndo} -->
  <!--           on:click={() => record.undo()}> -->
  <!--     <Icon name="undo" /> -->
  <!--     <Tooltip text="Undo" /> -->
  <!--   </button> -->
  <!--   <button class="icon-button" class:small disabled={!$record.canRedo} -->
  <!--           on:click={() => record.redo()}> -->
  <!--     <Icon name="redo" /> -->
  <!--     <Tooltip text="Redo" /> -->
  <!--   </button> -->
</section>
