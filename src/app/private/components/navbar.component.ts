import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false, // Keep as part of module system
  template: `
    <mat-toolbar color="primary">
      <div class="toolbar-content">
        <button 
          mat-icon-button 
          class="menu-button" 
          (click)="toggleSidebar()" 
          *ngIf="isMobileView()">
          <mat-icon>menu</mat-icon>
        </button>
      <span class="spacer"></span>
      <div class="toolbar-buttons">
        <a mat-button *ngIf="!authService.isAuthenticated()" routerLink="/auth/login">Login</a>
        <span *ngIf="authService.isAuthenticated()" class="user-info">
          Welcome, {{ authService.getUserName() }}
        </span>
        
        <button 
          mat-button 
          *ngIf="authService.isAuthenticated()" 
          (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
        </button>
      </div>
    </div>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      flex-shrink: 0; /* Prevent navbar from shrinking */
      z-index: 101; /* Ensure navbar is above main content but below dialogs */
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .toolbar-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .user-info {
      margin-left: 16px;
      font-weight: bold;
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      width: 100%;
    }
    
    .menu-button {
      margin-right: 16px;
    }
  `]
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) { 
    // Screen size is checked in the isMobileView method when called
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']).then();
      },
      error: (error) => {
        console.error('Logout error:', error);
        localStorage.removeItem('access_token');
        this.router.navigate(['/auth/login']).then();
      }
    });
  }
  
  toggleSidebar(): void {
    // Dispatch a custom event to notify the sidebar
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  }
  
  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Component will re-render and call isMobileView() again automatically
  }
}