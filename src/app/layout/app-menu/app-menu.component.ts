import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../app.layout.service';
import { NavigationService } from '../../services/navigation.service';
import { NavigationItem } from '../../models/navigation-item.model';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menu',
  templateUrl: './app-menu.component.html',
  styleUrl: './app-menu.component.scss'
})
export class AppMenuComponent implements OnInit {

  model: any[] = [];

  constructor(
    public layoutService: LayoutService,
    private navigationService: NavigationService
  ) { }

  ngOnInit() {
    this.loadUserNavigation();
  }

  loadUserNavigation() {
    this.navigationService.getUserNavigation().subscribe({
      next: (navItems: NavigationItem[]) => {
        this.model = this.transformNavigationToMenuItems(navItems);
      },
      error: (error) => {
        console.error('Error loading navigation:', error);
        // Fallback to default menu if there's an error
        // this.loadDefaultMenu();
      }
    });
  }

  private transformNavigationToMenuItems(navItems: NavigationItem[]): any[] {
    // Sort the navigation items by the 'order' property, then map to menu items
    const sortedNavItems = [...navItems].sort((a, b) => a.order - b.order);

    const menuItems: any[] = [];

    sortedNavItems.forEach(item => {
      const menuItem: any = {
        label: item.name,
        icon: item.icon || 'pi pi-fw pi-file', // Default icon if not provided
      };

      if (item.route) {
        menuItem.routerLink = item.route;
      }

      // Add children if they exist
      if (item.children && item.children.length > 0) {
        menuItem.items = this.transformChildItems(item.children);
      }

      menuItems.push(menuItem);
    });

    return menuItems;
  }

  private transformChildItems(childItems: NavigationItem[]): any[] {
    // Sort the child navigation items by the 'order' property, then map to menu items
    const sortedChildItems = [...childItems].sort((a, b) => a.order - b.order);

    const menuItems: any[] = [];

    sortedChildItems.forEach(item => {
      const menuItem: any = {
        label: item.name,
        icon: item.icon || 'pi pi-fw pi-file',
      };

      if (item.route) {
        menuItem.routerLink = item.route;
      }

      // Recursively add children with grandchildren if they exist
      if (item.children && item.children.length > 0) {
        menuItem.items = this.transformChildItems(item.children);
      }

      menuItems.push(menuItem);
    });

    return menuItems;
  }

  private loadDefaultMenu() {
    // Keep the original menu as fallback
    this.model = [
      {
        label: 'Home',
        items: [
          { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/app/dashboard'] }
        ]
      },
      {
        label: 'Manage',
        items: [
          { label: 'User', icon: 'pi pi-fw pi-user', routerLink: ['/app/manage/user'] }
        ]
      },
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          {
            label: 'Landing',
            icon: 'pi pi-fw pi-globe',
            routerLink: ['/app/landing']
          },
          {
            label: 'Auth',
            icon: 'pi pi-fw pi-user',
            items: [
              {
                label: 'Login',
                icon: 'pi pi-fw pi-sign-in',
                routerLink: ['/app/login']
              },
              {
                label: 'Error',
                icon: 'pi pi-fw pi-times-circle',
                routerLink: ['/app/notfound']
              },
              {
                label: 'Access Denied',
                icon: 'pi pi-fw pi-lock',
                routerLink: ['/auth/access']
              }
            ]
          }
        ]
      }
    ];
  }
}
