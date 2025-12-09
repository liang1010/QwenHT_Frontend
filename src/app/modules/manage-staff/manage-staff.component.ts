import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { StaffService } from '../../services/staff.service';
import { PaginatedResponse } from '../../models/paginated-response';
import { Staff } from '../../models/staff.model';
import { OptionValueService } from '../../services/option-value.service';
import { OptionValue } from '../../models/option-value.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-manage-staff',
  templateUrl: './manage-staff.component.html',
  styleUrl: './manage-staff.component.scss'
})
export class ManageStaffComponent implements OnInit, OnDestroy {
  @ViewChild(Table) dt!: Table;
  staffDialog: boolean = false;

  deleteStaffDialog: boolean = false;

  deleteStaffsDialog: boolean = false;

  staffs: Staff[] = [];

  staff: Staff = {};

  selectedStaffs: Staff[] = [];

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

  // Option values for autocomplete
  availableNationalities: string[] = [];
  availableOutlets: string[] = [];
  availableTypes: string[] = [];
  availableHostels: string[] = [];
  availableBanks: string[] = [];
  availableGender: string[] = [];

  // Filtered option values for autocomplete
  filteredNationalities: string[] = [];
  filteredOutlets: string[] = [];
  filteredTypes: string[] = [];
  filteredHostels: string[] = [];
  filteredBanks: string[] = [];
  filteredGender: string[] = [];

  staffForm: FormGroup;

  constructor(
    private staffService: StaffService,
    private optionValueService: OptionValueService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.staffForm = this.createStaffForm();
  }

  private createStaffForm(): FormGroup {
    return this.formBuilder.group({
      id: [''],
      fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      nickName: [''],
      gender: [''],
      phoneNo: ['', [Validators.pattern(/^[\d\-\s\+\(\)]+$/)]],
      nationality: [''],
      hostelName: [''],
      hostelRoom: [''],
      reference: [''],
      outlet: [''],
      type: [''],
      checkIn: [null],
      checkOut: [null],
      footRatePerHour: [null, [Validators.min(0)]],
      bodyRatePerHour: [null, [Validators.min(0)]],
      commissionBasePercentage: [null, [Validators.min(0), Validators.max(100)]],
      guaranteeIncome: [null, [Validators.min(0)]],
      bankName: [''],
      accountHolderName: [''],
      accountNumber: ['', [Validators.pattern(/^\d+$/)]],
      status: [1, [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('Initializing staff component');

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after the user stops typing
      distinctUntilChanged() // Only emit if the value has changed
    ).subscribe(searchTerm => {
      // Reset to first page when searching
      this.first = 0;
      // Update the filter and reload data
      this.globalFilter = searchTerm;
      this.loadStaff();
    });

    this.loadStaff();
    this.loadOptionValues(); // Load option values for autocomplete
    this.cols = [
      { field: 'fullName', header: 'Full Name' },
      { field: 'nickName', header: 'Nick Name' },
      { field: 'phoneNo', header: 'Phone No' },
      { field: 'nationality', header: 'Nationality' },
      { field: 'type', header: 'Type' },
      { field: 'status', header: 'Status' }
    ];
  }

  loadOptionValues() {
    // Load all option value categories once at initialization
    this.availableGender = ['Male', 'Female'];
    this.filteredGender = [...this.availableGender]; // Initialize filtered with all options

    this.optionValueService.getOptionValues('Nationality').subscribe({
      next: (options) => {
        this.availableNationalities = options.map(x => x.value).filter(value => value !== undefined) as string[];
        this.filteredNationalities = [...this.availableNationalities]; // Initialize filtered with all options
      },
      error: (error) => console.error('Error loading nationalities:', error)
    });

    this.optionValueService.getOptionValues('Outlet').subscribe({
      next: (options) => {
        this.availableOutlets = options.map(x => x.value).filter(value => value !== undefined) as string[];
        this.filteredOutlets = [...this.availableOutlets]; // Initialize filtered with all options
      },
      error: (error) => console.error('Error loading outlets:', error)
    });

    this.optionValueService.getOptionValues('Type').subscribe({
      next: (options) => {
        this.availableTypes = options.map(x => x.value).filter(value => value !== undefined) as string[];
        this.filteredTypes = [...this.availableTypes]; // Initialize filtered with all options
      },
      error: (error) => console.error('Error loading types:', error)
    });

    this.optionValueService.getOptionValues('Hostel').subscribe({
      next: (options) => {
        this.availableHostels = options.map(x => x.value).filter(value => value !== undefined) as string[];
        this.filteredHostels = [...this.availableHostels]; // Initialize filtered with all options
      },
      error: (error) => console.error('Error loading hostels:', error)
    });

    this.optionValueService.getOptionValues('Bank').subscribe({
      next: (options) => {
        this.availableBanks = options.map(x => x.value).filter(value => value !== undefined) as string[];
        this.filteredBanks = [...this.availableBanks]; // Initialize filtered with all options
      },
      error: (error) => console.error('Error loading banks:', error)
    });
  }

  searchGender(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredGender = this.availableGender.filter(gender =>
        gender.toLowerCase().includes(query)
      );
    } else {
      this.filteredGender = [...this.availableGender];
    }
  }

  searchNationalities(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredNationalities = this.availableNationalities.filter(nationality =>
        nationality.toLowerCase().includes(query)
      );
    } else {
      this.filteredNationalities = [...this.availableNationalities];
    }
  }

  searchOutlets(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredOutlets = this.availableOutlets.filter(outlet =>
        outlet.toLowerCase().includes(query)
      );
    } else {
      this.filteredOutlets = [...this.availableOutlets];
    }
  }

