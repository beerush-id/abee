<script lang="ts">
  import { nodes } from './Node.js';
  import type { DragOptions, MoveBound } from './Pointer.js';
  import { doubleclick } from './Pointer.js';
  import { Menu } from '../core/index.js';
  import { createMenu, type DragChange, draggable, MenuTpl, style } from '@beerush/composer';

  export let scale: number;
  const { selections } = nodes;
  const offset = 10;

  let resizeX: MoveBound | void;
  let resizeY: MoveBound | void;
  let dragging = false;

  const dragMove = (e: DragChange) => {
    e.stopPropagation();
    e.preventDefault();

    if (!dragging) {
      dragging = true;
    }

    if (resizeX && resizeY) {
      nodes.resize(e, resizeX, resizeY);
    } else {
      nodes.move(e);
    }

    styles = nodes.getBoundingRects($selections, offset);
  };
  const dragEnd = (e: DragChange) => {
    e.stopPropagation();
    e.preventDefault();

    nodes.applyRect();

    resizeX = undefined;
    resizeY = undefined;
    dragging = false;
  };

  const setResizePoint = (x: MoveBound, y: MoveBound) => {
    resizeX = x;
    resizeY = y;
  };

  const unsetResizeMode = () => {
    resizeX = undefined;
    resizeY = undefined;
  };

  const remove = (e: KeyboardEvent) => {
    if (e.key === 'Delete') {
      console.log(selections);
    }
  };

  $: dragOptions = { deltaScale: scale } satisfies DragOptions;
  $: styles = nodes.getBoundingRects($selections, offset);

  const menu = createMenu();
</script>

<node-rect class="node-rect"
           role="button"
           tabindex="-1"
           class:dragging
           class:resize={resizeX || resizeY}
           use:menu.trigger={MenuTpl.Context}
           use:draggable={dragOptions}
           use:doubleclick
           use:style={ styles }
           on:drag-move={dragMove}
           on:drag-end={dragEnd}
           on:keyup={remove}>
  <button class="reset node-transform top-left"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('start', 'start')}>
    <span class="node-rotate"></span>
  </button>
  <button class="reset node-transform top-right"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('end', 'start')}>
    <span class="node-rotate"></span>
  </button>
  <button class="reset node-transform bottom-left"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('start', 'end')}>
    <span class="node-rotate"></span>
  </button>
  <button class="reset node-transform bottom-right"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('end', 'end')}>
    <span class="node-rotate"></span>
  </button>

  <button class="reset node-transform top-center"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('center', 'start')}></button>
  <button class="reset node-transform right-center"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('end', 'center')}></button>
  <button class="reset node-transform left-center"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('start', 'center')}></button>
  <button class="reset node-transform bottom-center"
          on:mouseup={unsetResizeMode}
          on:mousedown={() => setResizePoint('center', 'end')}></button>
</node-rect>
<Menu {menu} items={nodes.createContextMenus($selections)} />

<style lang="scss">
  .node-rect {
    --modifier-size: 10px;
    position: absolute;
    //outline: 1px dashed blue;
    opacity: 0.5;
    pointer-events: all;
    cursor: default;

    &.resize {
      .node-transform {
        background: transparent;

        &.top-left {
          outline: none;
          border-top: 1px solid blue;
          border-left: 1px solid blue;
        }

        &.top-right {
          outline: none;
          border-top: 1px solid blue;
          border-right: 1px solid blue;
        }

        &.bottom-left {
          outline: none;
          border-bottom: 1px solid blue;
          border-left: 1px solid blue;
        }

        &.bottom-right {
          outline: none;
          border-bottom: 1px solid blue;
          border-right: 1px solid blue;
        }

        &.top-center {
          outline: none;
          border-top: 1px solid blue;
        }

        &.bottom-center {
          outline: none;
          border-bottom: 1px solid blue;
        }

        &.left-center {
          outline: none;
          border-left: 1px solid blue;
        }

        &.right-center {
          outline: none;
          border-right: 1px solid blue;
        }
      }

      .node-rotate {
        opacity: 0;
        visibility: hidden;
      }
    }

    &:before {
      content: "";
      display: block;
      width: var(--modifier-size);
      height: var(--modifier-size);
      position: absolute;
      background: rgba(0, 0, 255, 0.3);
      outline: 1px solid blue;
      top: 50%;
      left: 50%;
      margin-top: calc((var(--modifier-size) / 2) * -1);
      margin-left: calc((var(--modifier-size) / 2) * -1);
    }

    &.dragging {
      opacity: 0;
    }
  }

  .node-transform, .node-rotate {
    width: var(--modifier-size);
    height: var(--modifier-size);
    position: absolute;
    pointer-events: all;
    transition: all .1s ease-in-out;
  }

  .node-rotate {
    cursor: pointer;
  }

  .node-transform {
    background: rgba(0, 0, 255, 0.3);
    outline: 1px solid blue;

    &.top-left {
      top: calc((var(--modifier-size) / 2) * -1);
      left: calc((var(--modifier-size) / 2) * -1);
      cursor: nwse-resize;

      .node-rotate {
        top: calc(var(--modifier-size) * -1);
        left: calc(var(--modifier-size) * -1);
        border-top-left-radius: 10px;
        border-top: 2px solid blue;
        border-left: 2px solid blue;
      }
    }

    &.top-right {
      top: calc((var(--modifier-size) / 2) * -1);
      right: calc((var(--modifier-size) / 2) * -1);
      cursor: nesw-resize;

      .node-rotate {
        top: calc(var(--modifier-size) * -1);
        right: calc(var(--modifier-size) * -1);
        border-top-right-radius: 10px;
        border-top: 2px solid blue;
        border-right: 2px solid blue;
      }
    }

    &.bottom-left {
      bottom: calc((var(--modifier-size) / 2) * -1);
      left: calc((var(--modifier-size) / 2) * -1);
      cursor: nesw-resize;

      .node-rotate {
        bottom: calc(var(--modifier-size) * -1);
        left: calc(var(--modifier-size) * -1);
        border-bottom-left-radius: 10px;
        border-bottom: 2px solid blue;
        border-left: 2px solid blue;
      }
    }

    &.bottom-right {
      bottom: calc((var(--modifier-size) / 2) * -1);
      right: calc((var(--modifier-size) / 2) * -1);
      cursor: nwse-resize;

      .node-rotate {
        bottom: calc(var(--modifier-size) * -1);
        right: calc(var(--modifier-size) * -1);
        border-bottom-right-radius: 10px;
        border-bottom: 2px solid blue;
        border-right: 2px solid blue;
      }
    }

    &.top-center {
      top: calc((var(--modifier-size) / 2) * -1);
      left: 50%;
      margin-left: calc((var(--modifier-size) / 2) * -1);
      cursor: ns-resize;
    }

    &.bottom-center {
      bottom: calc((var(--modifier-size) / 2) * -1);
      left: 50%;
      margin-left: calc((var(--modifier-size) / 2) * -1);
      cursor: ns-resize;
    }

    &.left-center {
      top: 50%;
      left: calc((var(--modifier-size) / 2) * -1);
      margin-top: calc((var(--modifier-size) / 2) * -1);
      cursor: ew-resize;
    }

    &.right-center {
      top: 50%;
      right: calc((var(--modifier-size) / 2) * -1);
      margin-top: calc((var(--modifier-size) / 2) * -1);
      cursor: ew-resize;
    }
  }
</style>
