import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private loadingCount = 0;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  spinnerIsOn(): boolean {
    return this.loadingSubject.value;
  }

  show() {
    this.loadingCount++;
    this.loadingSubject.next(true);
  }

  hide() {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }

    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
    }
  }
}
