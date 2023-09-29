import { nanoid } from 'nanoid';
import { session } from '@beerush/anchor';
import type { Unit } from '@beerush/utils';
import type { ColorPicker } from './Registry.js';
import { StorageKeys } from './Registry.js';
import type { Node, NodeType } from './Node.js';
import type { CanvasPointer } from './Pointer.js';

export type CanvasViewport = {
  x: number;
  y: number;
  mx: number;
  ox: number;
  my: number;
  oy: number;
  dpi: number;
  scale: number;
  unit: Unit;
  boardSize?: number;
  showRulers?: boolean;
  linkSize?: boolean;
  initialized?: boolean;
  showPointerPosition?: boolean;
  element?: HTMLElement;
}

export type DocumentSettings = {
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  alignTarget: 'selection' | 'page';

  rowGap?: number;
  columnGap?: number;
  alignToMargin?: boolean;
  grid?: number;
  snapToNodeDistance?: number;
}

export type Document = {
  name: string;
  width: number;
  height: number;
  unit: Unit;
  dpi: number;
  nodes: Node[];
  settings: DocumentSettings;
}

export type CanvasSettings = {
  deltaScale: number;
  deltaMove: number;
  smallToolButton?: boolean;
  showRulers?: boolean;
  showPointerPosition?: boolean;
  snapToGrid?: boolean;
  snapToNode?: boolean;
  snapToPixel?: boolean;
}

export type CanvasState = {
  viewport: CanvasViewport;
  document: Document;
  settings: CanvasSettings;
  pointer: CanvasPointer;
};

export function createNode(tag: string, type: NodeType): Node {
  const picker = session<ColorPicker>(StorageKeys.COLOR_PICKER, {} as never);

  return {
    id: nanoid(8),
    tag,
    type,
    name: tag,
    styles: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      backgroundColor: picker.recentFill,
      borderStyle: 'solid',
      borderColor: picker.recentStroke,
      borderWidth: picker.recentStrokeWidth || 1,
      borderRadius: tag === 'ellipse' ? '50%' : '0',
      position: 'absolute',
    },
  } as Node;
}
