import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { spinnerActions } from '../store/spinner.actions';
import { selectSpinnerIsLoading } from '../store/spinner.selectors';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private readonly store = inject(Store);
  public readonly isLoading$ = this.store.select(selectSpinnerIsLoading);

  show() {
    this.store.dispatch(spinnerActions.show());
  }

  hide() {
    this.store.dispatch(spinnerActions.hide());
  }
}
