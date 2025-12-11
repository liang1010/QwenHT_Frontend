import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SalesInquiryService, SalesRecord } from './sales-inquiry.service';
import { Subject, takeUntil } from 'rxjs';
import { LazyLoadEvent } from 'primeng/api';
import { OptionValue } from '../../../models/option-value.model';

@Component({
  selector: 'app-sales-inquiry',
  templateUrl: './sales-inquiry.component.html',
  styleUrls: ['./sales-inquiry.component.scss']
})
export class SalesInquiryComponent implements OnInit, OnDestroy {
  salesForm: FormGroup;
  salesRecords: SalesRecord[] = [];
  outlets: OptionValue[] = [];

  // For virtual scrolling and pagination
  totalRecords = 0;
  loading = false;
  rows = 20; // Number of records to load per batch

  // Forms for editing/deleting
  editRecord: SalesRecord | null = null;
  showEditDialog = false;
  showDeleteDialog = false;
  deleteRecordId: string | null = null;

  // Totals for the table footer
  totalPrice = 0;
  totalBodyMins = 0;
  totalFootMins = 0;
  totalStaffCommission = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private salesInquiryService: SalesInquiryService,
    private messageService: MessageService
  ) {
    this.salesForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      outlet: [null]
    });
  }

  ngOnInit(): void {
    this.loadOutlets();
  }

  ngOnDestroy(): void {
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

    const filters = this.salesForm.value;
    // Fetch a reasonable number of records (e.g., 100) but not all records to avoid performance issues
    this.salesInquiryService.getSalesRecords(filters, 0, 5000).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.salesRecords = [...response.data];
        this.totalRecords = response.totalCount;
        this.calculateTotals();
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
    this.loadInitialData();
  }

  clearFilters(): void {
    this.salesForm.reset();
    this.loadInitialData();
  }

  openEditDialog(record: SalesRecord): void {
    this.editRecord = {...record};
    this.showEditDialog = true;
  }

  saveRecord(): void {
    if (this.editRecord) {
      this.salesInquiryService.updateSalesRecord(this.editRecord).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('Sales record updated successfully:', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Sales Record Updated',
            life: 3000
          });
          this.showEditDialog = false;
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
  }

  onCancelDelete(): void {
    this.showDeleteDialog = false;
    this.deleteRecordId = null;
  }

  calculateTotals(): void {
    this.totalPrice = this.salesRecords.reduce((sum, record) => sum + record.price, 0);
    this.totalBodyMins = this.salesRecords.reduce((sum, record) => sum + record.bodyMins, 0);
    this.totalFootMins = this.salesRecords.reduce((sum, record) => sum + record.footMins, 0);
    this.totalStaffCommission = this.salesRecords.reduce((sum, record) => sum + record.staffCommission, 0);
  }
}
