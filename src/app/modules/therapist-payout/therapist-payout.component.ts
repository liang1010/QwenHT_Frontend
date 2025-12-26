import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Staff } from '../../models/staff.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Incentive } from '../../models/incentives';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
import { ConsultantCommissionService } from './therapist-payout.service';
import { TherapistPayoutReportDto } from './therapist-payout.model';

@Component({
  selector: 'app-therapist-payout',
  templateUrl: './therapist-payout.component.html',
  styleUrls: ['./therapist-payout.component.scss']
})
export class TherapistPayoutComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  commissionForm: FormGroup;
  staffOptions: Staff[] = [];
  loading = false;
  pdfSrc: SafeUrl | null = null;
  pdfUrl: string | null = null;
  dataSource: TherapistPayoutReportDto[] = [];
  dataSource2: TherapistPayoutReportDto[] = [];
  displayTable = false;

  constructor(
    private fb: FormBuilder,
    private consultantPayoutService: ConsultantCommissionService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe
  ) {
    this.commissionForm = this.createForm();
  }

  ngOnInit(): void {
    this.commissionForm.valueChanges.subscribe(x => {
      this.dataSource = [];
      this.therapistCommissionReport = undefined;
      this.displayTable = false;
    })
  }

  private createForm(): FormGroup {
    return this.fb.group({
      year: [new Date().getFullYear(), Validators.required],
      month: [new Date().getMonth() + 1, Validators.required], // Current month
      incentive: [false],
      period: [null, Validators.required],
    });
  }

  therapistCommissionReport: TherapistPayoutReportDto[] | undefined;

  endDate: Date = new Date();

  totalFoot = 0;
  totalBody = 0;
  totalStaff = 0;
  totalExtra = 0;
  totalIncentive = 0;
  totalPayout = 0;

  totalFoot2 = 0;
  totalBody2 = 0;
  totalStaff2 = 0;
  totalExtra2 = 0;
  totalIncentive2 = 0;
  totalPayout2 = 0;
  // Options for pay period (1st or 2nd)
  periodOptions = [
    { label: '1st Period (1-15)', value: 1 },
    { label: '2nd Period (16-end of month)', value: 2 }
  ];

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
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);
    this.endDate = endDate
    // Get the data from the backend to generate the PDF
    this.consultantPayoutService.getTherapistCommission(staffId, startDate, endDate, incentive)
      .subscribe({
        next: (response: TherapistPayoutReportDto[]) => {
          this.therapistCommissionReport = response;
          // Transform the data to match the expected export format with flattened fields
          this.dataSource = (response || []).filter(x => !x.bankName.includes('PETTY')).map(item => ({
            ...item,
            date: this.datePipe.transform(this.endDate, 'dd/MM/yyyy'),
            staff: item.totalStaffCommission || 0,
            extra: item.totalExtraCommission || 0,
            incentive: item.totalIncentive || 0,
            total: item.totalPayout || 0,
            foot: item.totalFootCommission || 0,
            body: item.totalBodyCommission || 0,
          }));

          this.totalPayout = this.dataSource
            .reduce((sum, x) => sum + (x.totalPayout || 0), 0);
          this.totalFoot = this.dataSource
            .reduce((sum, x) => sum + (x.foot || 0), 0);
          this.totalBody = this.dataSource
            .reduce((sum, x) => sum + (x.body || 0), 0);
          this.totalStaff = this.dataSource
            .reduce((sum, x) => sum + (x.staff || 0), 0);
          this.totalExtra = this.dataSource
            .reduce((sum, x) => sum + (x.extra || 0), 0);
          this.totalIncentive = this.dataSource
            .reduce((sum, x) => sum + (x.incentive || 0), 0);


          this.dataSource2 = (response || []).filter(x => x.bankName.includes('PETTY')).map(item => ({
            ...item,
            date: this.datePipe.transform(this.endDate, 'dd/MM/yyyy'),
            staff: item.totalStaffCommission || 0,
            extra: item.totalExtraCommission || 0,
            incentive: item.totalIncentive || 0,
            total: item.totalPayout || 0,
            foot: item.totalFootCommission || 0,
            body: item.totalBodyCommission || 0,
          }));

          this.totalPayout2 = this.dataSource2
            .reduce((sum, x) => sum + (x.totalPayout || 0), 0);
          this.totalFoot2 = this.dataSource2
            .reduce((sum, x) => sum + (x.foot || 0), 0);
          this.totalBody2 = this.dataSource2
            .reduce((sum, x) => sum + (x.body || 0), 0);
          this.totalStaff2 = this.dataSource2
            .reduce((sum, x) => sum + (x.staff || 0), 0);
          this.totalExtra2 = this.dataSource2
            .reduce((sum, x) => sum + (x.extra || 0), 0);
          this.totalIncentive2 = this.dataSource2
            .reduce((sum, x) => sum + (x.incentive || 0), 0);

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
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);

    // Call backend endpoint to generate PDF
    this.consultantPayoutService.downloadTherapistCommissionReport(staffId, startDate, endDate)
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


  private calculatePeriodStartDate(year: number, month: number, period: number): Date {
    if (period === 1) {
      // 1st period: 1st of the month
      return new Date(year, month - 1, 1);
    } else {
      // 2nd period: 16th of the month
      return new Date(year, month - 1, 16);
    }
  }

  private calculatePeriodEndDate(year: number, month: number, period: number): Date {
    if (period === 1) {
      // 1st period: 15th of the month
      return new Date(year, month - 1, 15);
    } else {
      // 2nd period: end of the month
      return new Date(year, month, 0); // 0th day of next month = last day of current month
    }
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
    this.dataSource = [];
    this.displayTable = false;
  }

}
