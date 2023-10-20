import { logger } from '@beerush/utils';
import { session } from '@beerush/anchor';
import { StorageKeys } from './Registry.js';

export type MoveBound = 'start' | 'center' | 'end';
export type CanvasPointer = {
  x: number;
  y: number;
  sx: number;
  sy: number;
  mw: number;
  mh: number;
}

export type PointerOptions = {
  relative?: HTMLElement;
  button?: number;
}
export type PointerEvent = CustomEvent<{
  e: MouseEvent,
  x: number;
  y: number;
  sx: number;
  sy: number;
  mw: number;
  mh: number;
}>;
export type PointerInstance = {
  update: (options: PointerOptions) => void;
  destroy: () => void;
}

export function pointer(element: HTMLElement, options: PointerOptions): PointerInstance {
  let { button = 0, relative = element } = options;

  const viewport = session(StorageKeys.VIEWPORT, { scale: 1 });
  const pointer = session<CanvasPointer>(StorageKeys.POINTER, { x: 0, y: 0, sx: 0, sy: 0, mw: 0, mh: 0 });

  let dragInit = false;
  let dragging = false;

  const mousedown = (event: MouseEvent) => {
    if (event.button === button && event.target === element) {
      dragInit = true;
    }
  };

  const mousemove = (event: MouseEvent) => {
    if (dragInit && !dragging) {
      dragging = true;
      const { x, y } = getPointerPosition(event, relative, viewport.scale);

      pointer.set({
        sx: x,
        sy: y,
        mw: 0,
        mh: 0,
      });

      element.dispatchEvent(new CustomEvent('pointer:start', {
        detail: { e: event, ...pointer },
      }));

      logger.debug(`[pointer] Pointer started.`);
    }

    const { x, y } = getPointerPosition(event, relative, viewport.scale);

    pointer.set({
      x, y,
      mw: dragging ? x - pointer.sx : 0,
      mh: dragging ? y - pointer.sy : 0,
    });

    element.dispatchEvent(new CustomEvent('pointer:move', {
      detail: { e: event, ...pointer },
    }));
  };

  const mouseup = (event: MouseEvent) => {
    if (dragInit) {
      dragInit = false;

      if (dragging) {
        if (event instanceof MouseEvent) {
          event.preventDefault();
        }

        event.stopPropagation();

        dragging = false;

        element.dispatchEvent(new CustomEvent('pointer:end', {
          detail: { e: event, ...pointer },
        }));

        logger.debug(`[pointer] Pointer ended.`);
      }
    }
  };

  const touchstart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const { clientX: x, clientY: y } = touch;
      Object.assign(touch, { x, y, button });
      mousedown(touch as never);
    }
  };

  const touchmove = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      const { clientX: x, clientY: y } = touch;
      Object.assign(touch, { x, y, button });
      mousemove(touch as never);
    }
  };

  const touchend = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      mouseup(event as never);
    }
  };

  element.addEventListener('mousedown', mousedown);
  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mouseup', mouseup);

  element.addEventListener('touchstart', touchstart, { passive: false });
  element.addEventListener('touchmove', touchmove, { passive: false });
  element.addEventListener('touchend', touchend, { passive: false });

  logger.debug(`[pointer] Pointer registered.`);

  return {
    update: (opt: PointerOptions) => {
      relative = opt.relative || relative;
      button = opt.button || button;

      logger.debug(`[pointer] Pointer reconfigured.`);
    },
    destroy: () => {
      element.removeEventListener('mousedown', mousedown);
      element.removeEventListener('mousemove', mousemove);
      element.removeEventListener('mouseup', mouseup);

      element.removeEventListener('touchstart', touchstart);
      element.removeEventListener('touchmove', touchmove);
      element.removeEventListener('touchend', touchend);

      logger.debug(`[pointer] Pointer unregistered.`);
    },
  };
}

export type DragOptions = {
  draggable?: boolean;
  deltaScale?: number;
  deltaZoom?: number;
  deltaMove?: number;
  button?: number;
}
export type CustomDragEvent = CustomEvent<{
  e: DragEvent | TouchEvent;
  x: number;
  y: number;
  sw: number;
  sh: number;
}>;

export type CustomWheelEvent = CustomEvent<number>;

export function doubleclick(element: HTMLElement, debounce = 250) {
  let clickCount = 0;
  let timer: number | undefined;

  const click = (e: MouseEvent) => {
    if (clickCount === 0) {
      clickCount++;

      timer = window.setTimeout(() => {
        clickCount = 0;
      }, debounce);
    } else if (clickCount === 1) {
      clickCount = 0;
      clearTimeout(timer);
      element.dispatchEvent(new CustomEvent<MouseEvent>('doubleclick', { detail: e }));
    }
  };

  element.addEventListener('click', click);

  return {
    update: (d = 250) => {
      debounce = d;
    },
    destroy: () => {
      element.removeEventListener('click', click);
    },
  };
}

export function getPointerPosition(event: MouseEvent, relative: HTMLElement, scale = 1, altScale = scale) {
  const { x: rectX, y: rectY } = relative.getBoundingClientRect();
  const { clientX, clientY } = event;

  return {
    x: (clientX - (rectX * altScale)) / scale,
    y: (clientY - (rectY * altScale)) / scale,
  };
}
