<script lang="ts">
  import { Tooltip } from '../utilities/index.js';

  export let size: number | void = null;
  export let color: string | void = null;
  export let tooltip: string | void = null;

  let className = '';
  export { className as class };
</script>
<i class="material-symbols-outlined {className}"
   style:--this-icon-size={size}
   style:--this-icon-color={color}>
  <slot></slot>
  {#if tooltip}
    <Tooltip text={tooltip} />
  {/if}
</i>
