import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from '../../layout/app.layout.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {

    constructor(public layoutService: LayoutService, public router: Router) { }

}
