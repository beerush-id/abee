<script lang="ts">
  import type { NodeRectangle } from '@beerush/abee/document';
  import { InputUnit } from '@beerush/abee/core';
  import type { State } from '@beerush/anchor';

  export let rectangle: State<NodeRectangle>;
  export let unit = 'mm';

  let className = '';
  export { className as class };
</script>

{#if rectangle}
  <div class="text-xxs gap-md {className}"
       style:--icon-size="var(--tq-button-icon-size-sm)"
       style:--input-width="100%">
    <div class="flex-row items-center gap-md">
      <InputUnit class="small gap-sm" icon="width" tooltip="Width" bind:unit bind:value={$rectangle.width} />
      <InputUnit class="small gap-sm" icon="height" tooltip="Height" bind:unit bind:value={$rectangle.height} />
    </div>
    {#if $rectangle.x || $rectangle.y}
      <div class="flex-row items-center gap-md">
        {#if $rectangle.x}
          <InputUnit class="small gap-sm" label="X" tooltip="X Position" bind:unit bind:value={$rectangle.x} />
        {/if}
        {#if $rectangle.y}
          <InputUnit class="small gap-sm" label="Y" tooltip="Y Position" bind:unit bind:value={$rectangle.y} />
        {/if}
      </div>
    {/if}
  </div>
{/if}
