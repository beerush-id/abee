<script lang="ts">
  import type { ColorPicker } from '../document/index.js';
  import { nodes, StorageKeys } from '../document/index.js';
  import { session } from '@beerush/anchor';
  import { Tooltip } from '../core/index.js';

  const picker = session<ColorPicker>(StorageKeys.COLOR_PICKER, {} as never);
  const { selections } = nodes;

  const apply = (e: MouseEvent, color: string) => {
    if (e.button === 0) {
      for (const node of selections) {
        node.styles.backgroundColor = color;
      }

      picker.recentFill = color;
    } else if (e.button === 2) {
      for (const node of selections) {
        node.styles.borderColor = color;
      }

      picker.recentStroke = color;
    }
  };
</script>

<div role="button" tabindex="-1" class="color-palette flex-row items-center" on:contextmenu={e => e.preventDefault()}>
  <button class="reset color-view"
          style:background={$picker.recentFill}
          style:border="1px solid {$picker.recentStroke}"></button>
  <div class="sp-x"></div>
  <div role="button"
       tabindex="-1"
       class="color-view transparent"
       on:mouseup={e => apply(e, 'transparent')}>
    <Tooltip text="Transparent" xDir="between" yDir="above" />
  </div>
  {#each $picker.colors as color}
    {#if color}
      <div role="button"
           tabindex="-1"
           class="color-view"
           style:background={color}
           on:mouseup={e => apply(e, color)}>
        <Tooltip text={color} xDir="between" yDir="above" />
      </div>
    {/if}
  {/each}
</div>

<style lang="scss">
  .color-palette {
    --color-view-size: 18px;
    cursor: default;
    user-select: none;
  }

  .color-view {
    width: var(--color-view-size);
    aspect-ratio: 1/1;
    cursor: default;
    user-select: none;
    transition: var(--tq-transition-fast);
    transform: scale(1);
    position: relative;
    z-index: 0;
    border: 1px solid var(--tq-color-background);

    &:hover {
      transform: scale(1.5) translateZ(0);
      z-index: 1;
      border-radius: 2px;
    }

    &.transparent {
      position: relative;
      background-color: white;

      &:before {
        content: "";
        width: calc(100% + 4px);
        height: 0;
        border-bottom: 1px solid red;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
      }
    }
  }
</style>
