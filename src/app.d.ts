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

  const Toqin: {
    useQuery: (name: string) => void;
    getTheme: () => string;
    setTheme: (name: string) => void;
    mediaQueries: MediaQuery[];
  };
}

export {};
