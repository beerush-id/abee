<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { session } from '@beerush/anchor';
  import type { CanvasState, Node } from '@beerush/abee/document';
  import { NodeRect, NodeView } from '@beerush/abee/document';
  import type { Canvas } from '@beerush/abee/canvas';
  import { Ruler } from '@beerush/abee/canvas';
  import { onDestroy, onMount } from 'svelte';
  import { createRuler } from '@beerush/utils';
  import {
    type CustomDragEvent,
    type CustomWheelEvent,
    getPointerPosition,
    NODE_ELEMENTS,
    nodes,
    StorageKeys,
  } from '../document/index.js';
  import { hotkey, style } from '@beerush/utils/client';
  import type { CanvasPointer, PointerEvent } from '../document/Pointer.js';
  import { drag, pointer, wheel } from '../document/Pointer.js';

  export let canvas: State<Canvas>;
  export let ruler = createRuler();

  const { mm, px } = ruler;
  const { viewport, document: page, settings } = canvas.state as State<CanvasState>;
  const cursor = session<CanvasPointer>(StorageKeys.POINTER, {} as never);
  const { selections } = nodes;

  let canvasElement: HTMLElement;
  let boardElement: HTMLElement;
  let drawing = false;
  let selecting = false;
  let selectMark: {
    left: number,
    top: number,
    width: number,
    height: number
  } | null = null;
  let node: State<Node>;

  onMount(() => {
    canvas.setViewport(viewport.element as never, canvasElement, boardElement, true);
  });

  onDestroy(() => {
    canvas.leave();
    nodes.deselectAll();
  });

  const pointerStart = (e: PointerEvent) => {
    if ((e.detail.e.target !== boardElement) && (e.detail.e.target !== viewport.element)) return;
    drawing = canvas.cursorMode !== 'select';
    selecting = canvas.cursorMode === 'select';
  };

  const pointerMove = (e: PointerEvent) => {
    if (!drawing && !selecting) return;

    const { sx, sy, mw, mh } = e.detail;

    if (drawing) {
      if (!node) {
        // node = anchor(createNode(ELEMENT_MAP[canvas.cursorMode as never], canvas.cursorMode as never));
        node = nodes.create(canvas.cursorMode as never);
      }

      node?.styles.set({
        left: mw < 0 ? sx + mw : sx,
        top: mh < 0 ? sy + mh : sy,
        width: Math.abs(mw),
        height: Math.abs(mh),
      });
    } else if (selecting) {
      selectMark = {
        left: mw < 0 ? sx + mw : sx,
        top: mh < 0 ? sy + mh : sy,
        width: Math.abs(mw),
        height: Math.abs(mh),
      };

      if (mw <= 0) {
        nodes.selectTouchingBound(cursor);
      }
    }
  };

  const pointerEnd = (e: PointerEvent) => {
    if (drawing || selecting) {
      e.detail.e.preventDefault();
      e.detail.e.stopImmediatePropagation();

      if (node) {
        node = null as never;
      }

      if (selecting && cursor.mw >= 0) {
        nodes.selectBound(cursor);
      }

      drawing = false;
      selecting = false;
      selectMark = null;
    }
  };

  const clearSelection = (e: MouseEvent) => {
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

    console.log(e);

    if (e.dataTransfer?.files.length) {
      const { x, y } = getPointerPosition(e, viewport.element as never, viewport.scale);
      nodes.import(e.dataTransfer.files, x, y, page.dpi);
    }
  };

  let dragStartX = 0;
  let dragStartY = 0;

  const dragStart = () => {
    dragStartX = viewport.x;
    dragStartY = viewport.y;
  };

  const dragMove = (e: CustomDragEvent) => {
    viewport.set({
      x: dragStartX + e.detail.x,
      y: dragStartY + e.detail.y,
    });
  };

  const selectAll = (e: KeyboardEvent) => {
    nodes.selectAll();
  };

  const onWheel = (e: CustomWheelEvent) => {
    if (e.type === 'zoom:in' || e.type === 'zoom:out') {
      e.type === 'zoom:in' ? canvas.zoomIn() : canvas.zoomOut();
    } else if (e.type === 'move:up' || e.type === 'move:down') {
      viewport.set({
        y: e.type === 'move:up' ? viewport.y - e.detail : viewport.y + e.detail,
      });
    } else if (e.type === 'move:left' || e.type === 'move:right') {
      viewport.set({
        x: e.type === 'move:left' ? viewport.x - e.detail : viewport.x + e.detail,
      });
    }
  };

  let deltaScale = viewport.scale;
  const unsubViewport = viewport.subscribe(() => {
    if (viewport.scale !== deltaScale) {
      deltaScale = viewport.scale;
    }
  });

  onDestroy(() => {
    unsubViewport();
  });
</script>

<div class="canvas" bind:this={canvasElement}>
  {#if $settings.showRulers}
    <div class="ruler-corner"></div>
    <div class="ruler-h">
      <Ruler maxLength={$viewport.boardSize}
             length={$page.width}
             scale={$viewport.scale}
             move={$viewport.x}
             unit={$viewport.unit}
             dpi="{$viewport.dpi}"
             guideX={$cursor.x} />
    </div>
    <div class="ruler-v">
      <Ruler vertical maxLength={$viewport.boardSize}
             length={$page.height}
             scale={$viewport.scale}
             move={$viewport.y}
             unit={$viewport.unit}
             dpi={$viewport.dpi}
             guideY={$cursor.y} />
    </div>
  {/if}
  <canvs-board class="canvas-board" role="button" tabindex="-1"
               bind:this={boardElement}
               use:drag={{ button: 1, deltaZoom: viewport.scale }}
               use:wheel
               use:pointer={{ relative: viewport.element }}
               use:hotkey={{ keys: ['ctrl', 'a'], handler: selectAll, stopPropagation: true, preventDefault: true }}
               on:mouseup={clearSelection}
               on:drag:start={dragStart}
               on:drag:move={dragMove}
               on:pointer:start={pointerStart}
               on:pointer:move={pointerMove}
               on:zoom:in={onWheel}
               on:zoom:out={onWheel}
               on:move:up={onWheel}
               on:move:down={onWheel}
               on:move:left={onWheel}
               on:move:right={onWheel}
               on:pointer:end={pointerEnd}
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
      {#if selectMark}
        <div class="node-view select" use:style={{ styles: selectMark }}></div>
      {/if}
    </div>
  </canvs-board>
</div>

<style lang="scss">
  .ruler-h {
    width: calc(100% - 32px);
    position: absolute;
    top: 0;
    left: 32px;
    height: 32px;
    overflow: hidden;
    box-shadow: 0 0 12px var(--tq-shadow-color-dark);
    z-index: 1;
  }

  .ruler-v {
    height: calc(100% - 32px);
    position: absolute;
    top: 32px;
    left: 0;
    width: 32px;
    overflow: hidden;
    box-shadow: 0 0 12px var(--tq-shadow-color-dark);
    z-index: 1;
  }

  .ruler-corner {
    width: 32px;
    height: 32px;
    backdrop-filter: blur(32px);
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    border-bottom-right-radius: 5px;
  }

  .canvas {
    --ruler-translate: 16px;
    padding: 20mm;
    user-select: none;
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
  }

  .node-view.select {
    border: 1px dashed blue;
    opacity: 0.5;
    position: absolute;
  }
</style>
