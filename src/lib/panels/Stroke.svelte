<script lang="ts">
  import { nodes } from '../document/index.js';
  import { onDestroy } from 'svelte';
  import { ColorHarmony, ColorPicker, FormField, Icon, InputUnit, Tab, TabButton, TabItem } from '../core/index.js';
  import { toCamelCase } from '@beerush/utils';
  import { anchor } from '@beerush/anchor';
  import { aliasToHex } from '@beerush/composer/color';

  export let name = 'stroke-color';
  export let primary = 'ff0000';
  export let value = primary;

  let style = 'none';
  let color = 'transparent';
  let width = 0;

  const { selections } = nodes;

  const corners = [ 'outer', 'left', 'top', 'right', 'bottom' ];
  const cornerStyles = anchor({
    outer: { width, style, color },
    left: { width, style, color },
    top: { width, style, color },
    right: { width, style, color },
    bottom: { width, style, color },
  });

  const unsubscribe = selections.subscribe((items) => {
    if (items.length) {
      const node = selections[0];
      console.log(node);
      const { borderColor, borderWidth, borderStyle } = node.styles;

      color = aliasToHex(borderColor) as string;
      width = borderWidth as number;
      style = borderStyle as string;

      for (const corner of corners) {
        const prop = toCamelCase(`border-${ corner.replace('outer-', '') }`);

        const styleProp = `${ prop }Style`;
        const widthProp = `${ prop }Width`;
        const colorProp = `${ prop }Color`;

        cornerStyles[corner].width = node.styles[widthProp] || width;
        cornerStyles[corner].style = node.styles[styleProp] || style;
        cornerStyles[corner].color = aliasToHex(node.styles[colorProp]) || color;
      }
    }
  });

  const input = (e: CustomEvent<string>) => {
    value = e.detail;

    for (const node of selections) {
      node.styles.borderColor = value;
    }
  };

  const applyStroke = (corner: string, value: string) => {
    if (corner.startsWith('outer')) {
      for (const node of selections) {
        const prop = toCamelCase(`border-${ corner.replace('outer-', '') }`);

        node.styles[prop] = value;

        for (const corner of corners) {
          if (corner !== 'outer') {
            for (const key of [ 'width', 'style', 'color' ]) {
              const prop = toCamelCase(`border-${ corner }-${ key }`);
              delete node.styles[prop];
            }
          }
        }
      }
    } else {
      const prop = toCamelCase(`border-${ corner }`);

      const styleProp = `${ prop }Style`;
      const widthProp = `${ prop }Width`;
      const colorProp = `${ prop }Color`;

      for (const node of selections) {
        node.styles[prop] = value;

        if (typeof node.styles[styleProp] === 'undefined') {
          node.styles[styleProp] = style;
        }

        if (typeof node.styles[widthProp] === 'undefined') {
          node.styles[widthProp] = width;
        }

        if (typeof node.styles[colorProp] === 'undefined') {
          node.styles[colorProp] = color;
        }
      }
    }
  };

  const styleChange = (corner: string, value: string) => {
    if (value === 'none') {
      applyStroke(corner + '-width', 0);
      return;
    } else if (value === 'solid') {
      cornerStyles[corner].width = 1;
    }

    applyStroke(corner + '-style', value);
  };

  const widthChange = (corner: string, value: string) => {
    applyStroke(corner + '-width', value);
  };

  const colorChange = (corner: string, value: string) => {
    applyStroke(corner + '-color', value);
  };

  onDestroy(() => {
    unsubscribe();
  });
</script>

<Tab {name} class="h-full">
  <svelte:fragment slot="header">
    <TabButton id="solid" icon="colors">Solid</TabButton>
    <TabButton id="gradient" icon="gradient">Gradient</TabButton>
  </svelte:fragment>
  <TabItem compact id="solid" class="flex-1">
    <div class="flex-col gap-xs p-md" style:--input-width="64px">
      {#each corners as corner}
        <div class="flex-row items-center gap-sm">
          <Icon name="border_{corner}" class="icon-lg" />
          <InputUnit class="small" value={$cornerStyles[corner].width}
                     on:change={(e) => widthChange(corner, e.detail.value)} />
          <FormField select class="small">
            <select value={$cornerStyles[corner].style}
                    on:change={(e) => styleChange(corner, e.target.value)}>
              <option value="none">None</option>
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
            </select>
            <Icon class="select-arrow" name="arrow_drop_down" />
          </FormField>
          <input type="color" class="flex-0" style:width="24px" value={$cornerStyles[corner].color}
                 on:change={e => colorChange(corner, e.target.value)}>
        </div>
      {/each}
    </div>
    <ColorHarmony name={name + '-harmony'} vertical bind:value bind:primary on:change={input}>
      <svelte:fragment slot="header">
        <TabButton id="picker" icon="colorize" tooltip="Color Picker" />
      </svelte:fragment>
      <TabItem id="picker">
        <ColorPicker {primary} bind:value on:input={input} on:change={input} />
      </TabItem>
    </ColorHarmony>
  </TabItem>
</Tab>
