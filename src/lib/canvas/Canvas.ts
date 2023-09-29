import { pointermove } from '@beerush/utils/client';
import type { CanvasState, CursorMode } from '@beerush/abee/document';
import { CURSOR_MAP } from '@beerush/abee/document';
import { anchor, type State } from '@beerush/anchor';
import { mmToPx } from '@beerush/utils';

export class Canvas {
  public containerElement?: HTMLElement;
  public viewportElement?: HTMLElement | SVGElement;

  public cursorMode: CursorMode = 'select';
  public cursor = 'default';

  private leavePointer?: () => void;

  constructor(public name: string, public state: CanvasState) {}

  public setCursor(cursor: CursorMode) {
    if (CURSOR_MAP[cursor]) {
      this.cursorMode = cursor;
      this.cursor = CURSOR_MAP[cursor];
    }
  }

  public setViewport(
    viewport: HTMLElement | SVGElement,
    container?: HTMLElement,
    board?: HTMLElement,
    zoomFit?: boolean,
  ) {
    this.viewportElement = viewport;
    this.containerElement = container ?? viewport.parentElement as HTMLElement;

    this.capturePointer(board || viewport.parentElement as HTMLElement);

    if (!this.state.viewport.initialized) {
      if (zoomFit) {
        this.zoomFit('width');
      }

      this.state.viewport.initialized = true;
    }
  }

  public capturePointer(container: HTMLElement) {
    const { deltaScale, deltaMove } = this.state.settings;
    const pointer = pointermove(container, this.state.viewport, 1, deltaScale, deltaMove);
    this.leavePointer = pointer.destroy;
  }

  public leave() {
    this.leavePointer?.();
  }

  public zoomIn() {
    this.state.viewport.scale += 0.05;
  }

  public zoomOut() {
    if (this.state.viewport.scale > 0.1) {
      this.state.viewport.scale -= 0.05;
    }
  }

  public zoomBy(value: number) {
    this.state.viewport.scale += (value * this.state.settings.deltaScale);
  }

  public zoomFit(bound: 'width' | 'height' | 'all' = 'all') {
    if (this.containerElement) {
      const { document, viewport } = this.state;
      const { width, height } = this.containerElement.getBoundingClientRect();
      const {
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
      } = getComputedStyle(this.containerElement as HTMLElement);
      const viewWidth = mmToPx(document.width, viewport.dpi);
      const viewHeight = mmToPx(document.height, viewport.dpi);

      const scalePoint = width > height ? 'height' : 'width';
      const areaWidth = width - (parseFloat(paddingLeft) + parseFloat(paddingRight));
      const areaHeight = height - (parseFloat(paddingTop) + parseFloat(paddingBottom));

      if (bound === 'all') {
        if (scalePoint === 'width' && viewWidth > areaWidth) {
          viewport.scale = areaWidth / viewWidth;
        } else if (scalePoint === 'height' && viewHeight > areaHeight) {
          viewport.scale = areaHeight / viewHeight;
        }

        this.moveTo(0, 0);
      } else if (bound === 'width') {
        viewport.scale = areaWidth / viewWidth;
        this.moveTo(0, (viewHeight / 2) + parseFloat(paddingTop));
      } else if (bound === 'height') {
        viewport.scale = areaHeight / viewHeight;
        this.moveTo(0, 0);
      }
    }
  }

  public zoomFull() {
    this.state.viewport.scale = 1;
    this.moveTo(0, mmToPx(this.state.document.height / 4, this.state.viewport.dpi));
  }

  public moveTo(x: number, y: number) {
    this.state.viewport.x = x;
    this.state.viewport.y = y;
  }
}

export function createCanvas(state: CanvasState, name?: string): State<Canvas, false> {
  return anchor(new Canvas(name ?? 'main-canvas', state) as never, false);
}

export function getPixelScale() {
  const elem = document.createElement('div');

  elem.style.width = '210mm';
  elem.style.visibility = 'hidden';

  document.body.appendChild(elem);

  const { width } = elem.getBoundingClientRect();
  const scale = width / 210;

  document.body.removeChild(elem);

  return scale;
}
