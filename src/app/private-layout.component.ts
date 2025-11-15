import { Component, OnInit } from '@angular/core';
import { ProgressBarService } from './private/core/services/progress-bar.service';

@Component({
  selector: 'app-private-layout',
  
  templateUrl: './private-layout.component.html',
  styleUrls: ['./private-layout.component.css']
})
export class PrivateLayoutComponent implements OnInit {
  showProgressBar = false;

  constructor(private progressBarService: ProgressBarService) {}

  ngOnInit() {
    this.progressBarService.isLoading$.subscribe(isLoading => {
      this.showProgressBar = isLoading;
    });
  }
}