import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TherapistCommissionService } from './therapist-commission.service';
import { TherapistCommissionItem, TherapistCommissionReportDto, TherapistIncentiveDto } from './therapist-commission.model';
import { MessageService } from 'primeng/api';
import { Staff } from '../../models/staff.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-therapist-commission',
  templateUrl: './therapist-commission.component.html',
  styleUrls: ['./therapist-commission.component.scss']
})
export class TherapistCommissionComponent implements OnInit {
  commissionForm: FormGroup;
  staffOptions: Staff[] = [];
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
  }

  private createForm(): FormGroup {
    return this.fb.group({
      staff: [null, Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      month: [new Date().getMonth() + 1, Validators.required], // Current month
      period: [null, Validators.required]
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

    // Calculate start and end dates based on the selected period
    const startDate = this.calculatePeriodStartDate(year, month, period);
    const endDate = this.calculatePeriodEndDate(year, month, period);

    // Get the data from the backend to generate the PDF
    this.therapistCommissionService.getTherapistCommission(staffId, startDate, endDate)
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

  private generatePdfClientSide(data: TherapistCommissionItem[], staffName: string, startDate: Date, endDate: Date): void {
    // Create a new jsPDF instance
    const doc = new jsPDF('p', 'mm', 'a4'); // landscape orientation, millimeters, A4 size
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add title
    doc.setFontSize(16);
    doc.text(`Therapist Commission Report - ${staffName}`, pageWidth / 2, 15, { align: 'center' });

    // Add date range
    doc.setFontSize(12);
    doc.text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });

    // Add report date
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: 'center' });

    // Check if there's data to display
    if (data && data.length > 0) {
      // Prepare data for table
      const tableData = data.map(item => [
        new Date(item.salesDate).toLocaleDateString(),
        item.menuCode,
        item.footMins.toString(),
        item.bodyMins.toString(),
        item.staffCommission.toFixed(2),
        item.extraCommission.toFixed(2)
      ]);

      // Calculate totals
      const totalFootMins = data.reduce((sum, item) => sum + item.footMins, 0);
      const totalBodyMins = data.reduce((sum, item) => sum + item.bodyMins, 0);
      const totalStaffCommission = data.reduce((sum, item) => sum + item.staffCommission, 0);
      const totalExtraCommission = data.reduce((sum, item) => sum + item.extraCommission, 0);

      // Add totals row to data
      tableData.push([
        'TOTALS', '',
        totalFootMins.toString(),
        totalBodyMins.toString(),
        totalStaffCommission.toFixed(2),
        totalExtraCommission.toFixed(2)
      ]);

      // Add table
      autoTable(doc, {
        startY: 45,
        head: [['Sales Date', 'Menu Code', 'Foot Mins', 'Body Mins', 'Staff Commission', 'Extra Commission']],
        body: tableData,
        styles: {
          fontSize: 8,
          cellPadding: 1
        },
        headStyles: {
          fillColor: [66, 133, 244], // Google blue color
          textColor: [255, 255, 255]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245] // Light gray for alternate rows
        },
        margin: { left: 5, right: 5 }
      });
    } else {
      // If no data, add a message
      doc.setFontSize(12);
      doc.text('No data available for the selected period.', pageWidth / 2, 50, { align: 'center' });
    }

    // Save the PDF and create a blob URL for display
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.pdfUrl = blobUrl;
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
}
