// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

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
  interface IntrinsicElements {
    'node-view': {
      'on:pointer:start'?: (e: CustomEvent) => void;
      'on:pointer:move'?: (e: CustomEvent) => void;
      'on:pointer:end'?: (e: CustomEvent) => void;
    };
  }
}

export {};
