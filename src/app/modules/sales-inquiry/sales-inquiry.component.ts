import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SalesInquiryService, SalesRecord } from './sales-inquiry.service';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { OptionValue } from '../../models/option-value.model';

@Component({
  selector: 'app-sales-inquiry',
  templateUrl: './sales-inquiry.component.html',
  styleUrls: ['./sales-inquiry.component.scss']
})
export class SalesInquiryComponent implements OnInit, OnDestroy {
  salesForm: FormGroup;
  editForm: FormGroup;
  salesRecords: SalesRecord[] = [];
  outlets: OptionValue[] = [];

  // For pagination
  totalRecords = 0;
  loading = false;
  rows = 10; // Number of records per page
  first = 0; // First record offset

  // Forms for editing/deleting
  editRecord: SalesRecord | null = null;
  showEditDialog = false;
  showDeleteDialog = false;
  deleteRecordId: string | null = null;

  rowsPerPageOptions = [5, 10, 20, { showAll: 'All' }];
  // Totals for the table footer (from backend)
  totalPrice = 0;
  totalBodyMins = 0;
  totalFootMins = 0;
  totalExtraCommission = 0;
  totalStaffCommission = 0;
  totalRequest = 0;
  totalFootCream = 0;
  totalOil = 0;

  // Properties for scroll buttons (will be disabled with pagination)
  showScrollTopBtn = false;
  showScrollBottomBtn = false;

  private scrollHandler = () => this.onWindowScroll();

  private destroy$ = new Subject<void>();

  // Property for setting max date range (12 months from today)
  maxDateRange: Date;

  constructor(
    private fb: FormBuilder,
    private salesInquiryService: SalesInquiryService,
    private messageService: MessageService
  ) {
    // Calculate max date as 12 months from today
    this.maxDateRange = new Date();
    this.maxDateRange.setMonth(this.maxDateRange.getMonth() + 12);

    this.salesForm = this.fb.group({
      dateRange: [null],
      outlet: [null]
    }, { validator: this.dateRangeValidator });

    this.editForm = this.fb.group({
      salesDate: [null, Validators.required],
      staffName: [''],
      outletName: [''],
      menuDescription: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      bodyMins: [0, [Validators.min(0)]],
      footMins: [0, [Validators.min(0)]],
      staffCommission: [0, [Validators.min(0)]],
      extraCommission: [0, [Validators.min(0)]],
      remark: [''],
      request: [false],
      footCream: [false],
      oil: [false]
    });
  }



