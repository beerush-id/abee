// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { CustomDragEvent, CustomWheelEvent, PointerEvent } from '$lib/document/index.js';

export type MediaQuery = {
  [key: string]: string;
};

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface Window {
    Toqin: {
      useQuery: (name: string) => void;
      getTheme: () => string;
      setTheme: (name: string) => void;
      mediaQueries: MediaQuery[];
    };
  }
}

declare namespace svelteHTML {
  interface HTMLAttributes<T> {
    'on:pointer:start'?: (e: PointerEvent) => void;
    'on:pointer:move'?: (e: PointerEvent) => void;
    'on:pointer:end'?: (e: PointerEvent) => void;
    'on:drag:start'?: (e: CustomDragEvent) => void;
    'on:drag:move'?: (e: CustomDragEvent) => void;
    'on:drag:end'?: (e: CustomDragEvent) => void;
    'on:zoom:in': (e: CustomWheelEvent) => void;
    'on:zoom:out': (e: CustomWheelEvent) => void;
    'on:move:up': (e: CustomWheelEvent) => void;
    'on:move:down': (e: CustomWheelEvent) => void;
    'on:move:left': (e: CustomWheelEvent) => void;
    'on:move:right': (e: CustomWheelEvent) => void;
    'on:menu:open': (e: CustomEvent) => void;
    'on:menu-select': (e: CustomEvent) => void;
    'on:menu-close': (e: CustomEvent) => void;
    'on:color': (e: CustomEvent) => void;
  }
}

export {};
