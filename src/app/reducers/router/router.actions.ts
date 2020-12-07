import { NavigationExtras } from '@angular/router';
import { Action, createAction, props } from '@ngrx/store';

export const navigate = createAction(
  '[Router] Navigate',
  // tslint:disable-next-line: no-any
  props<{ commands: any[], extras?: NavigationExtras | undefined, authAction?: Action }>()
);

export const navigateByUrl = createAction(
  '[Router] Navigate By URL',
  // tslint:disable-next-line: no-any
  props<{ url: string, authAction?: Action }>()
);
