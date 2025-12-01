export interface NavigationItem {
  id: string; // GUID as string
  name: string;
  icon?: string;
  route: string;
  parentId?: string | null; // GUID as string or null for root items
  children?: NavigationItem[];
  order: number;
  isVisible: boolean;
  roleNavigations?: RoleNavigation[];
}

export interface RoleNavigation {
  roleName: string;
  navigationItemId: string; // GUID as string
}