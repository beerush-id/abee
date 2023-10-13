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
export type DragInstance = {
  update: (options: DragOptions) => void;
  destroy: () => void;
}

export function drag(element: HTMLElement, options: DragOptions): DragInstance {
  let { deltaScale = 1, deltaZoom = 1, deltaMove = 1, button = 0, draggable = true } = options;

  let psx = 0; // Pointer Start X.
  let psy = 0; // Pointer Start Y.
  let pcx = 0; // Pointer Current X.
  let pcy = 0; // Pointer Current Y.
  let ssw = 0; // Scale Start Width.
  let ssh = 0; // Scale Start Height.
  let dragInit = false;
  let dragging = false;

  const dragStart = (e: MouseEvent) => {
    if (e instanceof MouseEvent && e.button !== button) return;
    if (!element.contains(e.target as never)) return;

    dragInit = true;
  };

  const dragMove = (e: MouseEvent) => {
    if (!dragInit) return;
    if (!dragging) {
      dragging = true;

      logger.debug(`[drag] Drag started.`);

      psx = e.x;
      psy = e.y;
      pcx = 0;
      pcy = 0;

      const { width, height } = element.getBoundingClientRect();

      ssw = width;
      ssh = height;

      const event = new CustomEvent('drag:start', {
        detail: { e, x: pcx, y: pcy, width: ssw, height: ssh },
      });
      element.dispatchEvent(event);
    }

    if (!dragging) return;
    if (e.x === 0 && e.y === 0) return;

    const x = (((e.x - psx) * deltaZoom) / deltaScale);
    const y = (((e.y - psy) * deltaZoom) / deltaScale);

    if (pcx !== x || pcy !== y) {
      pcx = x;
      pcy = y;

      const event = new CustomEvent('drag:move', {
        detail: { e, x, y, width: ssw, height: ssh },
      });

      element.dispatchEvent(event);
    }
  };

  const dragEnd = (e: MouseEvent) => {
    if (e instanceof MouseEvent && e.button !== button) return;
    if (!element.contains(e.target as never)) return;
    if (!dragInit) return;

    if (dragInit && !dragging) {
      dragInit = false;
      return;
    }

    if (e instanceof MouseEvent) {
      e.preventDefault();
    }

    e.stopPropagation();

    const event = new CustomEvent('drag:end', {
      detail: { e, x: pcx, y: pcy, width: ssw, height: ssh },
    });
    element.dispatchEvent(event);

    dragInit = false;
    dragging = false;

    logger.debug(`[drag] Drag completed by (${ pcx }px, ${ pcy }px).`);
  };

  let touch: Touch | undefined;
  const touchStart = (e: TouchEvent) => {
    if (button === 1 && e.touches.length === 2) {
      const [ a, b ] = e.touches;

      const xDistance = Math.abs(a.clientX - b.clientX);
      const yDistance = Math.abs(a.clientY - b.clientY);

      if (xDistance < 100 && yDistance < 100) {
        touch = a;
        const { clientX: x, clientY: y } = touch;
        dragStart({ x, y, target: touch.target } as never);
      }
    } else if (button === 0 && e.touches.length === 1) {
      touch = e.touches[0];
      const { clientX: x, clientY: y } = touch;
      dragStart({ x, y, target: touch.target } as never);
    }
  };

  const touchMove = (e: TouchEvent) => {
    if ((button === 0 && e.touches.length === 1) || (button === 1 && e.touches.length === 2)) {
      e.preventDefault();
      e.stopPropagation();

      touch = e.touches[0];
      const { clientX: x, clientY: y } = touch;
      dragMove({ x, y, target: e.target } as never);
    }
  };

  const touchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0 && touch) {
      dragEnd(e as never);
      touch = undefined;
    }
  };

  const register = () => {
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', dragMove);
    element.addEventListener('mouseup', dragEnd);

    element.addEventListener('touchstart', touchStart, { passive: false });
    element.addEventListener('touchmove', touchMove, { passive: false });
    element.addEventListener('touchend', touchEnd, { passive: false });

    logger.debug(`[drag] Drag registered.`);
  };

  const unregister = () => {
    element.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', dragMove);
    element.removeEventListener('mouseup', dragEnd);

    element.removeEventListener('touchstart', touchStart);
    element.removeEventListener('touchmove', touchMove);
    element.removeEventListener('touchend', touchEnd);

    logger.debug(`[drag] Drag unregistered.`);
  };

  if (draggable) {
    register();
  }

  return {
    update: (opt: DragOptions) => {
      logger.debug(`[drag] Drag reconfigure.`);

      if (opt.draggable !== draggable) {
        unregister();

        draggable = opt.draggable || draggable;

        if (draggable) {
          register();
        }
      }

      deltaScale = opt.deltaScale || deltaScale;
      deltaMove = opt.deltaMove || deltaMove;
      button = opt.button || button;
    },
    destroy: () => {
      unregister();
    },
  };
}

export type WheelOptions = {
  deltaMove?: number;
  deltaScale?: number;
  zoomAlt?: boolean;
  natural?: boolean;
};
export type CustomWheelEvent = CustomEvent<number>;
export type WheelInstance = {
  update: (options?: WheelOptions) => void;
  destroy: () => void;
}

export function wheel(element: HTMLElement, options?: WheelOptions): WheelInstance {
  let { zoomAlt = true, deltaScale = 0.1, deltaMove = 20, natural = false } = options || {} as WheelOptions;

  const onWheel = (e: WheelEvent) => {
    if (e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();

      element.dispatchEvent(new CustomEvent(
        (natural ? e.deltaY < 0 : e.deltaY > -1) ? 'move:left' : 'move:right',
        { detail: deltaMove },
      ));
      return;
    }

    if ((zoomAlt && !e.altKey) || (!zoomAlt && e.altKey)) {
      e.preventDefault();
      e.stopPropagation();

      element.dispatchEvent(new CustomEvent(
        (natural ? e.deltaY < 0 : e.deltaY > -1) ? 'move:up' : 'move:down',
        { detail: deltaMove },
      ));
      return;
    }

    if ((zoomAlt && e.altKey) || !zoomAlt) {
      e.preventDefault();
      e.stopPropagation();

      element.dispatchEvent(new CustomEvent(
        (natural ? e.deltaY < 0 : e.deltaY > -1) ? 'zoom:out' : 'zoom:in',
        { detail: deltaScale },
      ));
      return;
    }
  };

  element.addEventListener('wheel', onWheel, { passive: false });

  return {
    update: (opt?: WheelOptions) => {
      deltaScale = opt?.deltaScale || deltaScale;
      deltaMove = opt?.deltaMove || deltaMove;
      zoomAlt = opt?.zoomAlt || zoomAlt;
      natural = opt?.natural || natural;
    },
    destroy: () => {
      element.removeEventListener('wheel', onWheel);
    },
  };
}

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
