import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    // First check synchronously if the user is authenticated with a valid access token
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // If access token is expired, attempt to refresh it asynchronously
    return this.authService.isAuthenticatedAsync().pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to login page if not authenticated even after refresh attempt
          this.router.navigate(['/auth/login']);
          return false;
        }
      }),
      catchError(() => {
        // Handle errors by redirecting to login
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }
}