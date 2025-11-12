export interface NavigationItem {
  id: number;
  name: string;
  icon?: string;
  route: string;
  parentId?: number | null;
  children: NavigationItem[];
  order: number;
  isVisible: boolean;
}