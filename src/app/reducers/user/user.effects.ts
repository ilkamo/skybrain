import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { Store } from '@ngrx/store';
import * as UserSelectors from './user.selectors';
import * as UserActions from './user.actions';
import { Router } from '@angular/router';

@Injectable()
export class UserEffects {
  authenticate$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.authenticateUser),
    switchMap(action => {
      const keys = this.api.generateUserKeys(action.passphrase);
      return from(this.api.authenticateUser(keys)).pipe(
        map(user => UserActions.authenticateUserSuccess({user, keys})),
        catchError(error => of(UserActions.authenticateUserFailure({ error: error.message })))
      );
    })
  ));

  register$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.registerUser),
    switchMap(action => {
      const keys = this.api.generateUserKeys(action.passphrase);
      return from(this.api.registerUser({ ...keys })).pipe(
        map(_ => UserActions.authenticateUser({ passphrase: action.passphrase })),
        catchError(error => of(UserActions.registerUserFailure({ error: error.message })))
      );
    })
  ));

  updateUserData$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.updateUserData),
    withLatestFrom(this.store.select(UserSelectors.selectUserKeys)),
    switchMap(([action, keys]) => {
      return from(this.api.updateUserData({ user: action.user, ...keys })).pipe(
        map(user => UserActions.updateUserDataSuccess({ user })),
        catchError(error => of(UserActions.updateUserDataFailure({ error: error.message })))
      );
    })
  ));

  getConnectedUsers$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.authenticateUserSuccess),
    withLatestFrom(this.store.select(UserSelectors.selectUserKeys)),
    switchMap(([_, keys]) => {
      return from(this.api.getConnectedUsers({ ...keys })).pipe(
        map(users =>  UserActions.getConnectedUsersSuccess({ users })),
        catchError(error => of(UserActions.getConnectedUsersFailure({ error: error.message })))
      );
    })
  ));

  connectUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.connectUser),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(UserSelectors.selectConnectedUsersCache),
    ),
    switchMap(([action, keys, connectedUsers]) => {
      return from(this.api.connectUserByPublicKey({ connectedUserPublicKey: action.publicKey, connectedUsers, ...keys })).pipe(
        map(user => UserActions.connectUserSuccess({ user })),
        catchError(error => of(UserActions.connectUserFailure({ error: error.message })))
      );
    })
  ));

  unconnectUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.unconnectUser),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(UserSelectors.selectConnectedUsersCache),
    ),
    switchMap(([action, keys, connectedUsers]) => {
      return from(this.api.unconnectUserByPublicKey({ connectedUserPublicKey: action.publicKey, connectedUsers, ...keys })).pipe(
        map(_ =>  UserActions.unconnectUserSuccess({ publicKey: action.publicKey })),
        catchError(error => of(UserActions.unconnectUserFailure({ error: error.message })))
      );
    })
  ));

  redirect$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.getConnectedUsersSuccess, UserActions.getConnectedUsersFailure),
    map(_ => this.router.navigate(['/']))
  ), { dispatch: false } );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>,
    private router: Router
  ) {
  }
}
