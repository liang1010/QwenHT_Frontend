import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Table } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { OptionValueService } from '../../services/option-value.service';
import { OptionValue } from '../../models/option-value.model';
import { PaginatedResponse } from '../../models/paginated-response';

@Component({
  selector: 'app-manage-option-values',
  templateUrl: './manage-option-values.component.html',
})
export class ManageOptionValuesComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt: Table | undefined;

  optionValues: OptionValue[] = [];
  groupedOptionValues: { [key: string]: OptionValue[] } = {};
  optionValueDialog = false;
  deleteOptionValueDialog = false;
  deleteOptionValuesDialog = false;
  optionValue: OptionValue = {};
  selectedOptionValues: OptionValue[] = [];
  submitted = false;
  loading = false;

  // Pagination variables
  first = 0;
  rows = 9999;
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

  constructor(
    private optionValueService: OptionValueService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    console.log('Initializing option values component');

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300) // Wait 300ms after the user stops typing
    ).subscribe(searchTerm => {
      // Reset to first page when searching
      this.first = 0;
      // Update the filter and reload data
      this.globalFilter = searchTerm;
      this.loadOptionValues();
    });

    this.loadOptionValues();
    this.cols = [
      { field: 'category', header: 'Category' },
      { field: 'value', header: 'Value' },
      { field: 'description', header: 'Description' },
      { field: 'isActive', header: 'Active' }
    ];
  }

  loadOptionValues() {
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
    this.optionValueService.getOptionValuesPaginated(
      pageNumber,
      this.rows,
      this.sortField,
      sortDirection,
      this.globalFilter
    ).subscribe({
      next: (response: PaginatedResponse<OptionValue>) => {
        this.optionValues = response.data;

        // Group option values by category
        this.groupedOptionValues = {};
        response.data.forEach(optionValue => {
          const category = optionValue.category || 'Uncategorized';
          if (!this.groupedOptionValues[category]) {
            this.groupedOptionValues[category] = [];
          }
          this.groupedOptionValues[category].push(optionValue);
        });

        this.totalRecords = response.totalCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading option values:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load option values',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  openNew() {
    this.optionValue = { isActive: true }; // Set default to active
    this.submitted = false;
    this.optionValueDialog = true;
  }

  editOptionValue(optionValue: OptionValue) {
    this.optionValue = { ...optionValue };
    this.optionValueDialog = true;
  }

  deleteOptionValue(optionValue: OptionValue) {
    this.deleteOptionValueDialog = true;
    this.optionValue = { ...optionValue };
  }

  confirmDelete() {
    this.deleteOptionValueDialog = false;

    if (this.optionValue.id) {
      this.optionValueService.deleteOptionValue(this.optionValue.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'OptionValue Deleted',
            life: 3000
          });
          this.loadOptionValues();
          this.optionValue = {};
        },
        error: (error) => {
          console.error('Error deleting option value:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete option value',
            life: 3000
          });
        }
      });
    }
  }

  deleteSelectedOptionValues() {
    this.deleteOptionValuesDialog = true;
  }

  confirmDeleteSelected() {
    this.deleteOptionValuesDialog = false;

    // Get IDs of selected option values
    const idsToDelete = this.selectedOptionValues.map(opt => opt.id).filter(id => id !== undefined) as string[];

    // Delete all selected option values
    Promise.all(idsToDelete.map(id =>
      this.optionValueService.deleteOptionValue(id).toPromise()
    )).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Option Values Deleted',
        life: 3000
      });
      this.loadOptionValues();
      this.selectedOptionValues = [];
    }).catch(error => {
      console.error('Error deleting selected option values:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete selected option values',
        life: 3000
      });
    });
  }

  hideDialog() {
    this.optionValueDialog = false;
    this.submitted = false;
  }

  saveOptionValue() {
    this.submitted = true;

    if (this.optionValue.category?.trim() && this.optionValue.value?.trim()) {
      if (this.optionValue.id) {
        // Update
        this.optionValueService.updateOptionValue(this.optionValue.id, this.optionValue).subscribe({
          next: (updatedOptionValue) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'OptionValue Updated',
              life: 3000
            });
            this.loadOptionValues();
            this.optionValueDialog = false;
            this.optionValue = {};
          },
          error: (error) => {
            console.error('Error updating option value:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update option value',
              life: 3000
            });
          }
        });
      } else {
        // Create
        this.optionValueService.createOptionValue(this.optionValue).subscribe({
          next: (newOptionValue) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'OptionValue Created',
              life: 3000
            });
            this.loadOptionValues();
            this.optionValueDialog = false;
            this.optionValue = {};
          },
          error: (error) => {
            console.error('Error creating option value:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create option value',
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
    this.loadOptionValues();
  }

  onSort(event: any) {
    this.sortField = event.field;
    this.sortOrder = event.order;
    this.loadOptionValues();
  }

  getCategories(): string[] {
    return Object.keys(this.groupedOptionValues);
  }

  ngOnDestroy() {
    // Unsubscribe from the search subject to prevent memory leaks
    this.searchSubject.complete();
  }
}
