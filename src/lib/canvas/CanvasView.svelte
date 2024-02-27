<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { session } from '@beerush/anchor';
  import type { CanvasState, Node } from '@beerush/abee/document';
  import { NodeRect, NodeView } from '@beerush/abee/document';
  import type { Canvas } from '@beerush/abee/canvas';
  import { Ruler } from '@beerush/abee/canvas';
  import { onDestroy, onMount } from 'svelte';
  import { createRuler } from '@beerush/utils';
  import { getPointerPosition, NODE_ELEMENTS, nodes, StorageKeys } from '../document/index.js';
  import { hotkey, style } from '@beerush/utils/client';
  import type { CanvasPointer } from '../document/Pointer.js';
  import type { PointerChange, PortalOptions } from '@beerush/composer';
  import { createPointer, createWheel, PointerChangeType, portal, WheelChangeType } from '@beerush/composer';
  import { type Writable, writable } from 'svelte/store';

  export let canvas: State<Canvas>;
  export let ruler = createRuler();

  const { mm } = ruler;
  const { viewport, document: page, settings } = canvas.state as State<CanvasState>;
  const cursor = session<CanvasPointer>(StorageKeys.POINTER, {} as never);
  const { selections } = nodes;

  let drawerElement: HTMLElement;
  let boardElement: HTMLElement;
  let selectMark: Writable<{
    left: number,
    top: number,
    width: number,
    height: number
  } | null> = writable(null);

  let node: State<Node>;
  let rect: State<NodeRect>;
  let selecting = false;

  const clearSelection = (e: MouseEvent) => {
    if (selecting) {
      selecting = false;
      return;
    }

    if (e.button !== 0) return;

    if (e.target === viewport.element || e.target === boardElement) {
      if (nodes.selections.length) {
        nodes.deselectAll();
      }
    } else {
      const n = NODE_ELEMENTS.get(e.target as HTMLElement);
      if (!n) return;

      if (e.shiftKey) {
        nodes.toggleSelect(n, true);
      } else {
        nodes.select(n, false);
      }
    }
  };

  const acceptDrag = (e: DragEvent) => {
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = e.dataTransfer.items.length ? 'copy' : 'move';
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();

    if (e.dataTransfer?.files.length) {
      const { x, y } = getPointerPosition(e, viewport.element as never, viewport.scale);
      nodes.import(e.dataTransfer.files, x, y, page.dpi);
    }
  };

  const drawPointer = (e: PointerChange) => {
    const { clientLeft: left, clientTop: top, clientWidth: width, clientHeight: height, deltaX } = e.detail;

    if (canvas.cursorMode === 'select') {
      selectMark.set({ left, top, width, height });

      if (deltaX < 0) {
        nodes.selectTouchingBound(cursor);
      } else {
        nodes.selectBound(cursor);
      }

      selecting = true;
    } else {
      node?.styles.set({ left, top, width, height });
    }
  };
  const clearPointer = (e: PointerChange) => {
    e.stopPropagation();
    e.preventDefault();

    selectMark.set(null);

    if (node && rect) {
      node.styles.set({ ...rect });
      node = null;
      rect = null;
    }
  };
  const moveNode = (e: PointerChange) => {
    if (rect && node) {
      rect.set({
        left: (node.styles.left || 0) + e.deltaX,
        top: (node.styles.top || 0) + e.deltaY,
      });
    }
  };

  let dragStartX = 0;
  let dragStartY = 0;

  let deltaScale = viewport.scale;
  let deltaElement = viewport.element;

  const leaveViewport = viewport.subscribe(() => {
    if (deltaScale !== viewport.scale) {
      deltaScale = viewport.scale;
      pointer.update({ deltaScale, deltaZoom: deltaScale });
    }

    if (viewport.element !== deltaElement) {
      deltaElement = viewport.element;
      pointer.update({ relative: viewport.element });
    }
  });

  const pointer = createPointer({
    name: 'canvas',
    deltaScale,
    deltaZoom: deltaScale,
    scaleClients: true,
  });

  pointer.on(PointerChangeType.DrawStart, e => {
    if (e.detail.target !== boardElement) {
      node = NODE_ELEMENTS.get(e.detail.target);
      rect = nodes.rects.get(node as never);
      return;
    }

    if (canvas.cursorMode !== 'select') {
      node = nodes.create(canvas.cursorMode as never);
    }
  });
  pointer.on(PointerChangeType.DrawEnd, e => {
    clearPointer(e);
  });
  pointer.on(PointerChangeType.Move, e => {
    if (e.isMoving) {
      cursor.set({
        x: e.clientX,
        y: e.clientY,
        sx: e.startX,
        sy: e.startY,
        mw: e.clientWidth,
        mh: e.clientHeight,
      });
    }

    if (e.isDrawing) {
      if (e.detail.target === boardElement) {
        drawPointer(e);
      } else {
        moveNode(e);
      }
    }

    if (e.isDragging) {
      viewport.set({
        x: dragStartX + e.deltaX,
        y: dragStartY + e.deltaY,
      });
    }
  });
  pointer.on(PointerChangeType.DragStart, e => {
    dragStartX = viewport.x;
    dragStartY = viewport.y;
  });

  const wheel = createWheel();
  let scaleStart = 1;
  wheel.subscribe(e => {
    if (e.type === WheelChangeType.PinchStart) {
      scaleStart = viewport.scale;
    } else if (e.type === WheelChangeType.Pinch) {
      viewport.set({
        scale: scaleStart + e.detail,
      });
    } else if (e.type === WheelChangeType.ZoomIn || e.type === WheelChangeType.ZoomOut) {
      canvas.zoomBy(e.type === WheelChangeType.ZoomIn ? 0.05 : -0.05);
    } else if (e.type === WheelChangeType.MoveUp || e.type === WheelChangeType.MoveDown) {
      viewport.set({
        y: e.type === WheelChangeType.MoveUp ? viewport.y - e.detail : viewport.y + e.detail,
      });
    } else if (e.type === WheelChangeType.MoveLeft || e.type === WheelChangeType.MoveRight) {
      viewport.set({
        x: e.type === WheelChangeType.MoveLeft ? viewport.x - e.detail : viewport.x + e.detail,
      });
    }
  });

  const selectAll = (e: KeyboardEvent) => {
    nodes.selectAll();
  };

  onMount(() => {
    canvas.setViewport(viewport.element as never, drawerElement);
  });

  onDestroy(() => {
    leaveViewport();

    pointer.destroy();
    wheel.destroy();
    nodes.deselectAll();

    canvas.leave();
  });

  const portalOptions: PortalOptions = {
    target: '.canvas-frame',
    anchor: true,
    change: () => {
      canvas.zoomFit();
    },
  };
