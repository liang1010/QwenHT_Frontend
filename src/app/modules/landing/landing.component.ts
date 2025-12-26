import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../layout/app.layout.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {

    currentTime: string = '';
    currentDate: string = '';
    private intervalId: any;

    constructor(public layoutService: LayoutService, public router: Router) { }

    ngOnInit() {
        this.updateClock();
        this.intervalId = setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    updateClock() {
        const now = new Date();

        // Format time in 12-hour format with seconds
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        };
        this.currentTime = now.toLocaleTimeString('en-US', timeOptions);

        // Format date with day of week
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        this.currentDate = now.toLocaleDateString('en-US', dateOptions);
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
