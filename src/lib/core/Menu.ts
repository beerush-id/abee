export type MenuItemType = 'button' | 'link' | 'separator' | 'hidden';
export type MenuInfo = {
  text: string;
  icon?: string;
  keys?: string[];
  tooltip?: string;
  disabled?: boolean;
  items?: MenuItemData[];
}

export type MenuButton = MenuInfo & {
  type: 'button';
  action: (e: MouseEvent) => void;
}

export type MenuLink = MenuInfo & {
  type: 'link';
  href: string;
}

export type MenuSeparator = {
  type: 'separator';
}

export type MenuHidden = MenuInfo & {
  type: 'hidden';
}

export type MenuItemData = MenuButton | MenuLink | MenuSeparator | MenuHidden;
