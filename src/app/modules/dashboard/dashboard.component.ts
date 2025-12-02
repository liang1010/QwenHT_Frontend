import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, interval } from 'rxjs';
import { LayoutService } from '../../layout/app.layout.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface SalesData {
  totalSalesAllOutlets: number;
  totalSalesHTSA: number;
  totalSalesHTL: number;
  totalSalesHTG: number;
  salesChangePercentageAll: number;
  salesChangePercentageHTSA: number;
  salesChangePercentageHTL: number;
  salesChangePercentageHTG: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

    items!: MenuItem[];

    // Sales data for outlets
    totalSalesAllOutlets: number = 0;
    totalSalesHTSA: number = 0;
    totalSalesHTL: number = 0;
    totalSalesHTG: number = 0;

    // Sales change percentages
    salesChangePercentageAll: number = 0;
    salesChangePercentageHTSA: number = 0;
    salesChangePercentageHTL: number = 0;
    salesChangePercentageHTG: number = 0;

    subscription!: Subscription;

    // Date, month and year selection
    selectedDate: Date | null = null;
    selectedMonth: Date | null = null;
    selectedYear: Date | null = null;

    // Chart data
    chartData: any;
    chartOptions: any;

    constructor(
      public layoutService: LayoutService,
      private messageService: MessageService,
      private http: HttpClient
    ) {
    }

    ngOnInit() {
        // Initialize with today's date
        this.selectedDate = new Date();

        // Initialize chart
        this.initChart();

        // Load initial data from API
        this.loadSalesData();

        // Set up real-time updates every 30 seconds
        // this.subscription = interval(30000).subscribe(() => {
        //     // Only refresh if no specific date/month is selected (for "today" view)
        //     if (!this.selectedDate && !this.selectedMonth) {
        //         this.loadSalesData();
        //     }
        // });

        this.items = [
            { label: 'Add New', icon: 'pi pi-fw pi-plus' },
            { label: 'Remove', icon: 'pi pi-fw pi-minus' }
        ];
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.chartOptions = {
          indexAxis :'y',
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                            font: {
                                weight: 500
                            }
                    },
                    grid: {
                        color: surfaceBorder,
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                    }
                }
            }
        };
    }

    loadSalesData() {
        // Determine the date, month or year to use
        let dateParam = '';
        if (this.selectedDate) {
            // Format selected date as YYYY-MM-DD, considering timezone
            const selectedDate = new Date(this.selectedDate);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            // Include timezone offset in the request
            const timezoneOffset = selectedDate.getTimezoneOffset(); // In minutes
            dateParam = `date=${year}-${month}-${day}&timezoneOffset=${timezoneOffset}`;
        } else if (this.selectedMonth) {
            // Format selected month as YYYY-MM
            const year = this.selectedMonth.getFullYear();
            const month = String(this.selectedMonth.getMonth() + 1).padStart(2, '0');
            dateParam = `month=${year}-${month}`;
        } else if (this.selectedYear) {
            // Format selected year as YYYY
            const year = this.selectedYear.getFullYear();
            dateParam = `year=${year}`;
        } else {
            // Default to today if no specific date is selected
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const timezoneOffset = today.getTimezoneOffset(); // In minutes
            dateParam = `date=${year}-${month}-${day}&timezoneOffset=${timezoneOffset}`;
        }

        // API call to fetch real sales data from backend
        const apiUrl = `${environment.apiUrl}/sales/dashboard?${dateParam}`;

        this.http.get<SalesData>(apiUrl).subscribe({
          next: (data) => {
            this.totalSalesAllOutlets = data.totalSalesAllOutlets || 0;
            this.totalSalesHTSA = data.totalSalesHTSA || 0;
            this.totalSalesHTL = data.totalSalesHTL || 0;
            this.totalSalesHTG = data.totalSalesHTG || 0;

            this.salesChangePercentageAll = data.salesChangePercentageAll || 0;
            this.salesChangePercentageHTSA = data.salesChangePercentageHTSA || 0;
            this.salesChangePercentageHTG = data.salesChangePercentageHTG || 0;
            this.salesChangePercentageHTL = data.salesChangePercentageHTL || 0;

            // Update chart data after loading new sales data
            this.updateChartData();
          },
          error: (error) => {
            console.error('Error fetching sales data:', error);
            this.messageService.add({severity:'error', summary:'Error', detail:'Failed to load sales data'});
          }
        });
    }

    updateChartData() {
        // Prepare chart data using the current sales data
        const documentStyle = getComputedStyle(document.documentElement);
        const blueColor = documentStyle.getPropertyValue('--blue-500');
        const blueColorLight = documentStyle.getPropertyValue('--blue-100');
        const orangeColor = documentStyle.getPropertyValue('--orange-500');
        const orangeColorLight = documentStyle.getPropertyValue('--orange-100');
        const cyanColor = documentStyle.getPropertyValue('--cyan-500');
        const cyanColorLight = documentStyle.getPropertyValue('--cyan-100');
        const purpleColor = documentStyle.getPropertyValue('--purple-500');
        const purpleColorLight = documentStyle.getPropertyValue('--purple-100');

        // For date selection, we show a single data point
        // For month selection, we could potentially make an API call to get daily breakdown
        // For now, we'll just show the single data point, but with more descriptive labels

        let chartLabels: string[] = [];
        let allOutletsData: number[] = [];
        let htsaData: number[] = [];
        let htlData: number[] = [];
        let htgData: number[] = [];

        if (this.selectedYear) {
            // If a year is selected
            const yearLabel = this.selectedYear.getFullYear().toString();
            chartLabels = [yearLabel];
            allOutletsData = [this.totalSalesAllOutlets];
            htsaData = [this.totalSalesHTSA];
            htlData = [this.totalSalesHTL];
            htgData = [this.totalSalesHTG];
        } else if (this.selectedMonth) {
            // If a month is selected, we could potentially fetch daily data for the month
            // For now, we'll just show the total as a single point
            const monthLabel = this.selectedMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
            chartLabels = [monthLabel];
            allOutletsData = [this.totalSalesAllOutlets];
            htsaData = [this.totalSalesHTSA];
            htlData = [this.totalSalesHTL];
            htgData = [this.totalSalesHTG];
        } else {
            // For specific date or today
            const dateLabel = this.selectedDate
                ? this.selectedDate.toLocaleDateString()
                : 'Today';
            chartLabels = [dateLabel];
            allOutletsData = [this.totalSalesAllOutlets];
            htsaData = [this.totalSalesHTSA];
            htlData = [this.totalSalesHTL];
            htgData = [this.totalSalesHTG];
        }

        this.chartData = {
            labels: chartLabels,
            datasets: [
                {
                    label: 'All Outlets',
                    data: allOutletsData,
                    backgroundColor: blueColorLight,
                    borderColor: blueColor,
                    borderWidth: 2
                },
                {
                    label: 'HTSA',
                    data: htsaData,
                    backgroundColor: orangeColorLight,
                    borderColor: orangeColor,
                    borderWidth: 2
                },
                {
                    label: 'HTL',
                    data: htlData,
                    backgroundColor: cyanColorLight,
                    borderColor: cyanColor,
                    borderWidth: 2
                },
                {
                    label: 'HTG',
                    data: htgData,
                    backgroundColor: purpleColorLight,
                    borderColor: purpleColor,
                    borderWidth: 2
                }
            ]
        };
    }

    onDateChange() {
        // Reset month and year selection when date is selected
        this.selectedMonth = null;
        this.selectedYear = null;
        this.loadSalesData();
    }

    onMonthChange() {
        // Reset date and year selection when month is selected
        this.selectedDate = null;
        this.selectedYear = null;
        this.loadSalesData();
    }

    onYearChange() {
        // Reset date and month selection when year is selected
        this.selectedDate = null;
        this.selectedMonth = null;
        this.loadSalesData();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
