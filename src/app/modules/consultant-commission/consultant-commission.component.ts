import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Staff } from '../../models/staff.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Incentive } from '../../models/incentives';
import { ConsultantCommissionService } from './consultant-commission.service';
import { ConsultantCommissionItem, ConsultantCommissionReportDto, DailyConsultantCommissionSummaryDto } from './consultant-commission.model';

@Component({
  selector: 'app-consultant-commission',
  templateUrl: './consultant-commission.component.html',
  styleUrls: ['./consultant-commission.component.scss']
})
export class ConsultantCommissionComponent implements OnInit {
  commissionForm: FormGroup;
  staffOptions: Staff[] = [];
  loading = false;
  pdfSrc: SafeUrl | null = null;
  pdfUrl: string | null = null;
  productData: DailyConsultantCommissionSummaryDto[] = [];
  treatmentData: DailyConsultantCommissionSummaryDto[] = [];
  displayTable = false;

  constructor(
    private fb: FormBuilder,
    private therapistCommissionService: ConsultantCommissionService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.commissionForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadStaff();
    this.commissionForm.valueChanges.subscribe(x => {
      this.productData = [];
      this.therapistCommissionReport = undefined;
      this.displayTable = false;
    })
  }

  private createForm(): FormGroup {
    return this.fb.group({
      staff: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      month: [new Date().getMonth() + 1, Validators.required], // Current month
      incentive: [false]
    });
  }

  loadStaff(): void {
    this.therapistCommissionService.getStaff().subscribe({
      next: (data) => {
        this.staffOptions = data;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load staff',
          life: 3000
        });
      }
    });
  }

  therapistCommissionReport: ConsultantCommissionReportDto | undefined;

  generatePdf(): void {
    if (this.commissionForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValue = this.commissionForm.value;

    const staffId = formValue.staff;
    const year = formValue.year;
    const month = formValue.month;
    const period = formValue.period;
    const incentive = formValue.incentive;

    // Calculate start and end dates based on the selected period
    const startDate = this.calculatePeriodStartDate(year, month);
    const endDate = this.calculatePeriodEndDate(year, month);

    // Get the data from the backend to generate the PDF
    this.therapistCommissionService.getTherapistCommission(staffId, startDate, endDate, incentive)
      .subscribe({
        next: (response: ConsultantCommissionReportDto) => {
          this.therapistCommissionReport = response;
          // Store the data for table display - accessing the Commissions property from the full response
          this.productData = response.productCommissions || [];
          this.treatmentData = response.treatmentCommissions || [];
          this.displayTable = true;

          // Find the selected staff name
          const selectedStaff = this.staffOptions.find(s => s.id === staffId);
          const staffName = selectedStaff ? (selectedStaff.nickName || selectedStaff.fullName || 'Unknown') : 'Unknown';

          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching therapist commission data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch data for PDF',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  sendToPayout(): void {
    if (this.commissionForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValue = this.commissionForm.value;

    const staffId = formValue.staff;
    const year = formValue.year;
    const month = formValue.month;
    const period = formValue.period;
    const incentive = formValue.incentive;

    // Calculate start and end dates based on the selected period
    const startDate = this.calculatePeriodStartDate(year, month);
    const endDate = this.calculatePeriodEndDate(year, month);

    // Get the data from the backend to generate the PDF
    this.therapistCommissionService.insertConsultantPayout(staffId, startDate, endDate)
      .subscribe({
        next: (response: ConsultantCommissionReportDto) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Sent to Payout',
            life: 3000
          });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching therapist commission data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch data for PDF',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  // Method to download PDF from backend
  downloadPdfFromBackend(): void {
    if (this.commissionForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    this.loading = true;
    const formValue = this.commissionForm.value;

    const staffId = formValue.staff;
    const year = formValue.year;
    const month = formValue.month;
    const period = formValue.period;

    // Calculate start and end dates based on the selected period
    const startDate = this.calculatePeriodStartDate(year, month);
    const endDate = this.calculatePeriodEndDate(year, month);

    // Call backend endpoint to generate PDF
    this.therapistCommissionService.downloadTherapistCommissionReport(staffId, startDate, endDate)
      .subscribe({
        next: (response: Blob) => {
          // Create a download link for the PDF
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `therapist-commission-${staffId}-${year}-${month}-${period}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error downloading therapist commission PDF:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to download PDF from backend',
            life: 3000
          });
          this.loading = false;
        }
      });
  }

  private calculatePeriodStartDate(year: number, month: number): Date {
    return new Date(year, month - 1, 1);

  }

  private calculatePeriodEndDate(year: number, month: number): Date {
    // 2nd period: end of the month
    return new Date(year, month, 0); // 0th day of next month = last day of current month
  }

  clearFilters(): void {
    this.commissionForm.reset();
    this.commissionForm.patchValue({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    });
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
    this.pdfSrc = null;
    this.pdfUrl = null;
    this.treatmentData = [];
    this.productData = [];
    this.displayTable = false;
  }

}
