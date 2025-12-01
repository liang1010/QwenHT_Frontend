import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressBarService } from './services/progress-bar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Qwen-PrimeNg-HT';
  showProgressBar = false;
  constructor(private progressBarService: ProgressBarService) { }

  ngOnInit() {
    this.progressBarService.isLoading$.subscribe(isLoading => {
      this.showProgressBar = isLoading;
    });
  }
}
