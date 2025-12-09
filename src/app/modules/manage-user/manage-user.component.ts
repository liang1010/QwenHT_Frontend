import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user.service';
import { PaginatedResponse } from '../../models/paginated-response';
import { AppChangePasswordDialogComponent } from '../../layout/app-change-password-dialog/app-change-password-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { User } from '../../models/user-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss'
})
export class ManageUserComponent implements OnInit, OnDestroy {
  @ViewChild(Table) dt!: Table;
  userDialog: boolean = false;

  deleteUserDialog: boolean = false;

  deleteUsersDialog: boolean = false;

  users: User[] = [];

  user: User = {};

  selectedUsers: User[] = [];

  submitted: boolean = false;

  cols: any[] = [];

  statuses: any[] = [];

  rowsPerPageOptions = [5, 10, 20, { showAll: 'All' }];

  // Pagination variables
  first = 0;
  rows = 10;
  totalRecords = 0;
  loading = false;

  // Sorting and search variables
  sortField: string | undefined;
  sortOrder: number | undefined;
  globalFilter = '';

  // Subject for debounced search
  private searchSubject = new Subject<string>();

  // Roles for selection
  availableRoles: string[] = [];

  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private formBuilder: FormBuilder
  ) {
    this.userForm = this.createUserForm();
  }

  private createUserForm(): FormGroup {
    return this.formBuilder.group({
      id: [],
      userName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      roles: [[]],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('Initializing component');

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchTerm => {
      // Reset to first page when searching
      this.first = 0;
      // Update the filter and reload data
      this.globalFilter = searchTerm;
      this.loadUsers();
    });

    this.loadRoles();
    this.loadUsers();
    this.cols = [
      { field: 'email', header: 'Email' },
      { field: 'firstName', header: 'First Name' },
      { field: 'lastName', header: 'Last Name' },
      { field: 'roles', header: 'Roles' },
      { field: 'isActive', header: 'Active' }
    ];
  }

  loadUsers() {
    this.loading = true;

    // Use the paginated endpoint with parameters
    // Calculate the page number from first and rows
    const pageNumber = Math.floor(this.first / this.rows) + 1;

    console.log('Loading users, page:', pageNumber, 'rows:', this.rows, 'first:', this.first, 'sortOrder:', this.sortOrder);

    // Determine the sort direction: -1 for desc, 1 for asc, 0 or undefined for default
    let sortDirection: string | undefined;
    if (this.sortOrder === -1) {
      sortDirection = 'desc';
    } else if (this.sortOrder === 1) {
      sortDirection = 'asc';
    }
    // If sortOrder is 0 or undefined, we'll pass undefined to use backend default

    // Don't use the debounced search for regular pagination/sorting
    this.userService.getUsersPaginated(
      pageNumber,
      this.rows,
      this.sortField,
      sortDirection,
      this.globalFilter
    ).subscribe({
      next: (response: PaginatedResponse<User>) => {
        console.log('Users loaded:', response);
        this.users = response.data;
        this.totalRecords = response.totalCount;
        console.log('Total records set to:', this.totalRecords);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  onPage(event: any) {
    console.log('Page event:', event);
    this.first = event.first;
    this.rows = event.rows;
    this.loadUsers();
  }

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

  openNew() {
    this.submitted = false;
    this.userForm.reset();
    this.userForm.patchValue({
      isActive: true // Default to active
    });
    this.userDialog = true;
  }

  deleteSelectedUsers() {
    this.deleteUsersDialog = true;
  }

  editUser(user: User) {
    this.userForm.patchValue({
      id: user.id,
      userName: user.userName || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: user.roles || [],
      isActive: user.isActive ?? true
    });
    this.userDialog = true;
  }

  deleteUser(user: User) {
    this.deleteUserDialog = true;
    this.user = { ...user };
  }

  confirmDeleteSelected() {
    const userIds = this.selectedUsers.map(u => u.id).filter(Boolean) as string[];
    this.deleteUsersDialog = false;

    // Delete selected users
    const deletePromises = userIds.map(userId =>
      this.userService.deleteUser(userId).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Users Deleted',
        life: 3000
      });
      this.loadUsers(); // Reload the data
      this.selectedUsers = [];
    }).catch(error => {
      console.error('Error deleting users:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete users',
        life: 3000
      });
    });
  }

  confirmDelete() {
    this.deleteUserDialog = false;

    if (this.user.id) {
      this.userService.deleteUser(this.user.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'User Deleted',
            life: 3000
          });
          this.loadUsers(); // Reload the data
          this.user = {};
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete user',
            life: 3000
          });
        }
      });
    }
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
    this.userForm.reset();
  }

  saveUser() {
    this.submitted = true;

    if (this.userForm.valid) {
      const userToSave = {
        ...this.userForm.value
      };

      if (this.userForm.value.id) {
        // Update existing user
        this.userService.updateUser(this.userForm.value.id, userToSave).subscribe({
          next: (updatedUser) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Updated',
              life: 3000
            });
            this.loadUsers(); // Reload the data
            this.userDialog = false;
            this.userForm.reset();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update user',
              life: 3000
            });
          }
        });
      } else {
        // Create new user
        this.userService.createUser(userToSave).subscribe({
          next: (newUser) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'User Created',
              life: 3000
            });
            this.loadUsers(); // Reload the data
            this.userDialog = false;
            this.userForm.reset();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create user',
              life: 3000
            });
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  get userName() {
    return this.userForm.get('userName');
  }

  get email() {
    return this.userForm.get('email');
  }

  get firstName() {
    return this.userForm.get('firstName');
  }

  get lastName() {
    return this.userForm.get('lastName');
  }

  onGlobalFilter(table: Table, event: Event) {
    this.globalFilter = (event.target as HTMLInputElement).value;
    // Emit the search term to the debounced search subject
    this.searchSubject.next(this.globalFilter);
  }

  ngOnDestroy() {
    // Unsubscribe from the search subject to prevent memory leaks
    this.searchSubject.complete();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadUsers();
  }

  onPasswordChangeClick(userId: string) {
    this.dialogService.open(AppChangePasswordDialogComponent, {
      header: 'Change Password',
      width: '500px',
      contentStyle: { 'width': '500px', 'max-height': '600px', 'max-width': '500px', 'overflow': 'auto' },
      baseZIndex: 999,
      data: {
        userId: userId,
        fromAdmin: true
      }
    });
  }
}
