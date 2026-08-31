import { createActionGroup, emptyProps } from '@ngrx/store';

export const spinnerActions = createActionGroup({
  source: 'Spinner',
  events: {
    Show: emptyProps(),
    Hide: emptyProps(),
  },
});
