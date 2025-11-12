import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { UserService, User, PaginatedResponse } from '../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users: User[] = []; // Current page users
  totalUsers = 0; // Total count of users
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'roles'];

  // Pagination properties
  pageSize = 5; // Fixed at 5 records per page
  pageSizeOptions: number[] = [5]; // Only allow 5 records per page
  currentPage = 0; // 0-indexed

  // Sorting properties
  sortField: string = '';
  sortDirection: 'asc' | 'desc' | '' = '';

  // Form properties
  userForm: FormGroup;
  isEditing = false; // Tracks if we're currently in add/edit mode
  selectedUser: User | null = null; // The currently selected user
  currentUser: User | null = null; // The user being edited (for form operations)
  
  // Search properties
  searchTerm = '';
  isAdmin: boolean = false;
  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Initialize the form
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      roles: [[], Validators.required]
    });
    this.isAdmin = authService.hasRole('Admin');
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Helper method to enable/disable form controls based on edit mode
  private updateFormState(): void {
    if (this.isEditing) {
      this.userForm.enable();
    } else {
      this.userForm.disable();
    }
  }



  loadUsers(): void {
    // Try the paginated API first
    this.userService.getUsersPaginated(
      this.currentPage + 1,
      this.pageSize,
      this.sortField || undefined,
      this.sortDirection || undefined,
      this.searchTerm || undefined
    ).subscribe({
      next: (response: PaginatedResponse<User>) => {
        // Success with paginated API
        this.users = response.data;
        this.totalUsers = response.totalCount;

        // Update paginator after data load
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = this.totalUsers;
            this.paginator.pageIndex = this.currentPage;
            this.paginator.pageSize = this.pageSize;
          }
        });

        // Select the first item if available
        if (this.users.length > 0) {
          this.selectUser(this.users[0]);
        } else {
          this.selectedUser = null;
          this.currentUser = null;
          this.userForm.reset();
        }

        // Update form state based on whether we're editing
        this.updateFormState();
      },
      error: (error) => {
        // If paginated API fails, fall back to client-side pagination
        console.error('Error loading users:', error);
        alert('Error loading users. Please try again later.');
        
        // In case of complete failure, reset to empty state
        this.users = [];
        this.totalUsers = 0;
        
        // Update paginator after data load
        setTimeout(() => {
          if (this.paginator) {
            this.paginator.length = this.totalUsers;
            this.paginator.pageIndex = this.currentPage;
            this.paginator.pageSize = this.pageSize;
          }
        });
        
        // Clear selection and form
        this.selectedUser = null;
        this.currentUser = null;
        this.userForm.reset();
        
        // Update form state based on whether we're editing
        this.updateFormState();
      }
    });
  }

  // Server-side sorting
  onSort(field: string): void {
    if (this.sortField === field) {
      // If clicking the same field, toggle direction
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        // If was descending, clear sorting
        this.sortField = '';
        this.sortDirection = '';
      } else {
        // If was unsorted, start with ascending
        this.sortDirection = 'asc';
      }
    } else {
      // If clicking a different field, sort by that field ascending
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    // Reset to first page when sorting
    this.currentPage = 0;

    // Load sorted data from server
    this.loadUsers();
  }

  // Server-side pagination change
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers(); // Load new page from server
  }

  // Row selection methods
  onRowClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Only allow selection if clicking on the row itself, not on buttons or icons
    if (!target.closest('button, mat-icon, .mat-mdc-icon-button, .mat-button')) {
      // Find the closest row element
      const rowElement = target.closest('tr');
      if (rowElement && !rowElement.classList.contains('mat-header-row')) {
        // Get the row index relative to the table body
        const tableBody = rowElement.closest('tbody');
        if (tableBody) {
          const rowIndex = Array.from(tableBody.children).indexOf(rowElement);
          if (rowIndex >= 0 && rowIndex < this.users.length) {
            const user = this.users[rowIndex];
            this.selectUser(user);
          }
        }
      }
    }
  }

  selectUser(user: User): void {
    // If we're currently editing, don't change the selection
    if (this.isEditing) {
      return;
    }

    this.selectedUser = user;
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles
    });
    this.currentUser = { ...user }; // Store a copy for form operations
    this.updateFormState(); // Disable form when viewing (not editing)
  }

  // Form methods
  onAddUser(): void {
    this.isEditing = true;
    this.selectedUser = null;
    this.currentUser = null;
    this.userForm.reset();
    this.updateFormState(); // Enable form when adding
  }

  onEditUser(user: User | null): void {
    if (!user) {
      alert('Please select a user to edit');
      return;
    }

    this.isEditing = true;
    this.selectedUser = user;
    this.currentUser = { ...user }; // Create a copy to avoid modifying original
    this.userForm.patchValue({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles
    });
    this.updateFormState(); // Enable form when editing
  }

  onDeleteUser(id: string | undefined): void {
    if (!id) {
      alert('Please select a user to delete');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          // Refresh the user list from the API
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user');
        }
      });
    }
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      if (this.currentUser) {
        // Update existing user
        this.userService.updateUser(this.currentUser.id!, { ...this.currentUser, ...formData }).subscribe({
          next: (updatedUser) => {
            // Refresh the user list from the API
            this.loadUsers();
            this.isEditing = false;
            this.currentUser = null;
          },
          error: (error) => {
            console.error('Error updating user:', error);
            alert('Error updating user');
          }
        });
      } else {
        // Create new user
        this.userService.createUser(formData).subscribe({
          next: (newUser) => {
            // Refresh the user list from the API
            this.loadUsers();
            this.isEditing = false;
          },
          error: (error) => {
            console.error('Error creating user:', error);
            alert('Error creating user');
          }
        });
      }
    }
  }

  onCancel(): void {
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset();

    // Refresh the user list from the API to ensure data consistency
    this.loadUsers();
  }

  // Legacy methods (can be removed after confirming new implementation works)
  openAddUserDialog(): void {
    // This method is no longer used since we're using the form directly
  }

  openEditUserDialog(user: User): void {
    // This method is no longer used since we're using the form directly
  }

  deleteUser(id: string): void {
    // Using the new method name
    this.onDeleteUser(id);
  }

  onChangePassword(): void {
    if (!this.selectedUser) {
      alert('Please select a user to change password');
      return;
    }

    // For admin changing another user's password, we typically don't need current password
    // In a real scenario, you might have different logic for admin vs self-password change
    const newPassword = prompt('Enter new password for ' + this.selectedUser.firstName + ' ' + this.selectedUser.lastName + ':');
    if (!newPassword) {
      return; // User cancelled
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    const confirmNewPassword = prompt('Confirm new password:');
    if (!confirmNewPassword) {
      return; // User cancelled
    }

    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match');
      return;
    }

    // Call the service to change password
    this.userService.changePassword(this.selectedUser.id!, '', newPassword, confirmNewPassword).subscribe({
      next: (response) => {
        console.log('Password changed successfully', response);
        alert('Password changed successfully for ' + this.selectedUser!.firstName + ' ' + this.selectedUser!.lastName);
      },
      error: (error) => {
        console.error('Error changing password:', error);
        alert('Error changing password: ' + (error.error?.Error || error.error?.message || error.message || 'Unknown error'));
      }
    });
  }
  
  onSearch(): void {
    // Reload users with search term
    this.loadUsers(); // This will be updated to include search parameters
  }
  
  onClearSearch(): void {
    this.searchTerm = '';
    this.loadUsers(); // Reload without search filter
  }
}