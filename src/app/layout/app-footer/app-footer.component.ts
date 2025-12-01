import { Component } from '@angular/core';
import { LayoutService } from '../app.layout.service';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  styleUrl: './app-footer.component.scss'
})
export class AppFooterComponent {
    constructor(public layoutService: LayoutService) { }
}
