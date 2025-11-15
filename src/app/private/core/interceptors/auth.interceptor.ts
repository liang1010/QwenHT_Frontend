import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, catchError, throwError, finalize } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ProgressBarService } from '../services/progress-bar.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router,
    private progressBarService: ProgressBarService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from local storage
    const token = this.authService.getToken();

    // Show progress bar
    this.progressBarService.show();

    let requestToHandle: Observable<HttpEvent<any>>;

    if (token) {
      // Clone the request and add the bearer token to the header
      const clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      requestToHandle = next.handle(clonedReq);
    } else {
      // If no token, just pass the request through
      requestToHandle = next.handle(req);
    }

    return requestToHandle.pipe(
      catchError(error => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          // Clear the auth data and redirect to login
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        }
        return throwError(error);
      }),
      // Hide progress bar when request completes (either success or error)
      finalize(() => {
        this.progressBarService.hide();
      })
    );
  }
}