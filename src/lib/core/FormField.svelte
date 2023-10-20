<script lang="ts">
  import { inputfield } from '@beerush/utils/client';
  import Icon from './Icon.svelte';

  export let placeholder = '';
  export let indeterminate = false;
  export let unit = '';
  export let select = false;
  let className = '';
  export { className as class };

  $: options = { title: placeholder };
</script>

<div use:inputfield={options} class="form-field {className}" class:indeterminate>
  <slot></slot>
  {#if placeholder}
    <span class="placeholder">{placeholder}</span>
  {/if}
  {#if unit}
    <span class="input-unit">{unit}</span>
  {/if}
  {#if select}
    <Icon class="select-arrow" name="arrow_drop_down" />
  {/if}
</div>