</script>

<div class="canvas">
  {#if $settings.showRulers}
    <div class="ruler-h top">
      <Ruler maxLength={$viewport.boardSize}
             length={$page.width}
             scale={$viewport.scale}
             move={$viewport.x}
             unit={$viewport.unit}
             dpi="{$viewport.dpi}"
             guideX={$cursor.x} />
    </div>
    <div class="ruler-v left">
      <Ruler vertical maxLength={$viewport.boardSize}
             length={$page.height}
             scale={$viewport.scale}
             move={$viewport.y}
             unit={$viewport.unit}
             dpi={$viewport.dpi}
             guideY={$cursor.y} />
    </div>
  {/if}
  <div bind:this={drawerElement} class="canvas-drawer"
       use:portal={portalOptions}>
    <div class="canvas-board" role="button" tabindex="-1"
         bind:this={boardElement}
         use:pointer.capture
         use:wheel.capture
         use:hotkey={{ keys: ['ctrl', 'a'], handler: selectAll, stopPropagation: true, preventDefault: true }}
         on:mouseup={clearSelection}
         on:dragenter|preventDefault={acceptDrag}
         on:dragover|preventDefault={acceptDrag}
         on:drop={onDrop}
         style:--canvas-cursor={$canvas.cursor}
         style:--board-size="{mm($viewport.boardSize||5000).at($viewport.dpi).pxs}"
         style:--view-x="{$viewport.x}px"
         style:--view-y="{$viewport.y}px"
         style:--view-scale={$viewport.scale}>
      <div role="button" tabindex="-1" class="canvas-viewport"
           bind:this={viewport.element}
           style:--guide-top="{$page.settings.marginTop}mm"
           style:--guide-right="{$page.settings.marginRight}mm"
           style:--guide-bottom="{$page.settings.marginBottom}mm"
           style:--guide-left="{$page.settings.marginLeft}mm"
           style:--row-gap="{mm($page.settings.rowGap||0).at($viewport.dpi).pxs}"
           style:--column-gap="{mm($page.settings.columnGap||0).at($viewport.dpi).pxs}"
           style:--margin-left="{mm($page.settings.marginLeft).at($viewport.dpi).pxs}"
           style:--margin-right="{mm($page.settings.marginRight).at($viewport.dpi).pxs}"
           style:--margin-top="{mm($page.settings.marginTop).at($viewport.dpi).pxs}"
           style:--margin-bottom="{mm($page.settings.marginBottom).at($viewport.dpi).pxs}"
           style:--page-width="{mm($page.width).at($viewport.dpi).pxs}"
           style:--page-height="{mm($page.height).at($viewport.dpi).pxs}">
        <div class="canvas-guide guide-top"></div>
        <div class="canvas-guide guide-right"></div>
        <div class="canvas-guide guide-bottom"></div>
        <div class="canvas-guide guide-left"></div>
        {#each $page.nodes as node (node.id)}
          <NodeView interactive {node} editable={$canvas.cursorMode !== 'select'} />
        {/each}
        {#if $node}
          <div class="node-view"
               use:style={{ styles: $node.styles }}
               style:pointer-events="none"
               style:position="absolute" />
        {/if}
        {#if $selections.length && $canvas.cursorMode === 'select'}
          <NodeRect scale={$viewport.scale} />
        {/if}
        {#if $selectMark}
          <div class="node-view select" use:style={{ styles: $selectMark }}></div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .ruler-h {
    width: 100%;
    position: absolute;
    left: 0;
    height: 32px;
    overflow: hidden;
    box-shadow: 0 0 12px var(--tq-shadow-color-dark);
    z-index: 2;

    &.top {
      top: 0;
    }

    &.bottom {
      bottom: 0;
    }
  }

  .ruler-v {
    height: 100%;
    position: absolute;
    top: 0;
    width: 32px;
    overflow: hidden;
    box-shadow: 0 0 12px var(--tq-shadow-color-dark);
    z-index: 1;

    &.left {
      left: 0;
    }

    &.right {
      right: 0;
    }
  }

  .canvas {
    --ruler-translate: 0px;
    padding: 20mm;
    user-select: none;
  }

  .canvas-drawer {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    -webkit-backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    backface-visibility: hidden;
    padding: 64px;
    border-radius: 7px;
  }

  .canvas-board {
    //background: var(--tq-color-background-tint);
    background-image: radial-gradient(circle, rgba(0, 0, 0, .1) 1.5px, rgba(0, 0, 0, 0) 1.5px);
    background-size: 16px 16px;
    background-repeat: repeat;
    cursor: var(--canvas-cursor);
    width: var(--board-size);
    height: var(--board-size);
    position: absolute;
    top: calc((50% - (var(--board-size) / 2)) + var(--view-y) / var(--view-scale));
    left: calc((50% - (var(--board-size) / 2)) + var(--view-x) / var(--view-scale));
    display: flex;
    align-items: center;
    justify-content: center;
    zoom: var(--view-scale);
    //transform: scale3d(var(--view-scale), var(--view-scale), 1) translateZ(0);
    -webkit-backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    backface-visibility: hidden;
  }

  .canvas-viewport {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    row-gap: var(--row-gap);
    column-gap: var(--column-gap);
    width: var(--page-width);
    height: var(--page-height);
    padding: var(--margin-top) var(--margin-right) var(--margin-bottom) var(--margin-left);
    cursor: var(--canvas-cursor);
    color: black;
    background: white;
    outline: 1px solid black;
    //transform: translate3d(var(--canvas-x), var(--canvas-y), 0) scale3d(var(--canvas-scale), var(--canvas-scale), 1);
    position: relative;
    pointer-events: none;
    -webkit-backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;
    backface-visibility: hidden;
  }

  .node-view.select {
    border: 1px dashed blue;
    opacity: 0.5;
    position: absolute;
  }
</style>
