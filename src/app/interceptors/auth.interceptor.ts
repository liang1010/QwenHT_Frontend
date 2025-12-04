import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, switchMap, catchError, finalize, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProgressBarService } from '../services/progress-bar.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private progressBarService: ProgressBarService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Show progress bar for requests that need authentication
    // You might want to exclude certain requests (e.g., login, public endpoints)
    // if (!req.url.includes('/account/login') && !req.url.includes('/account/refresh-token')) {
      this.progressBarService.show();
    // }

    const token = this.authService.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next.handle(authReq).pipe(
      catchError((error: any) => { // Explicitly type error as any
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.log("AuthInterceptor: 401 received, attempting refresh for URL:", req.url);

          // Attempt to refresh token and retry request
          return this.authService.refreshToken().pipe(
            switchMap(newToken => {
              console.log("AuthInterceptor: Retry request after refresh for URL:", req.url);
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              // Retry the *original* request with the new token
              // The finalize here applies only to the retry chain
              return next.handle(retryReq).pipe(
                finalize(() => this.progressBarService.hide()) // Hide progress bar after retry completes
              );
            }),
            catchError(refreshErr => {
              console.error("AuthInterceptor: Refresh failed or retry failed, logging out.", refreshErr);
              // The AuthService.logout() is called inside refreshToken() on failure
              // We return EMPTY here to prevent the original 401 error from propagating
              // and potentially causing multiple logout attempts or navigation issues.
              // The finalize block for the *original* request chain (below) will still run.
              return EMPTY;
            })
          );
        }
        // For errors other than 401, or if refresh fails, propagate the error
        return throwError(() => error);
      }),
      finalize(() => {
        // Hide progress bar for the original request chain or the retry chain if it didn't go through the inner finalize
        // Note: If the 401 path is taken and the retry succeeds/throws, its inner finalize handles it.
        // If the 401 path is taken and refresh fails, EMPTY is returned, and this finalize runs once.
        // If no 401 occurs, this finalize runs once for the original request.
        // Using a counter or request-specific handling might be needed if requests can overlap significantly
        // and the progress bar logic depends on the number of active requests.
        this.progressBarService.hide();
      })
    );
  }
}
