import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { State as RootState } from '../';
import * as RouterActions from './router.actions';

@Injectable()
export class RouterEffects {

  navigate$ = createEffect(() => this.actions$.pipe(
    ofType(RouterActions.navigate),
    map(action => {
      this.router.navigate(action.commands, action.extras);
    })
  ), { dispatch: false });

  navigateByUrl$ = createEffect(() => this.actions$.pipe(
    ofType(RouterActions.navigateByUrl),
    map(action => {
      this.router.navigateByUrl(action.url);
    })
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private store: Store<RootState>,
    private router: Router
  ) {
  }
}
