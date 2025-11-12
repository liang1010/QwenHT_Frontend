import { Component } from '@angular/core';

@Component({
  selector: 'app-private-layout',
  template: `
    <div class="private-layout">
      <app-navbar></app-navbar>
      <div class="layout-content">
        <app-sidebar></app-sidebar>
        <main class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
      <footer class="layout-footer">
        <div class="container py-3 text-center">
          <p>&copy; 2025 QwenHT Identity Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .private-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden; /* Prevent scrollbars on the main layout */
    }
    

    
    .layout-content {
      flex: 1;
      display: flex;
      overflow: hidden; /* Prevent scrollbars on the layout content */
    }

    .main-content {
      flex: 1;
      margin-left: 250px; /* Width of the sidebar */
      padding: 0px 20px 20px 20px;
      display: flex;
      flex-direction: column;
      overflow-y: auto; /* Allow vertical scrolling within main content */
      transition: margin-left 0.3s ease;
    }
    
    .content-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .layout-footer {
      flex-shrink: 0;
      z-index: 100; /* Lower than dialogs */
    }
    
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class PrivateLayoutComponent { }