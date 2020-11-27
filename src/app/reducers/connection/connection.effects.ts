import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { UsersData } from 'src/app/models/user-data';
import { ApiService } from 'src/app/services/api.service';
import * as ConnectionActions from './connection.action';

@Injectable()
export class ConnectionEffects {
  newVisitedConnection$ = createEffect(() => this.actions$.pipe(
    ofType(ConnectionActions.BeginCreateVisitedConnectionAction),
    map(connection => ConnectionActions.CreateVisitedConnectionAction(connection)),
    map(connection => ConnectionActions.SuccessCreateVisitedConnectionAction(connection))
  ));

  getConnectionData$ = createEffect(() => this.actions$.pipe(
    ofType(ConnectionActions.SuccessCreateVisitedConnectionAction),
    switchMap(action => {
      const publicKey = action.connection.publicKey;
      return from(this.api.getBrainData({ publicKey })).pipe(
        map(brainData => ConnectionActions.SuccessGetConnectionInfoAction({ connectionData: { publicKey: brainData }})),
        catchError(error => of(ConnectionActions.FailureGetConnectionInfoAction({ error: error.message })))
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
  ) { }
}
