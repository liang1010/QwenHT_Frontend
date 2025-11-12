import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';
import { NavigationItem } from '../../core/models/navigation-item';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: false, // Keep as part of module system
  template: `
    <div class="sidebar" [class.open]="isSidebarOpen">
      <div class="sidebar-header">
        <h4>Navigation</h4>
      </div>
      <ul class="nav flex-column">
        <li class="nav-item" *ngFor="let item of navigationItems">
          <a 
            class="nav-link" 
            [class.active]="isActiveRoute(item.route)"
            [routerLink]="item.route"
            (click)="onNavigationClick(item)">
            <i [class]="item.icon" class="nav-icon"></i>
            <span>{{ item.name }}</span>
          </a>
          
          <!-- Submenu if item has children -->
          <ul class="nav flex-column sub-menu" *ngIf="item.children && item.children.length > 0">
            <li class="nav-item" *ngFor="let child of item.children">
              <a 
                class="nav-link sub-item" 
                [class.active]="isActiveRoute(child.route)"
                [routerLink]="child.route"
                (click)="onNavigationClick(child)">
                <i [class]="child.icon" class="nav-icon"></i>
                <span>{{ child.name }}</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .sidebar {
      height: 100vh; /* Fixed height to match viewport */
      background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
      padding: 1rem 0;
      border-right: 1px solid #e0e0e0;
      width: 260px;
      transition: all 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 1000; /* Higher z-index to overlay header and footer */
      overflow-y: auto; /* Allow scrolling within sidebar if content is too long */
      box-shadow: 3px 0 10px rgba(0, 0, 0, 0.08);
    }

    .sidebar-header {
      padding: 0 1.5rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      margin-bottom: 1rem;
    }

    .sidebar-header h4 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #212529;
      display: flex;
      align-items: center;
    }

    .sidebar-header h4::before {
      content: "📋";
      margin-right: 0.75rem;
      font-size: 1.5rem;
    }

    .nav-item {
      margin: 0.15rem 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.85rem 1.5rem;
      color: #495057;
      text-decoration: none;
      transition: all 0.2s ease;
      border-radius: 8px;
      margin: 0 0.75rem;
      font-weight: 500;
      position: relative;
      overflow: hidden;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 3px;
      background-color: transparent;
      transition: background-color 0.2s ease;
    }

    .nav-link:hover {
      background: linear-gradient(to right, rgba(255, 112, 0, 0.08) 0%, rgba(255, 112, 0, 0.03) 100%);
      color: var(--mdc-theme-primary, #ff7000);
      transform: translateX(4px);
    }

    .nav-link:hover::before {
      background-color: var(--mdc-theme-primary, #ff7000);
    }

    .nav-link.active {
      background: linear-gradient(to right, var(--mdc-theme-primary, #ff7000) 0%, #ff8c33 100%);
      color: white;
      box-shadow: 0 4px 8px rgba(255, 112, 0, 0.2);
    }

    .nav-link.active::before {
      background-color: #fff;
    }

    .nav-icon {
      margin-right: 1rem;
      width: 24px;
      text-align: center;
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }

    .nav-link:hover .nav-icon {
      transform: translateX(2px);
    }

    .sub-menu {
      margin-left: 2.5rem;
      padding-left: 0.5rem;
      border-left: 1px dashed #dee2e6;
    }

    .sub-item {
      padding: 0.6rem 1.5rem;
      font-size: 0.9rem;
      border-radius: 6px;
      margin: 0.1rem 0.5rem;
    }

    .sub-item:hover {
      background-color: rgba(255, 112, 0, 0.08);
      color: var(--mdc-theme-primary, #ff7000);
    }

    .sub-item.active {
      background-color: var(--mdc-theme-primary, #ff7000);
      color: white;
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
        width: 260px;
        box-shadow: 2px 0 15px rgba(0,0,0,0.15);
        height: 100vh; /* Full height on mobile to overlay header and footer */
      }

      .sidebar.open {
        transform: translateX(0);
        box-shadow: 3px 0 20px rgba(0,0,0,0.25);
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  navigationItems: NavigationItem[] = [];
  isSidebarOpen = false;

  private boundHandleToggleSidebar!: () => void;

  constructor(
    private navigationService: NavigationService,
    private router: Router,
    private elementRef: ElementRef
  ) { }



  loadNavigation(): void {
    this.navigationService.getUserNavigation().subscribe({
      next: (items) => {
        this.navigationItems = items;
      },
      error: (error) => {
        console.error('Error loading navigation:', error);
        // Fallback to default navigation if API fails
        this.navigationItems = [
          {
            id: 1,
            name: 'Dashboard',
            route: '/dashboard',
            icon: 'fa fa-tachometer-alt',
            parentId: null,
            children: [],
            order: 0,
            isVisible: true
          },
          {
            id: 2,
            name: 'Users',
            route: '/users',
            icon: 'fa fa-users',
            parentId: null,
            children: [],
            order: 0,
            isVisible: true
          }
        ];
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  onNavigationClick(item: NavigationItem): void {
    // Optional: Add analytics or logging here
    console.log('Navigating to:', item.route);

    // Close sidebar on mobile after navigation
    if (this.isMobileView()) {
      this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    // Close sidebar on larger screens
    if (event.target.innerWidth > 768) {
      this.isSidebarOpen = false;
    }
  }

  ngOnInit(): void {
    this.loadNavigation();
    // Listen for custom 'toggleSidebar' event
    this.boundHandleToggleSidebar = this.handleToggleSidebar.bind(this);
    window.addEventListener('toggleSidebar', this.boundHandleToggleSidebar);

    // Listen for document clicks to close sidebar when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this), true);
  }

  ngOnDestroy(): void {
    // Remove event listeners when component is destroyed
    window.removeEventListener('toggleSidebar', this.boundHandleToggleSidebar);
    document.removeEventListener('click', this.handleDocumentClick.bind(this), true);
  }

  private handleToggleSidebar(): void {
    this.toggleSidebar();
  }

  private handleDocumentClick(event: Event): void {
    // Close sidebar if it's open and the click was outside the sidebar
    if (this.isSidebarOpen) {
      const clickedInside = this.elementRef.nativeElement.contains(event.target as Node);
      if (!clickedInside) {
        this.isSidebarOpen = false;
      }
    }
  }
}