import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import * as ConnectionActions from './connection.action';
import * as ConnectionSelectors from './connection.selectors';
import { State as RootState } from '../';

@Injectable()
export class ConnectionEffects {
  newVisitedConnection$ = createEffect(() => this.actions$.pipe(
    ofType(ConnectionActions.beginCreateVisitedConnectionAction),
    withLatestFrom(
      this.store.select(ConnectionSelectors.selectConnectionsInfo),
    ),
    map(([action, connectionsInfo]) => {
      const connectionPublicKey = action.connection.publicKey;
      const connectionInfoIsPresent = (connectionPublicKey in connectionsInfo);
      if (!connectionInfoIsPresent) {
        this.store.dispatch(ConnectionActions.beginGetConnectionInfoAction({ publicKey: connectionPublicKey }));
      }
      return ConnectionActions.createVisitedConnectionAction({ connection: action.connection});
    }),
    map(connection => ConnectionActions.successCreateVisitedConnectionAction(connection))
  ));

  getConnectionData$ = createEffect(() => this.actions$.pipe(
    ofType(ConnectionActions.beginGetConnectionInfoAction),
    switchMap(action => {
      const publicKey = action.publicKey;
      return from(this.api.getBrainData({ publicKey })).pipe(
        map(brainData => ConnectionActions.successGetConnectionInfoAction({ connectionData: { [publicKey]: brainData }})),
        catchError(error => of(ConnectionActions.failureGetConnectionInfoAction({ error: error.message })))
      );
    })
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>,
  ) { }
}
