import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TherapistCommissionService } from './therapist-commission.service';
import { TherapistCommissionItem, TherapistCommissionReportDto, TherapistIncentiveDto } from './therapist-commission.model';
import { MessageService } from 'primeng/api';
import { Staff } from '../../models/staff.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Incentive } from '../../models/incentives';

@Component({
  selector: 'app-therapist-commission',
  templateUrl: './therapist-commission.component.html',
  styleUrls: ['./therapist-commission.component.scss']
})
export class TherapistCommissionComponent implements OnInit {
  commissionForm: FormGroup;
  staffOptions: Staff[] = [];
  incentiveTypeOptions: any[] = [];
  loading = false;
  pdfSrc: SafeUrl | null = null;
  pdfUrl: string | null = null;
  commissionData: TherapistCommissionItem[] = [];
  incentiveData: TherapistIncentiveDto[] = [];
  displayTable = false;

  constructor(
    private fb: FormBuilder,
    private therapistCommissionService: TherapistCommissionService,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) {
    this.commissionForm = this.createForm();
  }

  // Options for pay period (1st or 2nd)
  periodOptions = [
    { label: '1st Period (1-15)', value: 1 },
    { label: '2nd Period (16-end of month)', value: 2 }
  ];


  ngOnInit(): void {
    this.loadStaff();
    this.loadIncentiveTypeOptions();
    this.commissionForm.valueChanges.subscribe(x => {
      this.commissionData = [];
      this.incentiveData = [];
      this.therapistCommissionReport = undefined;
      this.displayTable = false;
    })
  }

  private createForm(): FormGroup {
    return this.fb.group({
      staff: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      month: [new Date().getMonth() + 1, Validators.required], // Current month
      period: [null, Validators.required],
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

  loadIncentiveTypeOptions(): void {
    this.therapistCommissionService.getOptionValuesByCategory('IncentiveType').subscribe({
      next: (data) => {
        this.incentiveTypeOptions = data.map(option => ({
          label: option.value,
          value: option.value
        }));
      },
      error: (error) => {
        console.error('Error loading incentive type options:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load incentive types',
          life: 3000
        });
      }
    });
  }

  therapistCommissionReport: TherapistCommissionReportDto | undefined;

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

    // Get the data from the backend to generate the PDF
    this.therapistCommissionService.getTherapistCommission(staffId, startDate, endDate, incentive)
      .subscribe({
        next: (response) => {
          this.therapistCommissionReport = response;
          // Store the data for table display - accessing the Commissions property from the full response
          this.commissionData = response.commissions || [];
          this.incentiveData = response.incentives || [];
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
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);

    // Get the data from the backend to generate the PDF
    this.therapistCommissionService.insertTherapistPayout(staffId, startDate, endDate)
      .subscribe({
        next: (response) => {
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
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);

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
    this.commissionData = [];
    this.displayTable = false;
  }

  calculateTotals(field: keyof TherapistCommissionItem): number {
    if (!this.commissionData || this.commissionData.length === 0) {
      return 0;
    }

    // For numeric fields, calculate the sum
    if (field === 'footMins' || field === 'bodyMins' ||
      field === 'staffCommission' || field === 'extraCommission') {
      return this.commissionData.reduce((sum, item) => sum + Number(item[field]), 0);
    }

    return 0;
  }

  incentiveDialog = false;
  incentive: Incentive = {};
  submitted = false;
  newIncentive() {
    this.incentive = {
      status: 1, // Default status
      incentiveDate: new Date() // Initialize with current date for the calendar
    };
    this.submitted = false;
    this.incentiveDialog = true;
  }


  editIncentive(menu: Incentive) {
    this.incentive = { ...menu };
    // Convert UTC dates to local timezone for the calendar components
    if (this.incentive.createdAt) {
      this.incentive.createdAt = new Date(this.incentive.createdAt);
    }
    if (this.incentive.lastUpdated) {
      this.incentive.lastUpdated = new Date(this.incentive.lastUpdated);
    }
    if (this.incentive.incentiveDate) {
      // Ensure the date is properly formatted for the calendar component
      this.incentive.incentiveDate = new Date(this.incentive.incentiveDate);
    }
    this.incentiveDialog = true;
  }


  deleteMenu(menu: Incentive) {
    this.incentive = { ...menu };
    // this.deleteMenuDialog = false;

    if (this.incentive.id) {
      this.therapistCommissionService.deleteIncentive(this.incentive.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Incentive Deleted',
            life: 3000
          });
          this.generatePdf(); // Reload the data
          this.incentive = {};
          this.incentiveDialog = false;
        },
        error: (error) => {
          this.incentiveDialog = false;
          console.error('Error deleting menu:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete incentive',
            life: 3000
          });
        }
      });
    }
  }

  hideDialog() {
    this.incentiveDialog = false;
    this.submitted = false;
  }

  savIncentive() {

    const formValue = this.commissionForm.value;
    const year = formValue.year;
    const month = formValue.month;
    const period = formValue.period;

    // Calculate start and end dates based on the selected period
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);
    const staffId = formValue.staff;
    this.submitted = true;

    // Use the selected date from the calendar, or default to the end date if not selected
    this.incentive.incentiveDate = endDate;
    this.incentive.staffId = staffId;
    // Validate required fields
    if (this.incentive.description && this.incentive.remark?.trim() && this.incentive.amount !== undefined) {
      if (this.incentive.id) {
        // Update existing menu
        this.therapistCommissionService.updateIncentive(this.incentive.id, this.incentive).subscribe({
          next: (updatedMenu) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Incentive Updated',
              life: 3000
            });
            this.generatePdf(); // Reload the data
            this.incentiveDialog = false;
            this.incentive = {};
          },
          error: (error) => {
            console.error('Error updating Incentive:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update incentive',
              life: 3000
            });
          }
        });
      } else {
        // Create new menu
        this.therapistCommissionService.createIncentive(this.incentive).subscribe({
          next: (newMenu) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Incentive Created',
              life: 3000
            });
            this.generatePdf(); // Reload the data
            this.incentiveDialog = false;
            this.incentive = {};
          },
          error: (error) => {
            console.error('Error creating incentive:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create incentive',
              life: 3000
            });
          }
        });
      }
    } else {
      // Show validation error
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Type, Remark, and Amount are required fields',
        life: 3000
      });
    }
  }
}
