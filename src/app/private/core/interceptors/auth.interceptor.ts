import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from local storage
    const token = this.authService.getToken();

    if (token) {
      // Clone the request and add the bearer token to the header
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      return next.handle(clonedReq).pipe(
        catchError(error => {
          // Handle 401 Unauthorized responses
          if (error.status === 401) {
            // Clear the auth data and redirect to login
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
          return throwError(error);
        })
      );
    } else {
      // If no token, just pass the request through
      return next.handle(req).pipe(
        catchError(error => {
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
          return throwError(error);
        })
      );
    }
  }
}