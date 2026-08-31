import { createFeatureSelector, createSelector } from '@ngrx/store';
import { spinnerFeatureKey, SpinnerState } from './spinner.reducer';

export const selectSpinnerState =
  createFeatureSelector<SpinnerState>(spinnerFeatureKey);

export const selectSpinnerIsLoading = createSelector(
  selectSpinnerState,
  state => state.isLoading,
);
