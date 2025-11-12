import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="container">
      <div class="row">
        <div class="col-md-12 text-center">
          <h1>Welcome to QwenHT Identity Management</h1>
          <p class="lead">
            Secure and scalable identity management for your applications
          </p>
          <div class="mt-4">
            <a mat-raised-button color="primary" routerLink="/auth" class="action-button mx-2">Get Started</a>
            <a mat-stroked-button color="primary" routerLink="/auth/login" class="action-button mx-2">Login</a>
          </div>
        </div>
      </div>
      
      <div class="row mt-5">
        <div class="col-md-4">
          <h3>Secure Authentication</h3>
          <p>Enterprise-grade security with JWT-based authentication and authorization.</p>
        </div>
        <div class="col-md-4">
          <h3>User Management</h3>
          <p>Comprehensive user and role management system with granular permissions.</p>
        </div>
        <div class="col-md-4">
          <h3>Easy Integration</h3>
          <p>Simple APIs and components to integrate with your existing applications.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    h1 {
      margin-top: 2rem;
    }
    .lead {
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
    }
  `]
})
export class HomeComponent {
  constructor() { }
}