import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role.model';
import { PaginatedResponse } from '../../models/paginated-response';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
})
export class ManageRolesComponent implements OnInit, OnDestroy {
  @ViewChild('table') dt!: Table;

  roles: Role[] = [];
  roleDialog = false;
  deleteRoleDialog = false;
  deleteRolesDialog = false;
  role: Role = {};
  selectedRoles: Role[] = [];
  submitted = false;
  loading = false;

  // Pagination variables
  first = 0;
  rows = 10;
  totalRecords = 0;
  rowsPerPageOptions = [5, 10, 20];

  // Sorting and search variables
  sortField?: string;
  sortOrder?: number; // 1 for asc, -1 for desc, 0 for none
  globalFilter = '';

  // Column definitions
  cols: any[] = [];

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor(private roleService: RoleService, private messageService: MessageService) { }

  ngOnInit() {
    console.log('Initializing roles component');

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchTerm => {
      // Reset to first page when searching
      this.first = 0;
      // Update the filter and reload data
      this.globalFilter = searchTerm;
      this.loadRoles();
    });

    this.loadRoles();
    this.cols = [
      { field: 'name', header: 'Name' }];
  }

  loadRoles() {
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
    this.roleService.getRoles(
    ).subscribe({
      next: (response: Role[]) => {
        this.roles = response;
        this.totalRecords = response.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load roles',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.role = {};
    this.submitted = false;
    this.roleDialog = true;
  }

  editRole(role: Role) {
    this.role = { ...role };
    this.roleDialog = true;
  }

  deleteRole(role: Role) {
    this.deleteRoleDialog = true;
    this.role = { ...role };
  }

  confirmDelete() {
    this.deleteRoleDialog = false;

    if (this.role.id) {
      this.roleService.deleteRole(this.role.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Role Deleted',
            life: 3000
          });
          this.loadRoles(); // Reload the data
          this.role = {};
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete role',
            life: 3000
          });
        }
      });
    }
  }

  deleteSelectedRoles() {
    this.deleteRolesDialog = true;
  }

  confirmDeleteSelected() {
    this.deleteRolesDialog = false;

    // Get IDs of selected roles
    const idsToDelete = this.selectedRoles.map(role => role.id).filter(id => id !== undefined) as string[];

    // Delete all selected roles
    const deletePromises = idsToDelete.map(id =>
      this.roleService.deleteRole(id).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Roles Deleted',
        life: 3000
      });
      this.loadRoles(); // Reload the data
      this.selectedRoles = [];
    }).catch(error => {
      console.error('Error deleting roles:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete selected roles',
        life: 3000
      });
    });
  }

  hideDialog() {
    this.roleDialog = false;
    this.submitted = false;
  }

  saveRole() {
    this.submitted = true;

    if (this.role.name?.trim()) {
      if (this.role.id) {
        // Update existing role
        this.roleService.updateRole(this.role.id, this.role).subscribe({
          next: (updatedRole) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Role Updated',
              life: 3000
            });
            this.loadRoles(); // Reload the data
            this.roleDialog = false;
            this.role = {};
          },
          error: (error) => {
            console.error('Error updating role:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update role',
              life: 3000
            });
          }
        });
      } else {
        // Create new role
        this.roleService.createRole(this.role).subscribe({
          next: (newRole) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Role Created',
              life: 3000
            });
            this.loadRoles(); // Reload the data
            this.roleDialog = false;
            this.role = {};
          },
          error: (error) => {
            console.error('Error creating role:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create role',
              life: 3000
            });
          }
        });
      }
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
    this.loadRoles();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadRoles();
  }

  ngOnDestroy() {
    // Unsubscribe from the search subject to prevent memory leaks
    this.searchSubject.complete();
  }
}
