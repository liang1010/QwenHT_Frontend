import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressBarService {
  private _isLoading$ = new BehaviorSubject<boolean>(false);
  
  // Expose the observable for components to subscribe
  public isLoading$ = this._isLoading$.asObservable();

  show() {
    this._isLoading$.next(true);
  }

  hide() {
    this._isLoading$.next(false);
  }
}