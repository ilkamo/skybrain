import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map } from 'rxjs/operators';
import * as ConnectionActions from './connection.action';

@Injectable()
export class ConnectionEffects {

  newVisitedConnection$ = createEffect(() => this.actions$.pipe(
    ofType(ConnectionActions.BeginCreateConnectionAction),
    map(connection => ConnectionActions.CreateConnectionAction(connection.payload))
  ));

  constructor(
    private actions$: Actions,
  ) { }
}
