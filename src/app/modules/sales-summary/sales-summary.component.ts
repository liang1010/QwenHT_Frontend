import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesSummaryService } from './sales-summary.service';
import { SalesSummaryItem } from './sales-summary.model';
import { MessageService } from 'primeng/api';
import { OptionValue } from '../../models/option-value.model';

@Component({
  selector: 'app-sales-summary',
  templateUrl: './sales-summary.component.html',
  styleUrls: ['./sales-summary.component.scss']
})
export class SalesSummaryComponent implements OnInit {
  summaryForm: FormGroup;
  summaryData: SalesSummaryItem[] = [];
  outlets: OptionValue[] = [];
  loading = false;

  // Summary totals
  totalSalePrice = 0;
  totalSaleCount = 0;
  totalSalesAmount = 0;

  constructor(
    private fb: FormBuilder,
    private salesSummaryService: SalesSummaryService,
    private messageService: MessageService
  ) {
    this.summaryForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadOutlets();
  }

  categoryOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Treatment', value: 'TREATMENT' },
    { label: 'Product', value: 'PRODUCT' }
  ];

  private createForm(): FormGroup {
    return this.fb.group({
      dateRange: [null, Validators.required],
      category: ['ALL', Validators.required],
      outlet: ['ALL', Validators.required]
    });
  }

  loadOutlets(): void {
    this.salesSummaryService.getOutlets().subscribe({
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

  getSalesSummary(): void {
    if (this.summaryForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValue = this.summaryForm.value;

    let startDate = formValue.dateRange[0];
    let endDate = formValue.dateRange[1];
    if (formValue.dateRange && formValue.dateRange[0]) {
      startDate = formValue.dateRange[0];
      if (formValue.dateRange[1])
        endDate = formValue.dateRange[1];
      else if (!formValue.dateRange[1])
        endDate = formValue.dateRange[0];
    }

    const category = formValue.category;
    const outlet = formValue.outlet;

    this.salesSummaryService.getSalesSummary(startDate, endDate, category, outlet)
      .subscribe({
        next: (data) => {
          this.summaryData = data;
          // Calculate totals
          this.totalSalePrice = this.summaryData.reduce((sum, item) => sum + item.price, 0);
          this.totalSaleCount = this.summaryData.reduce((sum, item) => sum + item.saleCount, 0);
          this.totalSalesAmount = this.summaryData.reduce((sum, item) => sum + item.totalSales, 0);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading sales summary:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load sales summary',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  clearFilters(): void {
    this.summaryForm.reset();
    this.summaryData = [];
  }
}