  ngOnInit(): void {
    this.loadOutlets();

    // Add scroll event listener
    window.addEventListener('scroll', this.scrollHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.scrollHandler);
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOutlets(): void {
    this.salesInquiryService.getOutlets().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.outlets = data;
      },
      error: (error) => {
        console.error('Error loading outlets:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load outlets',
          life: 3000
        });
      }
    });
  }

  loadInitialData(): void {
    this.loading = true;

    const formValue = this.salesForm.value;

    // Extract start and end dates from the date range
    let startDate = null;
    let endDate = null;

    if (formValue.dateRange && formValue.dateRange[0]) {
      startDate = formValue.dateRange[0];
      if (formValue.dateRange[1])
        endDate = formValue.dateRange[1];
      else if (!formValue.dateRange[1])
        endDate = formValue.dateRange[0];
    }

    // Create filters object with the expected format for the service
    const filters = {
      startDate: startDate,
      endDate: endDate,
      outlet: formValue.outlet
    };

    // Calculate page number from first and rows
    const page = Math.floor(this.first / this.rows) + 1;
    const pageSize = this.rows;

    // Fetch records with pagination
    this.salesInquiryService.getSalesRecords(filters, page, pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.salesRecords = [...response.data];
        this.totalRecords = response.totalCount;

        // If the backend provides aggregated totals, use them instead of calculating from current page
        if (response.aggregatePrice !== undefined) {
          this.totalPrice = response.aggregatePrice;
          this.totalBodyMins = response.aggregateBodyMins || 0;
          this.totalFootMins = response.aggregateFootMins || 0;
          this.totalExtraCommission = response.aggregateExtraCommission || 0;
          this.totalStaffCommission = response.aggregateStaffCommission || 0;
          this.totalRequest = response.aggregateRequest || 0;
          this.totalOil = response.aggregateOil || 0;
          this.totalFootCream = response.aggregateFootCream || 0;
        } else {
          // Calculate totals from current page if backend doesn't provide aggregates
          this.calculateTotals();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading sales records:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sales records',
          life: 3000
        });
      }
    });
  }

  loadMoreData(): void {
    // This method is no longer needed
  }

  applyFilters(): void {
    if (this.salesForm.invalid) {
      // Check if the invalidity is due to date range validation
      if (this.salesForm.errors && this.salesForm.errors['dateRangeExceeded']) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Date Range Exceeded',
          detail: 'The selected date range cannot exceed 12 months.',
          life: 5000
        });
      }
      return;
    }

    if (!this.salesForm.value.dateRange || !this.salesForm.value.dateRange[0]) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Date Range Undefined',
        detail: 'The selected date range cannot be null.',
        life: 5000
      });
      return;
    }

    // Reset to first page when applying filters
    this.first = 0;
    this.loadInitialData();
  }

  clearFilters(): void {
    this.salesForm.reset();
    // Explicitly clear the controls to ensure proper reset
    this.salesForm.controls['dateRange'].setValue(null);
    this.salesForm.controls['outlet'].setValue(null);
    // Reset to first page when clearing filters
    this.first = 0;
    this.loadInitialData();
  }

  openEditDialog(record: SalesRecord): void {
    this.editRecord = { ...record };
    this.editForm.patchValue({
      salesDate: new Date(record.salesDate),
      staffName: record.staffName,
      outletName: record.outletName,
      menuDescription: record.menuDescription,
      price: record.price,
      bodyMins: record.bodyMins,
      footMins: record.footMins,
      staffCommission: record.staffCommission,
      extraCommission: record.extraCommission,
      remark: record.remark || '',
      request: record.request || false,
      footCream: record.footCream || false,
      oil: record.oil || false
    });
    this.editForm.get('salesDate')?.disable();
    this.editForm.get('staffName')?.disable();
    this.editForm.get('outletName')?.disable();
    this.editForm.get('menuDescription')?.disable();
    this.editForm.get('bodyMins')?.disable();
    this.editForm.get('footMins')?.disable();
    this.editForm.get('salesDate')?.disable();
    this.showEditDialog = true;
  }

  saveRecord(): void {
    if (this.editRecord && this.editForm.valid) {
      // Merge the form values with the existing record to maintain unchanged properties
      const formValue = this.editForm.value;
      const updatedRecord: SalesRecord = {
        ...this.editRecord,
        salesDate: formValue.salesDate,
        price: formValue.price,
        bodyMins: formValue.bodyMins,
        footMins: formValue.footMins,
        staffCommission: formValue.staffCommission,
        extraCommission: formValue.extraCommission,
        remark: formValue.remark,
        request: formValue.request,
        footCream: formValue.footCream,
        oil: formValue.oil,
        // Keep read-only fields unchanged
        staffName: this.editRecord.staffName,
        outletName: this.editRecord.outletName,
        menuDescription: this.editRecord.menuDescription,
        id: this.editRecord.id, // Ensure ID remains unchanged
        staffId: this.editRecord.staffId, // Ensure staffId remains unchanged
        outlet: this.editRecord.outlet, // Ensure outlet remains unchanged
        menuId: this.editRecord.menuId // Ensure menuId remains unchanged
      };

      this.salesInquiryService.updateSalesRecord(updatedRecord).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('Sales record updated successfully:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Sales Record Updated',
            life: 3000
          });
          this.showEditDialog = false;
          this.editForm.reset(); // Reset the form after successful save
          this.loadInitialData(); // Refresh the list
        },
        error: (error) => {
          console.error('Error updating sales record:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update sales record',
            life: 3000
          });
        }
      });
    } else if (this.editForm.invalid) {
      // Display validation errors if form is invalid
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill in all required fields correctly',
        life: 3000
      });
    }
  }

  openDeleteDialog(id: string): void {
    this.deleteRecordId = id;
    this.showDeleteDialog = true;
  }

  deleteRecord(): void {
    if (this.deleteRecordId) {
      this.salesInquiryService.deleteSalesRecord(this.deleteRecordId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('Sales record deleted successfully:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Sales Record Deleted',
            life: 3000
          });
          this.showDeleteDialog = false;
          this.loadInitialData(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting sales record:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete sales record',
            life: 3000
          });
        }
      });
    }
  }

  onCancelEdit(): void {
    this.showEditDialog = false;
    this.editRecord = null;
    this.editForm.reset();
  }

  onCancelDelete(): void {
    this.showDeleteDialog = false;
    this.deleteRecordId = null;
  }

  // Custom validator to check if date range exceeds 12 months
  dateRangeValidator = (group: FormGroup) => {
    const dateRange = group.get('dateRange')?.value;

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = new Date(dateRange[0]);
      const endDate = new Date(dateRange[1]);

      // Calculate the difference in months
      const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

      if (monthDiff > 12) {
        return { dateRangeExceeded: true };
      }
    }
    return null;
  }

  calculateTotals(): void {
    this.totalPrice = this.salesRecords.reduce((sum, record) => sum + record.price, 0);
    this.totalBodyMins = this.salesRecords.reduce((sum, record) => sum + record.bodyMins, 0);
    this.totalFootMins = this.salesRecords.reduce((sum, record) => sum + record.footMins, 0);
    this.totalStaffCommission = this.salesRecords.reduce((sum, record) => sum + record.staffCommission, 0);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToBottom(): void {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  }

  onPage(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadInitialData();
  }

  onWindowScroll(): void {
    // Check if we're near the top
    this.showScrollTopBtn = window.scrollY > 100;

    // Check if we're near the bottom
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Show scroll down button unless we're very close to the bottom
    this.showScrollBottomBtn = scrollTop + windowHeight < documentHeight - 100;
  }
}
