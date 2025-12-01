import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../models/menu.model';
import { PaginatedResponse } from '../../models/paginated-response';

@Component({
  selector: 'app-manage-menus',
  templateUrl: './manage-menus.component.html',
})
export class ManageMenusComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt: Table | undefined;

  menus: Menu[] = [];
  menuDialog = false;
  deleteMenuDialog = false;
  deleteMenusDialog = false;
  menu: Menu = {};
  selectedMenus: Menu[] = [];
  submitted = false;
  loading = false;

  // Pagination variables
  first = 0;
  rows = 10;
  totalRecords = 0;
  rowsPerPageOptions = [5, 10, 20, { showAll: 'All' }];

  // Sorting and search variables
  sortField: string | undefined;
  sortOrder: number | undefined; // 1 for asc, -1 for desc, 0 for none
  globalFilter = '';

  // Column definitions
  cols: any[] = [];

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor(private menuService: MenuService, private messageService: MessageService) { }

  ngOnInit() {
    console.log('Initializing menu component');

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchTerm => {
      // Reset to first page when searching
      this.first = 0;
      // Update the filter and reload data
      this.globalFilter = searchTerm;
      this.loadMenus();
    });

    this.loadMenus();
    this.cols = [
      { field: 'code', header: 'Code' },
      { field: 'description', header: 'Description' },
      { field: 'category', header: 'Category' },
      { field: 'footMins', header: 'Foot Mins' },
      { field: 'bodyMins', header: 'Body Mins' },
      { field: 'staffCommission', header: 'StaffCommission' },
      { field: 'extraCommission', header: 'ExtraCommission' },
      { field: 'price', header: 'Price' },
      { field: 'status', header: 'Status' }
    ];
  }

  loadMenus() {
    this.loading = true;

    // Calculate the page number from first and rows
    const pageNumber = Math.floor(this.first / this.rows) + 1;

    // Determine the sort direction: -1 for desc, 1 for asc, undefined for default
    let sortDirection: string | undefined;
    if (this.sortOrder === -1) {
      sortDirection = 'desc';
    } else if (this.sortOrder === 1) {
      sortDirection = 'asc';
    }

    // Use the paginated endpoint with parameters
    this.menuService.getMenusPaginated(
      pageNumber,
      this.rows,
      this.sortField,
      sortDirection,
      this.globalFilter
    ).subscribe({
      next: (response: PaginatedResponse<Menu>) => {
        this.menus = response.data;
        this.totalRecords = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load menus',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.menu = {
      status: 1, // Default to active (1 = Active, 0 = Inactive)
      footMins: 0,
      bodyMins: 0,
      staffCommission: 0,
      extraCommission: 0,
      price: 0
    };
    this.submitted = false;
    this.menuDialog = true;
  }

  editMenu(menu: Menu) {
    this.menu = { ...menu };
    // Convert UTC dates to local timezone for the calendar components
    if (this.menu.createdAt) {
      this.menu.createdAt = new Date(this.menu.createdAt);
    }
    if (this.menu.lastUpdated) {
      this.menu.lastUpdated = new Date(this.menu.lastUpdated);
    }
    this.menuDialog = true;
  }

  deleteMenu(menu: Menu) {
    this.deleteMenuDialog = true;
    this.menu = { ...menu };
  }

  confirmDelete() {
    this.deleteMenuDialog = false;

    if (this.menu.id) {
      this.menuService.deleteMenu(this.menu.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Menu Deleted',
            life: 3000
          });
          this.loadMenus(); // Reload the data
          this.menu = {};
        },
        error: (error) => {
          console.error('Error deleting menu:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete menu',
            life: 3000
          });
        }
      });
    }
  }

  deleteSelectedMenus() {
    this.deleteMenusDialog = true;
  }

  confirmDeleteSelected() {
    this.deleteMenusDialog = false;

    // Get IDs of selected menus
    const idsToDelete = this.selectedMenus.map(menu => menu.id).filter(id => id !== undefined) as string[];

    // Delete all selected menus
    const deletePromises = idsToDelete.map(id =>
      this.menuService.deleteMenu(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Menus Deleted',
        life: 3000
      });
      this.loadMenus(); // Reload the data
      this.selectedMenus = [];
    }).catch(error => {
      console.error('Error deleting menus:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete selected menus',
        life: 3000
      });
    });
  }

  hideDialog() {
    this.menuDialog = false;
    this.submitted = false;
  }

  saveMenu() {
    this.submitted = true;

    // Validate required fields
    if (this.menu.code?.trim() && this.menu.description?.trim() && this.menu.category?.trim() && this.menu.price !== undefined) {
      if (this.menu.id) {
        // Update existing menu
        this.menuService.updateMenu(this.menu.id, this.menu).subscribe({
          next: (updatedMenu) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Menu Updated',
              life: 3000
            });
            this.loadMenus(); // Reload the data
            this.menuDialog = false;
            this.menu = {};
          },
          error: (error) => {
            console.error('Error updating menu:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update menu',
              life: 3000
            });
          }
        });
      } else {
        // Create new menu
        this.menuService.createMenu(this.menu).subscribe({
          next: (newMenu) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Menu Created',
              life: 3000
            });
            this.loadMenus(); // Reload the data
            this.menuDialog = false;
            this.menu = {};
          },
          error: (error) => {
            console.error('Error creating menu:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create menu',
              life: 3000
            });
          }
        });
      }
    } else {
      // Show validation error
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Code, Description, Category, and Price are required fields',
        life: 3000
      });
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    // Emit the search term to the debounced search subject
    this.searchSubject.next(searchTerm);
  }

  onPage(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadMenus();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadMenus();
  }

  ngOnDestroy() {
    // Unsubscribe from the search subject to prevent memory leaks
    this.searchSubject.complete();
  }
}
