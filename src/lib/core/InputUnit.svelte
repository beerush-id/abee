<script lang="ts">
  import FormField from './FormField.svelte';
  import Icon from './Icon.svelte';
  import Tooltip from './Tooltip.svelte';
  import { ruler as defaultRuler, type Unit } from '@beerush/utils';
  import { createEventDispatcher } from 'svelte';

  export let id = '';
  export let name = '';
  export let unit: Unit = 'px';
  export let value: string | number = 0;
  export let icon = '';
  export let label = '';
  export let tooltip = '';
  export let placeholder = '';
  export let indeterminate = false;
  export let required = false;
  export let disabled = false;
  export let ruler = defaultRuler;

  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher<{
    change: { value: number, unit: Unit, name: string, id: string }
  }>();

  let element: HTMLInputElement;
  $: units = ruler.of(parseFloat(value as string) || 0);

  const blur = (e: FocusEvent) => {
    const { value: n } = e.target as HTMLInputElement;
    if (n === value) return;

    const v = calculate(n);

    if (v !== value) {
      value = v;
      dispatch('change', { value, unit, name, id });
    }
  };
  const keydown = (e: KeyboardEvent) => {
    if ([ 'Enter', 'ArrowUp', 'ArrowDown' ].includes(e.key)) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (e.key === 'Enter') {
      const { value: n } = e.target as HTMLInputElement;
      if (n === value) return;

      const v = calculate(n);

      if (v !== value) {
        value = v;
        dispatch('change', { value, unit, name, id });
      }
    } else if (e.key === 'ArrowUp') {
      const n = (value as number) + (e.ctrlKey ? 0.1 : e.shiftKey ? 5 : 1);
      value = ruler[unit](n)[ruler.unit];
      dispatch('change', { value, unit, name, id });
    } else if (e.key === 'ArrowDown') {
      const n = (value as number) - (e.ctrlKey ? 0.1 : e.shiftKey ? 5 : 1);
      value = ruler[unit](n)[ruler.unit];
      dispatch('change', { value, unit, name, id });
    }
  };
  const calculate = (v: number | string) => {
    const [ , n, o, f ] = typeof v === 'string'
                          ? v.replace(/\s+/g, '').match(/([\w.]+)([+\-*/]+)([\w.]+)/) || [ v, v ]
                          : [ v, v ];

    if (o && f) {
      const a = parseFloat(n as string);
      const b = parseFloat(f as string);
      const e = eval(`${ a }${ o }${ b }`);
      return ruler[unit](e)[ruler.unit];
    } else {
      return ruler[unit](parseFloat(n as string))[ruler.unit];
    }
  };
</script>

<FormField class={className} {indeterminate}>
  {#if icon}
    <Icon name={icon} />
  {/if}
  {#if label}
    <span class="input-icon">{label}</span>
  {/if}
  <input {name} {required} {disabled}
         type="text"
         value={units[unit]}
         bind:this={element}
         on:blur={blur}
         on:mouseup={blur}
         on:keydown={keydown}>
  {#if placeholder}
    <div class="placeholder">{placeholder}</div>
  {/if}
  <span class="input-unit">{unit}</span>
  {#if tooltip && !disabled}
    <Tooltip xDir="left" text={tooltip} bounding={element} />
  {/if}
</FormField>
