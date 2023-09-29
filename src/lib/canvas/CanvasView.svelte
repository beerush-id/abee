<script lang="ts">
  import type { State } from '@beerush/anchor';
  import { anchor, session } from '@beerush/anchor';
  import type { CanvasState, Node } from '@beerush/abee/document';
  import { NodeRect, NodeView } from '@beerush/abee/document';
  import type { Canvas } from '@beerush/abee/canvas';
  import { Ruler } from '@beerush/abee/canvas';
  import { onDestroy, onMount } from 'svelte';
  import { createRuler } from '@beerush/utils';
  import { createNode, NODE_ELEMENTS, nodes, StorageKeys } from '../document/index.js';
  import { hotkey, style } from '@beerush/utils/client';
  import type { CanvasPointer, PointerEvent } from '../document/Pointer.js';
  import { pointer } from '../document/Pointer.js';

  export let canvas: State<Canvas>;
  export let ruler = createRuler();

  const { mm } = ruler;
  const { viewport, document: page, settings } = canvas.state as State<CanvasState>;
  const cursor = session<CanvasPointer>(StorageKeys.POINTER, {} as never);

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

    if (e.dataTransfer?.files.length) {
      const files = e.dataTransfer.files;

      for (const file of files) {
        const reader = new FileReader();

        reader.onload = () => {
          const img = new Image();

          img.onload = () => {
            const node = anchor(createNode('image', 'image'));

            node.styles.set({
              left: cursor.x,
              top: cursor.y,
              width: img.width,
              height: img.height,
              backgroundImage: `url(${ img.src })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            });
            page.nodes.push(node);
          };

          img.src = reader.result as string;
        };

        reader.readAsDataURL(file);
      }
    }
  };

  const selectAll = (e: KeyboardEvent) => {
    nodes.selectAll();
  };

  console.log(nodes);
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
               use:pointer={{ relative: viewport.element, button: 0 }}
               use:hotkey={{ keys: ['ctrl', 'a'], handler: selectAll, stopPropagation: true, preventDefault: true }}
               on:mouseup={clearSelection}
               on:pointer:start={pointerStart}
               on:pointer:move={pointerMove}
               on:pointer:end={pointerEnd}
               on:dragenter|preventDefault={acceptDrag}
               on:dragover|preventDefault={acceptDrag}
               on:drop={onDrop}
               style:--canvas-cursor={$canvas.cursor}
               style:--space-x="{$viewport.x}px"
               style:--space-y="{$viewport.y}px"
               style:--space-size="{mm($viewport.boardSize||5000).at($viewport.dpi).pxs}"
               style:--space-scale={$viewport.scale}>
    <div role="button" tabindex="-1" class="canvas-viewport"
         bind:this={viewport.element}
         style:--guide-top="{$page.settings.marginTop}mm"
         style:--guide-right="{$page.settings.marginRight}mm"
         style:--guide-bottom="{$page.settings.marginBottom}mm"
         style:--guide-left="{$page.settings.marginLeft}mm"
         style:width="{mm($page.width).at($viewport.dpi).pxs}"
         style:height="{mm($page.height).at($viewport.dpi).pxs}">
      <div class="canvas-guide guide-top"></div>
      <div class="canvas-guide guide-right"></div>
      <div class="canvas-guide guide-bottom"></div>
      <div class="canvas-guide guide-left"></div>
      {#each $page.nodes as node (node.id)}
        <NodeView {node} editable={$canvas.cursorMode !== 'select'} />

        {#if $canvas.cursorMode === 'select' && node.selected}
          <NodeRect {node} scale={$viewport.scale} />
        {/if}
      {/each}
      {#if $node}
        <div class="node-view"
             class:ellipse={$node.tag === 'ellipse'}
             use:style={$node.styles}
             style:pointer-events="none"
             style:position="absolute" />
      {/if}
      {#if selectMark}
        <div class="node-view select" use:style={selectMark}></div>
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
    cursor: var(--canvas-cursor);
    width: var(--space-size);
    height: var(--space-size);
    position: absolute;
    top: calc((50% - (var(--space-size) / 2)) + var(--space-y) / var(--space-scale));
    left: calc((50% - (var(--space-size) / 2)) + var(--space-x) / var(--space-scale));
    display: flex;
    align-items: center;
    justify-content: center;
    zoom: var(--space-scale);
    -webkit-font-smoothing: subpixel-antialiased;
  }

  .node-view.select {
    border: 1px dashed blue;
    opacity: 0.5;
    position: absolute;
  }
</style>
