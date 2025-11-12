import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      // If user is logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;
    } else {
      // If user is not logged in, allow access to public pages
      return true;
    }
  }
}