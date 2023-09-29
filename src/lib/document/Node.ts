import type { ColorPicker } from './Registry.js';
import { StorageKeys } from './Registry.js';
import type { State } from '@beerush/anchor';
import { anchor, session } from '@beerush/anchor';
import type { CanvasPointer, MoveBound, MoveEvent } from './Pointer.js';
import { nanoid } from 'nanoid';
import type { CSSStyles } from '@beerush/utils/client';
import { capitalize, logger } from '@beerush/utils';

export type NodeRectangle = {
  top: number;
  left: number;
  width: number;
  height: number;
  rotate?: number;
  scale?: number;

  isDragging?: boolean;
};
export type NodeType = 'text' | 'rectangle' | 'circle' | 'line' | 'image' | 'svg' | 'group';
export type NodeStyles = CSSStyles & NodeRectangle;

export type Node = {
  id: string;
  tag: NodeType;
  type: string;
  name?: string;
  text?: string;

  styles: CSSStyles & NodeRectangle;
  classList?: string[];
  attributes?: {
    [key: string]: string
  };
  children?: Node[];
  selected?: boolean;
  dragged?: boolean;
  hovered?: boolean;
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
  group: 'layers',
  line: 'remove',
  image: 'image',
  svg: 'image',
};

export class NodeList {
  public items = session<Node[]>('main-node-list', []);
  public rects = new Map<State<Node>, State<NodeStyles>>();
  public selections = anchor<Node[]>([]);

  public assign(nodes: State<Node[]>) {
    this.rects.clear();
    this.selections.splice(0, this.selections.length);

    this.items = nodes;

    for (const node of this.items) {
      this.createRect(node);

      if (node.selected) {
        this.selections.push(node);
      }
    }
  }

  public create(tag: NodeType, name = tag): State<Node> {
    const picker = session<ColorPicker>(StorageKeys.COLOR_PICKER, {} as never);

    const styles: Partial<NodeStyles> = {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      position: 'absolute',
    };

    if (tag !== 'group') {
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
      tag,
      type: tag,
      name: capitalize(name),
      styles: styles as NodeStyles,
      children: [],
    });

    if (tag === 'text') {
      (node as State<TextNode>).text = 'Text';
    }

    this.items.push(node);
    this.createRect(node);
    return node;
  }

  public group(nodes: State<Node[]> = this.selections): State<Node> {
    const group = this.create('group');

    const topNode = this.getTopMost(nodes);
    const leftNode = this.getLeftMost(nodes);
    const rightNode = this.getRightMost(nodes);
    const bottomNode = this.getBottomMost(nodes);

    console.log(
      topNode.styles.top,
      leftNode.styles.left,
      rightNode.styles.left + rightNode.styles.width - leftNode.styles.left,
      bottomNode.styles.top + bottomNode.styles.height - topNode.styles.top,
    );

    while (nodes.length) {
      const node = nodes[0];

      if (node) {
        if (node.selected) {
          node.selected = false;
        }

        if (this.items.includes(node)) {
          this.items.splice(this.items.indexOf(node), 1);
        }

        if (this.selections.includes(node)) {
          this.selections.splice(this.selections.indexOf(node), 1);
        }

        group.children?.push(node);
      }
    }

    const rect = this.rects.get(group);

    if (rect) {
      rect.set({
        top: topNode.styles.top,
        left: leftNode.styles.left,
        width: rightNode.styles.left + rightNode.styles.width + leftNode.styles.left,
        height: bottomNode.styles.top + bottomNode.styles.height + topNode.styles.top,
      });

      this.applyRect(group);
    }

    this.select(group);

    return group;
  }

  public ungroup(group: State<Node>) {
    while (group.children?.length) {
      const node = group.children[0];

      if (node) {
        if (node.selected) {
          node.selected = false;
        }

        if (group.children.includes(node)) {
          group.children.splice(group.children.indexOf(node), 1);
        }

        this.items.splice(this.items.indexOf(group), 0, node as never);
      }
    }

    this.remove(group);
  }

  public getTopMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (prev.styles.top > next.styles.top) {
        return prev;
      } else {
        return next;
      }
    });
  }

  public getLeftMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (prev.styles.left > next.styles.left) {
        return prev;
      } else {
        return next;
      }
    });
  }

  public getRightMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (prev.styles.left < next.styles.left) {
        return prev;
      } else {
        return next;
      }
    });
  }

  public getBottomMost(nodes: State<Node[]> = this.items) {
    return nodes.reduce((prev, next) => {
      if (prev.styles.top < next.styles.top) {
        return prev;
      } else {
        return next;
      }
    });
  }

  public createRect(node: State<Node>): this {
    this.rects.set(node, anchor({ ...node.styles }));
    return this;
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
    for (const node of this.items) {
      if (!except || !except.includes(node)) {
        this.deselect(node);
      }
    }

    return this.selections;
  }

  public move(e: MoveEvent): this {
    const { x, y } = e.detail;

    for (const [ node, rect ] of this.rects) {
      const { selected, styles } = node;

      if (selected) {
        rect.set({
          isDragging: true,
          left: styles.left + x,
          top: styles.top + y,
        });
      }
    }

    return this;
  }

  public resize(e: MoveEvent, resizeX: MoveBound, resizeY: MoveBound): this {
    const { x, y, e: ed } = e.detail;

    for (const [ node, rect ] of this.rects) {
      const { selected, styles } = node;

      if (selected) {
        const { left: cx, top: cy, width: cw, height: ch } = styles;

        if (resizeX === 'start') {
          rect.width = (cw - x);
          rect.left = rect.width > 0 ? (cx + x) : rect.left;
        } else if (resizeX === 'end') {
          rect.width = (cw + x);
        }

        if (resizeY === 'start') {
          rect.height = ed.shiftKey ? rect.width : (ch - y);
          rect.top = rect.height > 0 ? (cy + y) : rect.top;
        } else if (resizeY === 'end') {
          rect.height = ed.shiftKey ? rect.width : (ch + y);
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
}

export const nodes = new NodeList();

export function isInsideNode(pointer: CanvasPointer, node: Node) {
  const { x: left, y: top } = pointer;
  const { styles } = node;

  const { left: x, top: y, width, height } = styles;

  return left >= x && left <= (x + width) && top >= y && top <= (y + height);
}
