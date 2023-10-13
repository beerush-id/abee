import type { ColorPicker } from './Registry.js';
import { StorageKeys } from './Registry.js';
import type { State } from '@beerush/anchor';
import { anchor, session } from '@beerush/anchor';
import type { CanvasPointer, MoveBound } from './Pointer.js';
import { nanoid } from 'nanoid';
import type { CSSStyles } from '@beerush/utils/client';
import { capitalize, DEFAULT_DPI, logger, pxDrop, ruler } from '@beerush/utils';
import type { MenuItemData } from '../core/Menu.js';
import type { DraggableEvent } from '@beerush/composer';

export type NodeRectangle = {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate?: number;
  scale?: number;

  isDragging?: boolean;
};
export type NodeType = 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'svg' | 'group' | 'frame';
export type NodeStyles = CSSStyles & NodeRectangle;

export type Node = {
  id: string;
  type: NodeType;
  name: string;
  styles: CSSStyles & NodeRectangle;
  children: Node[];
  visible: boolean;
  printable: boolean;

  text?: string;

  classList?: string[];
  attributes?: {
    [key: string]: string
  };
  selected?: boolean;
  dragged?: boolean;
  hovered?: boolean;
  locked?: boolean;
};

export type TextProperty = NodeRectangle & {
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  fontWeight: string;
  lineHeight: number;
  content: string;
  textAlign: string;
}

export type TextNode = Node & {
  text: string;
  attributes: TextProperty;
}

export const ICON_MAP: {
  [K in NodeType]: string;
} = {
  rectangle: 'rectangle',
  circle: 'circle',
  text: 'title',
  frame: 'crop_free',
  group: 'layers',
  line: 'remove',
  image: 'image',
  svg: 'image',
};

export class NodeList {
  public items = session<Node[]>('main-node-list', []);
  public rects = anchor(new Map<State<Node>, State<NodeStyles>>(), false);
  public selections = anchor<Node[]>([]);

  public assign(nodes: State<Node[]>): this {
    this.rects.clear();
    this.selections.splice(0, this.selections.length);

    this.items = nodes;

    for (const node of this.items) {
      this.createRect(node);

      if (node.selected) {
        this.selections.push(node);
      }
    }

    logger.debug('[node-list:assign] Node list assigned.');
    return this;
  }

  public clear(clearNodes?: boolean): this {
    this.rects.clear();
    this.selections.splice(0, this.selections.length);

    if (clearNodes) {
      this.items.splice(0, this.items.length);
    }

    logger.debug('[node-list:clear] Node list cleaned up.');
    return this;
  }

