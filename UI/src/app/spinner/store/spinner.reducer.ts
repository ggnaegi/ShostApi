import { createReducer, on } from '@ngrx/store';
import { spinnerActions } from './spinner.actions';

export const spinnerFeatureKey = 'spinner';

export interface SpinnerState {
  loadingCount: number;
  isLoading: boolean;
}

export const initialSpinnerState: SpinnerState = {
  loadingCount: 0,
  isLoading: true,
};

export const spinnerReducer = createReducer(
  initialSpinnerState,
  on(spinnerActions.show, state => ({
    ...state,
    loadingCount: state.loadingCount + 1,
    isLoading: true,
  })),
  on(spinnerActions.hide, state => {
    const nextLoadingCount = Math.max(0, state.loadingCount - 1);

    return {
      ...state,
      loadingCount: nextLoadingCount,
      isLoading: nextLoadingCount > 0,
    };
  }),
);
