import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { NavigationService } from '../../../services/navigation.service';
import { NavigationItem } from '../../../models/navigation-item.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { NavigationFormComponent } from '../navigation-form/navigation-form.component';
import { NavigationRoleFormComponent } from '../navigation-role-form/navigation-role-form.component';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-navigation-list',
  templateUrl: './navigation-list.component.html',
})
export class NavigationListComponent implements OnInit {
  navigationItems: TreeNode[] = [];
  allNavigationItems: NavigationItem[] = [];
  loading: boolean = true;
  cols: any[] = [];

  constructor(
    private navigationService: NavigationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'route', header: 'Route' },
      { field: 'icon', header: 'Icon' },
      { field: 'order', header: 'Order' },
      { field: 'isVisible', header: 'Visible' }
    ];

    this.loadNavigationItems();
    this.loadRoles();
  }

  loadNavigationItems(): void {
    this.loading = true;
    this.navigationService.getAllNavigation().subscribe({
      next: (items) => {
        this.allNavigationItems = items;
        this.navigationItems = this.convertToTree(items);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading navigation items:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load navigation items' });
        this.loading = false;
      }
    });
  }

  convertToTree(items: NavigationItem[]): TreeNode[] {
    // Create a map of all items by their id for quick lookup
    const itemMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First, create TreeNode objects for all items without children
    items.forEach(item => {
      const node: TreeNode = {
        data: item,
        label: item.name,
        children: []
      };
      itemMap.set(item.id, node);
    });

    // Then, establish parent-child relationships
    items.forEach(item => {
      const node = itemMap.get(item.id)!;

      if (item.parentId && itemMap.has(item.parentId)) {
        // If item has a parent, add it to the parent's children
        const parentNode = itemMap.get(item.parentId)!;
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(node);
      } else {
        // If item has no parent, it's a root node
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  addNavigationItem(): void {
    const ref = this.dialogService.open(NavigationFormComponent, {
      header: 'Add Navigation Item',
      width: '60%',
      contentStyle: { 'max-height': '80%', 'overflow': 'auto' },
      baseZIndex: 999,
      data: {
        allNavigationItem: this.allNavigationItems // Pass the flat array of navigation items for parent selection
      }
    });

    ref.onClose.subscribe((result: NavigationItem) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Navigation item added successfully' });
        this.loadNavigationItems();
      }
    });
  }

  editNavigationItem(node: TreeNode): void {
    if (!node.data) return;
    const item = node.data as NavigationItem;

    const ref = this.dialogService.open(NavigationFormComponent, {
      header: 'Edit Navigation Item',
      width: '60%',
      contentStyle: { 'max-height': '80%', 'overflow': 'auto' },
      baseZIndex: 999,
      data: {
        item: item,
        allNavigationItem: this.allNavigationItems // Pass the flat array of navigation items for parent selection
      }
    });

    ref.onClose.subscribe((result: NavigationItem) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Navigation item updated successfully' });
        this.loadNavigationItems();
      }
    });
  }


  assignRoles(node: TreeNode): void {
    if (!node.data) return;
    const item = node.data as NavigationItem;

    // Create a copy of the item to ensure no issues with the original object
    const itemCopy = { ...item };
    const ref = this.dialogService.open(NavigationRoleFormComponent, {
      header: 'Assign Roles to Navigation Item',
      width: '60%',
      contentStyle: { 'max-height': '80%', 'overflow': 'auto' },
      baseZIndex: 999,
      data: {
        item: itemCopy,
        availableRoles: this.availableRoles
      }
    });

    ref.onClose.subscribe((result: boolean) => {
      if (result) {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Roles assigned successfully' });
      }
    });
  }

  deleteNavigationItem(node: TreeNode): void {
    if (!node.data) return;
    const id = (node.data as NavigationItem).id;

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this navigation item?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.navigationService.deleteNavigationItem(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Navigation item deleted successfully' });
            this.loadNavigationItems();
          },
          error: (error) => {
            console.error('Error deleting navigation item:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete navigation item' });
          }
        });
      }
    });
  }

  availableRoles: string[] = []

  loadRoles() {
    this.userService.getRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles.map(role => role.name!).filter((name): name is string => name !== undefined);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles',
          life: 3000
        });
        // Fallback to default roles if API call fails
        // this.availableRoles = ['Admin', 'User', 'Manager'];
      }
    });
  }
}