  public createRect(node: State<Node>): this {
    this.rects.set(node, anchor({ ...node.styles }));

    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        this.createRect(child);
      }
    }

    logger.debug('[node-list:create-rect] Node rectangle created.');
    return this;
  }

  public create(
    tag: NodeType,
    name: string | NodeType = capitalize(tag),
    initStyles?: Partial<NodeStyles>,
  ): State<Node> {
    const picker = session<ColorPicker>(StorageKeys.COLOR_PICKER, {} as never);

    const styles: Partial<NodeStyles> = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      position: 'absolute',
    };

    if (![ 'group', 'text', 'image' ].includes(tag)) {
      Object.assign(styles, {
        backgroundColor: picker.recentFill,
        borderStyle: 'solid',
        borderColor: picker.recentStroke,
        borderWidth: picker.recentStrokeWidth || 1,
      });
    }

    if (tag === 'circle') {
      styles.borderRadius = '50%';
    } else {
      Object.assign(styles, {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      });
    }

    const node = anchor<Node | TextNode>({
      id: nanoid(8),
      type: tag,
      name: name,
      styles: { ...styles, ...initStyles } as NodeStyles,
      children: [],
      visible: true,
      printable: true,
    });

    if (tag === 'text') {
      (node as State<TextNode>).text = 'Text';
    }

    this.createRect(node as never);
    this.items.push(node as never);
    return node as never;
  }

  public import(files: FileList, left = 0, top = 0, dpi = DEFAULT_DPI) {
    for (const file of files) {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const node = this.create('image', file.name, {
            top, left,
            width: pxDrop(img.width, dpi, ruler.dpi),
            height: pxDrop(img.height, dpi, ruler.dpi),
            backgroundImage: `url(${ img.src })`,
            backgroundSize: '100% 100%',
          });

          this.select(node);
        };

        img.src = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  public group(nodes: State<Node[]> = this.selections): State<Node> {
    const group = this.create('group');

    const { top, left, width, height } = this.getBoundingRects(nodes);

    while (nodes.length) {
      const node = nodes[0];

      if (node) {
        if (node.selected) {
          this.deselect(node);
        }

        if (this.items.includes(node)) {
          this.items.splice(this.items.indexOf(node), 1);
        }

        node.styles.top -= top;
        node.styles.left -= left;

        group.children?.push(node);
      }
    }

    const rect = this.rects.get(group);

    if (rect) {
      rect.set({ top, left, width, height });
      this.applyRect(group);
    }

    this.select(group);

    return group;
  }

  public ungroup(group: State<Node>) {
    const { top, left } = group.styles;

    while (group.children?.length) {
      const node = group.children[0];

      if (node) {
        if (node.selected) {
          this.deselect(node);
        }

        if (group.children.includes(node)) {
          group.children.splice(group.children.indexOf(node), 1);
        }

        this.items.splice(this.items.indexOf(group), 0, node as never);

        node.styles.top += top;
        node.styles.left += left;
      }
    }

    this.remove(group);
  }

  public getBoundingRects(nodes: State<Node[]> = this.items, offset = 0) {
    const tRect: NodeRectangle = this.rects.get(this.getTopMost(nodes)) as never;
    const lRect: NodeRectangle = this.rects.get(this.getLeftMost(nodes)) as never;
    const rRect: NodeRectangle = this.rects.get(this.getRightMost(nodes)) as never;
    const bRect: NodeRectangle = this.rects.get(this.getBottomMost(nodes)) as never;

    const { top } = tRect;
    const { left } = lRect;
    const width = (rRect.left - left) + rRect.width;
    const height = (bRect.top - top) + bRect.height;

    return {
      top: top - (offset / 2),
      left: left - (offset / 2),
      width: width + offset,
      height: height + offset,
    };
  }

  public getTopMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (next.styles.top < prev.styles.top) {
        return next;
      } else {
        return prev;
      }
    });
  }

  public getLeftMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (next.styles.left < prev.styles.left) {
        return next;
      } else {
        return prev;
      }
    });
  }

  public getRightMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      const { left: pl, width: pw } = prev.styles;
      const { left: nl, width: nw } = next.styles;

      if ((nl + nw) > (pl + pw)) {
        return next;
      } else {
        return prev;
      }
    });
  }

  public getBottomMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      const { top: pt, height: ph } = prev.styles;
      const { top: nt, height: nh } = next.styles;

      if ((nt + nh) > (pt + ph)) {
        return next;
      } else {
        return prev;
      }
    });
  }

  public select(node: State<Node> | string, append?: boolean): State<Node> | void {
    if (typeof node === 'string') {
      const next = this.items.find(item => item.id === node);

      if (next) {
        return this.select(next, append);
      } else {
        return;
      }
    }

    if (!node.selected) {
      node.selected = true;

      if (append) {
        this.selections.push(node);
        logger.debug('[node-list:select] Append selection.');
      } else {
        this.deselectAll([ node ]);
        this.selections.splice(0, this.selections.length, node);
        logger.debug('[node-list:select] Replace selection.');
      }

      return node;
    }
  }

  public selectRange(start: State<Node>, end: State<Node>): State<Node[]> {
    const startIndex = this.items.indexOf(start);
    const endIndex = this.items.indexOf(end);

    if (endIndex < startIndex) {
      return this.selectRange(end, start);
    }

    for (let i = startIndex; i <= endIndex; ++i) {
      this.select(this.items[i], true);
    }

    return this.selections;
  }

  public selectAll(): State<Node[]> {
    for (const node of this.items) {
      this.select(node, true);
    }

    return this.selections;
  }

  public selectBound(pointer: CanvasPointer): State<Node[]> {
    for (const node of this.items) {
      if (!node.selected) {
        const { sx, sy, mw, mh } = pointer;
        const { left, top, width, height } = node.styles;

        const x = mw < 0 ? sx + mw : sx;
        const y = mh < 0 ? sy + mh : sy;
        const w = Math.abs(mw);
        const h = Math.abs(mh);

        if (
          (left >= x && (left + width) <= (x + w)) &&
          (top >= y && (top + height) <= (y + h))
        ) {
          this.select(node, true);
        }
      }
    }

    return this.selections;
  }

  public selectTouchingBound(pointer: CanvasPointer): State<Node[]> {
    for (const node of this.items) {
      if (!node.selected && isInsideNode(pointer, node)) {
        this.select(node, true);
      }
    }

    return this.selections;
  }

  public toggleSelect(node: State<Node> | string, append?: boolean): State<Node> | void {
    if (typeof node === 'string') {
      const next = this.items.find(item => item.id === node);

      if (next) {
        return this.toggleSelect(next, append);
      } else {
        return;
      }
    }

    if (node.selected) {
      return this.deselect(node);
    } else {
      return this.select(node, append);
    }
  }

  public deselect(node: State<Node> | string): State<Node> | void {
    if (typeof node === 'string') {
      const next = this.items.find(item => item.id === node);

      if (next) {
        return this.deselect(next);
      } else {
        return;
      }
    }

    if (node.selected) {
      node.selected = false;

      if (this.selections.includes(node)) {
        this.selections.splice(this.selections.indexOf(node), 1);
      }

      return node;
    }
  }

  public deselectAll(except?: Node[]): State<Node[]> {
    for (const node of [ ...this.selections ]) {
      if (!except || !except.includes(node)) {
        this.deselect(node);
      }
    }

    return this.selections;
  }

  public move(e: DraggableEvent): this {
    const { deltaX, deltaY } = e.detail;

    for (const [ node, rect ] of this.rects) {
      const { selected, styles } = node;

      if (selected) {
        rect.set({
          isDragging: true,
          left: styles.left + deltaX,
          top: styles.top + deltaY,
        });
      }
    }

    return this;
  }

  public resize(e: DraggableEvent, resizeX: MoveBound, resizeY: MoveBound): this {
    const { deltaX, deltaY } = e.detail;

    for (const [ node, rect ] of this.rects) {
      const { selected, styles } = node;

      if (selected) {
        const { left: cx, top: cy, width: cw, height: ch } = styles;

        if (resizeX === 'start') {
          rect.width = (cw - deltaX);
          rect.left = rect.width > 0 ? (cx + deltaX) : rect.left;
        } else if (resizeX === 'end') {
          rect.width = (cw + deltaX);
        }

        if (resizeY === 'start') {
          rect.height = (ch - deltaY);
          rect.top = rect.height > 0 ? (cy + deltaY) : rect.top;
        } else if (resizeY === 'end') {
          rect.height = (ch + deltaY);
        }
      }
    }

    return this;
  }

  public applyRect(node?: State<Node>): this {
    if (node) {
      const rect = this.rects.get(node);

      if (rect) {
        rect.set({ isDragging: false });
        node.styles.set({ ...rect });
      }
    } else {
      for (const [ node ] of this.rects) {
        const { selected } = node;

        if (selected) {
          this.applyRect(node);
        }
      }
    }

    return this;
  }

  public remove(node: State<Node> | string): this {
    if (typeof node === 'string') {
      const next = this.items.find(item => item.id === node);

      if (next) {
        return this.remove(next);
      } else {
        return this;
      }
    }

    if (this.items.includes(node)) {
      this.items.splice(this.items.indexOf(node), 1);
    }

    if (this.selections.includes(node)) {
      this.selections.splice(this.selections.indexOf(node), 1);
    }

    this.rects.delete(node);

    return this;
  }

  public removeSelected(): this {
    while (this.selections.length) {
      const node = this.selections[0];

      if (node) {
        this.remove(node);
      }
    }

    return this;
  }

  public removeAll(): this {
    this.items.splice(0, this.items.length);
    this.selections.splice(0, this.selections.length);
    this.rects.clear();

    return this;
  }

  public align(
    nodes: State<Node[]>,
    dir: 'vertical' | 'horizontal' | 'all',
    align: 'start' | 'center' | 'end' | 'before' | 'after',
  ) {
    if (nodes.length < 2) {
      return;
    }

    const last: Node = [ ...nodes ].pop() as never;
    const rest = [ ...nodes ].slice(0, -1);
    const { left, top, width, height } = last.styles;
    const center = { left: left + (width / 2), top: top + (height / 2) };

    for (const node of rest) {
      const rect = { ...node.styles };

      if (dir === 'vertical') {
        if (align === 'start') {
          rect.top = top;
        } else if (align === 'center') {
          rect.top = center.top - (rect.height / 2);
        } else if (align === 'end') {
          rect.top = top + height - rect.height;
        } else if (align === 'before') {
          rect.top = top - rect.height;
        } else if (align === 'after') {
          rect.top = top + height;
        }
      } else if (dir === 'horizontal') {
        if (align === 'start') {
          rect.left = left;
        } else if (align === 'center') {
          rect.left = center.left - (rect.width / 2);
        } else if (align === 'end') {
          rect.left = left + width - rect.width;
        } else if (align === 'before') {
          rect.left = left - rect.width;
        } else if (align === 'after') {
          rect.left = left + width;
        }
      } else if (dir === 'all') {
        if (align === 'start') {
          rect.top = top;
          rect.left = left;
        } else if (align === 'center') {
          rect.top = center.top - (rect.height / 2);
          rect.left = center.left - (rect.width / 2);
        } else if (align === 'end') {
          rect.top = top + height - rect.height;
          rect.left = left + width - rect.width;
        } else if (align === 'before') {
          rect.top = top - rect.height;
          rect.left = left - rect.width;
        } else if (align === 'after') {
          rect.top = top + height;
          rect.left = left + width;
        }
      }

      node.styles.set(rect);
    }
  }

  public distribute(nodes: State<Node[]>, dir: 'vertical' | 'horizontal', align: 'start' | 'center' | 'end') {
    return;
  }

  public createContextMenus(nodes = this.selections) {
    const items: MenuItemData[] = [
      {
        type: 'button',
        text: 'Copy',
        icon: 'content_copy',
        keys: [ 'Ctrl', 'C' ],
        action: () => {
          logger.info('[node-list:context-menu] Copy.');
        },
      },
      {
        type: 'button',
        text: 'Cut',
        icon: 'content_cut',
        keys: [ 'Ctrl', 'X' ],
        action: () => {
          logger.info('[node-list:context-menu] Cut.');
        },
      },
      {
        type: 'hidden',
        text: 'Paste',
        icon: 'content_paste',
        keys: [ 'Ctrl', 'V' ],
        action: () => {
          logger.info('[node-list:context-menu] Paste.');
        },
      },
      {
        type: 'button',
        text: 'Delete',
        icon: 'delete',
        action: () => {
          this.removeSelected();
        },
      },
      {
        type: 'separator',
      },
      {
        type: nodes.length > 1 ? 'button' : 'hidden',
        text: 'Group',
        icon: 'layers',
        keys: [ 'Ctrl', 'G' ],
        action: () => {
          this.group(nodes);
        },
      },
      {
        type: nodes[0]?.type === 'group' ? 'button' : 'hidden',
        text: 'Ungroup',
        icon: 'layers_clear',
        keys: [ 'Ctrl', 'Shift', 'G' ],
        action: () => {
          this.ungroup(nodes[0]);
        },
      },
      {
        type: 'button',
        text: 'Align',
        icon: 'format_image_right',
        action: () => null,
        items: [],
      },
    ];

    return items;
  }
}

export const nodes = new NodeList();

export function isInsideNode(pointer: CanvasPointer, node: Node) {
  const { x: left, y: top } = pointer;
  const { styles } = node;

  const { left: x, top: y, width, height } = styles;

  return left >= x && left <= (x + width) && top >= y && top <= (y + height);
}
