import { logger } from '@beerush/utils';
import { session } from '@beerush/anchor';
import { StorageKeys } from './Registry.js';

export type MoveOptions = {
  draggable: boolean;
  deltaScale?: number;
}

export type MoveEvent = CustomEvent<{
  e: DragEvent | TouchEvent;
  x: number;
  y: number;
  sw: number;
  sh: number;
}>;

export type MoveInstance = {
  update: (options: MoveOptions) => void;
  destroy: () => void;
}

export type MoveBound = 'start' | 'center' | 'end';
export type MouseEventPlus = MouseEvent & {
  sourceCapabilities: {
    firesTouchEvents: boolean;
  }
}

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

export function pointer(element: HTMLElement, options: PointerOptions) {
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
      pointer.set({
        sx: pointer.x,
        sy: pointer.y,
        mw: 0,
        mh: 0,
      });

      element.dispatchEvent(new CustomEvent('pointer:start', {
        detail: { e: event, ...pointer },
      }));

      logger.debug(`[pointer] Pointer started.`);
    }

    const { x: bx, y: by } = relative.getBoundingClientRect();
    const { clientX, clientY } = event;
    const { scale } = viewport;

    const x = ((clientX - (bx * scale)) / scale);
    const y = ((clientY - (by * scale)) / scale);

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
    if (event.button === button && dragInit) {
      dragInit = false;

      if (dragging) {
        event.preventDefault();
        event.stopPropagation();

        dragging = false;

        element.dispatchEvent(new CustomEvent('pointer:end', {
          detail: { e: event, ...pointer },
        }));

        logger.debug(`[pointer] Pointer ended.`);
      }
    }
  };

  element.addEventListener('mousemove', mousemove);
  element.addEventListener('mousedown', mousedown);
  element.addEventListener('mouseup', mouseup);

  logger.debug(`[pointer] Pointer registered.`);

  return {
    update: (opt: PointerOptions) => {
      relative = opt.relative || relative;
      button = opt.button || button;

      logger.debug(`[pointer] Pointer reconfigured.`);
    },
    destroy: () => {
      element.removeEventListener('mousemove', mousemove);
      element.removeEventListener('mousedown', mousedown);
      element.removeEventListener('mouseup', mouseup);

      logger.debug(`[pointer] Pointer unregistered.`);
    },
  };
}

export function drag(element: HTMLElement, options: MoveOptions): MoveInstance {
  let { deltaScale = 1 } = options;

  let psx = 0; // Pointer Start X.
  let psy = 0; // Pointer Start Y.
  let pcx = 0; // Pointer Current X.
  let pcy = 0; // Pointer Current Y.
  let ssw = 0; // Scale Start Width.
  let ssh = 0; // Scale Start Height.
  let dragInit = false;
  let dragging = false;

  const dragStart = (e: MouseEvent) => {
    if (e instanceof MouseEvent && e.button !== 0) return;
    if (e.target !== element && (e.target as HTMLElement).parentElement !== element) return;

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

      const event = new CustomEvent('mover:start', {
        detail: { e, x: pcx, y: pcy, width: ssw, height: ssh },
      });
      element.dispatchEvent(event);
    }

    if (!dragging) return;
    if (e.x === 0 && e.y === 0) return;

    const x = ((e.x - psx) / deltaScale);
    const y = ((e.y - psy) / deltaScale);

    if (pcx !== x || pcy !== y) {
      pcx = x;
      pcy = y;

      const event = new CustomEvent('mover:move', {
        detail: { e, x, y, width: ssw, height: ssh },
      });
      element.dispatchEvent(event);
    }
  };

  const dragEnd = (e: MouseEvent) => {
    if (e instanceof MouseEvent && e.button !== 0) return;
    if (e.target !== element && (e.target as HTMLElement).parentElement !== element) return;
    if (!dragInit) return;

    if (dragInit && !dragging) {
      dragInit = false;
      return;
    }

    const event = new CustomEvent('mover:end', {
      detail: { e, x: pcx, y: pcy, width: ssw, height: ssh },
    });
    element.dispatchEvent(event);

    dragInit = false;
    dragging = false;

    logger.debug(`[drag] Drag completed by (${ pcx }px, ${ pcy }px).`);
  };

  let touch: Touch | undefined;
  const touchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      touch = e.touches[0];
      const { clientX: x, clientY: y } = touch;
      dragStart({ x, y, target: touch.target } as never);
    }
  };

  const touchMove = (e: TouchEvent) => {
    e.stopPropagation();

    if (e.touches.length === 1) {
      touch = e.touches[0];
      const { clientX: x, clientY: y } = touch;
      dragMove({ x, y, target: e.target } as never);
    }
  };

  const touchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      dragEnd(e as never);
      touch = undefined;
    }
  };

  const register = () => {
    element.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    element.addEventListener('mouseup', dragEnd);

    element.addEventListener('touchstart', touchStart, { passive: true });
    element.addEventListener('touchmove', touchMove, { passive: true });
    element.addEventListener('touchend', touchEnd, { passive: true });

    logger.debug(`[drag] Drag registered.`);
  };

  const unregister = () => {
    element.removeEventListener('mousedown', dragStart);
    window.removeEventListener('mousemove', dragMove);
    element.removeEventListener('mouseup', dragEnd);

    element.removeEventListener('touchstart', touchStart);
    element.removeEventListener('touchmove', touchMove);
    element.removeEventListener('touchend', touchEnd);

    logger.debug(`[drag] Drag unregistered.`);
  };

  if (options.draggable) {
    register();
  }

  return {
    update: (opt: MoveOptions) => {
      logger.debug(`[drag] Drag reconfigure.`);
      unregister();

      deltaScale = opt.deltaScale || deltaScale;

      if (opt.draggable) {
        register();
      }
    },
    destroy: () => {
      unregister();
    },
  };
}
