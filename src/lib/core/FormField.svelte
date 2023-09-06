<script lang="ts">
  import { inputfield } from '@beerush/utils/client';

  export let placeholder = 'placeholder';
</script>

<div use:inputfield={{title:placeholder}} class="form-field">
  <slot></slot>
  {#if placeholder}
    <div class="placeholder">{placeholder}</div>
  {/if}
</div>
