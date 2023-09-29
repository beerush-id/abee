import type { State } from '@beerush/anchor';
import { session } from '@beerush/anchor';
import type { Node } from './Node.js';

export enum StorageKeys {
  DOCUMENT = 'main-doc',
  VIEWPORT = 'main-viewport',
  SETTINGS = 'main-settings',
  POINTER = 'main-pointer',
  NODE_LIST = 'main-nodes',
  NODE_SELECTION = 'main-selections',
  COLOR_PICKER = 'main-color-picker',
  STATES = 'main-states',
}

export enum Cursor {
  SELECT = 'default',
  TEXT = 'text',
  RECTANGLE = 'crosshair',
  CIRCLE = 'crosshair',
  LINE = 'crosshair',
}

export type ColorPicker = {
  colors: string[];
  recentFill: string;
  recentStroke: string;
  recentStrokeWidth?: number;
}

export type CursorMode = 'select' | 'text' | 'rectangle' | 'circle' | 'line';
export const CURSOR_MAP: { [K in CursorMode]: string } = {
  select: 'default',
  text: 'text',
  rectangle: 'crosshair',
  circle: 'crosshair',
  line: 'crosshair',
};

export const Registry = session(StorageKeys.STATES, {
  elements: new Map<HTMLElement, State<Node>>(),
}, false);
export const NODE_ELEMENTS: Map<HTMLElement, State<Node>> = Registry.elements;
