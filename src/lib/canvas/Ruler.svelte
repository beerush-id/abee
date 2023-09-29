<script lang="ts">
  import { isFloat, ruler, toFixed, type Unit } from '@beerush/utils';

  const { mm } = ruler;

  export let unit: Unit = 'mm';
  export let dpi = 96;
  export let length = 210;
  export let maxLength = 5000;
  export let maxLabels = 20;
  export let vertical = false;
  export let scale = 1;
  export let move = 0;
  export let guideX = 0;
  export let guideY = 0;

  const rulerHeight = 32;

  $: dpiScale = dpi / ruler.dpi;
  $: pxScale = dpiScale * scale;
  $: segment = mm(10);
  $: segmentSize = segment.px;
  $: segmentLine = segmentSize / 10 * pxScale;
  $: documentSegments = Math.round(mm(length).px / segmentSize);
  $: allSegments = Math.round(mm((maxLength / 2)).px / segmentSize);

  $: maxDisplayedLabels = (maxLabels / 2);
  $: segments = Array(allSegments).fill(segmentSize, 0, allSegments).map((sg, si) => {
    const uSize = mm(si * 10)[unit];
    return {
      i: si,
      t: uSize.toFixed(isFloat(uSize) && unit !== 'px' ? 2 : 0),
      x: toFixed(si * sg * pxScale, 2),
      lines: Array(10).fill(segmentLine, 0, 10).map((ln, li) => {
        const i = li + (si * 10);
        const x = toFixed(i * ln, 2);
        const h = li === 0 ? rulerHeight : li === 5 ? rulerHeight / 2 : (rulerHeight / 2.5);
        const r = li === 0 ? 0 : li === 5 ? 2 : 4;
        const y = rulerHeight - h - r;
        const p = vertical
                  ? `M${ h + y } ${ x } L${ rulerHeight - h } ${ x }`
                  : `M${ x } ${ rulerHeight - h } L${ x } ${ h + y }`;
        const n = vertical
                  ? `M${ h + y } ${ x * -1 } L${ rulerHeight - h } ${ x * -1 }`
                  : `M${ x * -1 } ${ rulerHeight - h } L${ x * -1 } ${ h + y }`;
        return { i, x, h, p, n };
      }),
    };
  });
  $: mainPaths = [ segments.map(s => s.lines.map(l => l.p).join(', ')).join(', '), 'Z' ].join(', ');
  $: negativePaths = [ segments.map(s => s.lines.map(l => l.n).join(', ')).join(', '), 'Z' ].join(', ');
  $: hguide = [ `M${ guideX * pxScale } 0`, `L${ guideX * pxScale } ${ rulerHeight }`, 'Z' ].join(' ');
  $: vguide = [ `M0 ${ guideY * pxScale }`, `L${ rulerHeight } ${ guideY * pxScale }`, 'Z' ].join(' ');
</script>

<div class="canvas-ruler"
     style:--ruler-max="{mm(maxLength, pxScale).px}px"
     style:--ruler-move="{move}px"
     class:vertical={vertical ?? false}
     class:horizontal={!vertical}>
  {#if !vertical}
    <svg width="{mm(length, pxScale).px}px" height="{rulerHeight}">
      <rect x="0" y="0" width="100%" height="100%" fill="var(--tq-canvas-ruler-shade)" />
      <path d={mainPaths} stroke="var(--tq-canvas-ruler-color)" stroke-width="1" opacity="0.5" />
      <path d={negativePaths} stroke="var(--tq-canvas-ruler-color)" stroke-width="1" opacity="0.5" />
      <path d={hguide} stroke="red" stroke-width="1" opacity="0.75" />
      {#each segments as { i, x, t }}
        {#if i > 0 && i < maxDisplayedLabels}
          <text class="negative" x="-{x}" y="12px">-{t}</text>
        {/if}
      {/each}
      {#each segments as { i, x, t }}
        {#if i < maxDisplayedLabels + documentSegments}
          <text class:negative={i > documentSegments} x="{x}" y="12px">{t}</text>
        {/if}
      {/each}
    </svg>
  {:else}
    <svg width="{rulerHeight}" height="{mm(length, pxScale).px}px">
      <rect x="0" y="0" width="100%" height="100%" fill="var(--tq-canvas-ruler-shade)" />
      <path d={mainPaths} stroke="var(--tq-canvas-ruler-color)" stroke-width="1" opacity="0.5" />
      <path d={negativePaths} stroke="var(--tq-canvas-ruler-color)" stroke-width="1" opacity="0.5" />
      <path d={vguide} stroke="red" stroke-width="1" opacity="0.75" />
      {#each segments as { i, x, t }}
        {#if i > 0 && i < maxDisplayedLabels}
          <text class="negative" y="-{x}" x="0">-{t}</text>
        {/if}
      {/each}
      {#each segments as { i, x, t }}
        {#if i < maxDisplayedLabels + documentSegments}
          <text class:negative={i > documentSegments} y="{x}" x="2px">
            <tspan>{t}</tspan>
          </text>
        {/if}
      {/each}
    </svg>
  {/if}
</div>

<style lang="scss">
  .canvas-ruler {
    display: flex;
    position: absolute;
    z-index: 1;
    background: var(--tq-color-background);
    //backdrop-filter: blur(32px);
    box-shadow: 0 0 12px var(--tq-shadow-color-light);

    svg {
      overflow: unset;
    }

    text {
      font-size: var(--tq-font-size-xxs);
      fill: var(--tq-canvas-ruler-color);
    }

    &.horizontal {
      width: var(--ruler-max);
      height: var(--ruler-width);
      top: 0;
      left: calc(50% + var(--ruler-move));
      margin-left: calc((var(--ruler-max) / -2) - var(--ruler-translate, 0));
      flex-direction: row;
      justify-content: center;

      text {
        transform: translate3d(4px, 0, 0);
        background-color: var(--tq-color-background);
      }
    }

    &.vertical {
      left: 0;
      top: calc(50% + var(--ruler-move));
      margin-top: calc((var(--ruler-max) / -2) - var(--ruler-translate, 0));
      width: var(--ruler-width);
      height: var(--ruler-max);
      flex-direction: column;
      justify-content: center;

      text {
        transform: translate3d(2px, 12px, 0);
        background-color: var(--tq-color-background);
      }
    }
  }
</style>