  searchTypes(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredTypes = this.availableTypes.filter(type =>
        type.toLowerCase().includes(query)
      );
    } else {
      this.filteredTypes = [...this.availableTypes];
    }
  }

  searchHostels(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredHostels = this.availableHostels.filter(hostel =>
        hostel.toLowerCase().includes(query)
      );
    } else {
      this.filteredHostels = [...this.availableHostels];
    }
  }

  searchBanks(event: any) {
    // Filter the already-loaded options on the client side
    if (event.query && event.query.length >= 1) {
      const query = event.query.toLowerCase();
      this.filteredBanks = this.availableBanks.filter(bank =>
        bank.toLowerCase().includes(query)
      );
    } else {
      this.filteredBanks = [...this.availableBanks];
    }
  }

  loadStaff() {
    this.loading = true;

    // Use the paginated endpoint with parameters
    // Calculate the page number from first and rows
    const pageNumber = Math.floor(this.first / this.rows) + 1;

    console.log('Loading staff, page:', pageNumber, 'rows:', this.rows, 'first:', this.first, 'sortOrder:', this.sortOrder);

    // Determine the sort direction: -1 for desc, 1 for asc, 0 or undefined for default
    let sortDirection: string | undefined;
    if (this.sortOrder === -1) {
      sortDirection = 'desc';
    } else if (this.sortOrder === 1) {
      sortDirection = 'asc';
    }
    // If sortOrder is 0 or undefined, we'll pass undefined to use backend default

    // Don't use the debounced search for regular pagination/sorting
    this.staffService.getStaffPaginated(
      pageNumber,
      this.rows,
      this.sortField,
      sortDirection,
      this.globalFilter
    ).subscribe({
      next: (response: PaginatedResponse<Staff>) => {
        console.log('Staff loaded:', response);
        this.staffs = response.data;
        this.totalRecords = response.totalCount;
        console.log('Total records set to:', this.totalRecords);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load staff',
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
    this.loadStaff();
  }

  openNew() {
    this.submitted = false;

    // Reset form to initial values
    this.staffForm.reset();
    this.staffForm.patchValue({
      status: 1 // Default to active
    });

    // Reset filtered options to show all when opening the dialog
    this.resetFilteredOptions();

    this.staffDialog = true;
  }

  deleteSelectedStaffs() {
    this.deleteStaffsDialog = true;
  }

  resetFilteredOptions() {
    // Reset all filtered options to show all available options
    this.filteredNationalities = [...this.availableNationalities];
    this.filteredOutlets = [...this.availableOutlets];
    this.filteredTypes = [...this.availableTypes];
    this.filteredHostels = [...this.availableHostels];
    this.filteredBanks = [...this.availableBanks];
  }

  editStaff(staff: Staff) {
    // Reset filtered options to show all when opening the dialog
    this.resetFilteredOptions();

    // Patch form with existing values
    this.staffForm.patchValue({
      id: staff.id,
      fullName: staff.fullName || '',
      nickName: staff.nickName || '',
      gender: staff.gender || '',
      phoneNo: staff.phoneNo || '',
      nationality: staff.nationality || '',
      hostelName: staff.hostelName || '',
      hostelRoom: staff.hostelRoom || '',
      reference: staff.reference || '',
      outlet: staff.outlet || '',
      type: staff.type || '',
      checkIn: staff.checkIn ? new Date(staff.checkIn) : null,
      checkOut: staff.checkOut ? new Date(staff.checkOut) : null,
      footRatePerHour: staff.footRatePerHour || null,
      bodyRatePerHour: staff.bodyRatePerHour || null,
      commissionBasePercentage: staff.commissionBasePercentage || null,
      guaranteeIncome: staff.guaranteeIncome || null,
      bankName: staff.bankName || '',
      accountHolderName: staff.accountHolderName || '',
      accountNumber: staff.accountNumber || '',
      status: staff.status || 1
    });

    this.staffDialog = true;
  }

  deleteStaff(staff: Staff) {
    this.deleteStaffDialog = true;
    this.staff = { ...staff };
  }

  confirmDeleteSelected() {
    const staffIds = this.selectedStaffs.map(s => s.id).filter(Boolean) as string[];
    this.deleteStaffsDialog = false;

    // Delete selected staffs
    const deletePromises = staffIds.map(staffId =>
      this.staffService.deleteStaff(staffId).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Staff Deleted',
        life: 3000
      });
      this.loadStaff(); // Reload the data
      this.selectedStaffs = [];
    }).catch(error => {
      console.error('Error deleting staff:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete staff',
        life: 3000
      });
    });
  }

  confirmDelete() {
    this.deleteStaffDialog = false;

    if (this.staff.id) {
      this.staffService.deleteStaff(this.staff.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Staff Deleted',
            life: 3000
          });
          this.loadStaff(); // Reload the data
          this.staff = {};
        },
        error: (error) => {
          console.error('Error deleting staff:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete staff',
            life: 3000
          });
        }
      });
    }
  }

  hideDialog() {
    this.staffDialog = false;
    this.submitted = false;
    this.staffForm.reset();
  }

  saveStaff() {
    this.submitted = true;

    if (this.staffForm.valid) {
      // Create a copy of staff with properly formatted dates for the API
      const staffToSave = {
        ...this.staffForm.value,
        // Ensure dates are properly formatted for the API - use undefined instead of null
        checkIn: this.staffForm.value.checkIn ? new Date(this.staffForm.value.checkIn) : null,
        checkOut: this.staffForm.value.checkOut ? new Date(this.staffForm.value.checkOut) : null
      };

      if (this.staffForm.value.id) {
        // Update existing staff
        this.staffService.updateStaff(this.staffForm.value.id, staffToSave).subscribe({
          next: (updatedStaff) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff Updated',
              life: 3000
            });
            this.loadStaff(); // Reload the data
            this.staffDialog = false;
            this.staffForm.reset();
          },
          error: (error) => {
            console.error('Error updating staff:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update staff',
              life: 3000
            });
          }
        });
      } else {
        // Create new staff
        this.staffService.createStaff(staffToSave).subscribe({
          next: (newStaff) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Staff Created',
              life: 3000
            });
            this.loadStaff(); // Reload the data
            this.staffDialog = false;
            this.staffForm.reset();
          },
          error: (error) => {
            console.error('Error creating staff:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create staff',
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
    Object.keys(this.staffForm.controls).forEach(key => {
      const control = this.staffForm.get(key);
      control?.markAsTouched();
    });
  }

  get fullName() {
    return this.staffForm.get('fullName');
  }

  get phoneNo() {
    return this.staffForm.get('phoneNo');
  }

  get accountNumber() {
    return this.staffForm.get('accountNumber');
  }

  onGlobalFilter(table: Table, event: Event) {
    this.globalFilter = (event.target as HTMLInputElement).value;
    // Emit the search term to the debounced search subject
    this.searchSubject.next(this.globalFilter);
  }

  customExportCSV() {
    if (Array.isArray(this.staffs)) {
      // Format data for CSV export with flattened related information
      const csvData = this.staffs.map(staff => ({
        'Full Name': staff.fullName || '',
        'Nick Name': staff.nickName || '',
        'Phone Number': staff.phoneNo || '',
        'Nationality': staff.nationality || '',
        'Hostel Name': staff.hostelName || '',
        'Hostel Room': staff.hostelRoom || '',
        'Reference': staff.reference || '',
        'Outlet': staff.outlet || '',
        'Type': staff.type || '',
        'Check In': staff.checkIn ? new Date(staff.checkIn).toLocaleDateString() : '',
        'Check Out': staff.checkOut ? new Date(staff.checkOut).toLocaleDateString() : '',
        'Foot Rate Per Hour': staff.footRatePerHour || '',
        'Body Rate Per Hour': staff.bodyRatePerHour || '',
        'Commission Base Percentage': staff.commissionBasePercentage || '',
        'Guarantee Income': staff.guaranteeIncome || '',
        'Bank Name': staff.bankName || '',
        'Account Holder Name': staff.accountHolderName || '',
        'Account Number': staff.accountNumber || '',
        'Status': this.getStatusText(staff.status),
        'Created At': staff.createdAt ? new Date(staff.createdAt).toLocaleString() : ''
      }));

      // Generate CSV
      this.generateCSV(csvData);
    }

  }

  private generateCSV(data: any[]) {
    if (!data || data.length === 0) {
      return;
    }

    // Create CSV content
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape commas and wrap in quotes if needed
          if (value && (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n'))) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `staff-export-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getStatusText(status: number | boolean | undefined): string {
    if (typeof status === 'boolean') {
      return status ? 'Active' : 'Inactive';
    }
    if (typeof status === 'number') {
      return status === 1 ? 'Active' : 'Inactive';
    }
    return 'Inactive';
  }

  ngOnDestroy() {
    // Unsubscribe from the search subject to prevent memory leaks
    this.searchSubject.complete();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadStaff();
  }

  // getStatusText(status: number): string {
  //   return status === 1 ? 'Active' : 'Inactive';
  // }

  getStatusSeverity(status: number): string {
    return status === 1 ? 'success' : 'danger';
  }
}
