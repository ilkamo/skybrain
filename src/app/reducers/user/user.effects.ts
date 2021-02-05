import { CacheService } from 'src/app/services/cache.service';
// tslint:disable: no-any
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { EMPTY, from, of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../';
import { Store } from '@ngrx/store';
import * as UserSelectors from './user.selectors';
import * as UserActions from './user.actions';
import * as RouterActions from '../router/router.actions';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class UserEffects {
  authenticate$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.authenticateUser),
    switchMap(action => {
      const keys = this.api.generateUserKeys(action.passphrase);
      return from(this.api.getBrainData(keys)).pipe(
        map(user => {
            this.cacheService.persistSeed(action.passphrase);
            return UserActions.authenticateUserSuccess({user, keys});
          }),
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

  authenticated$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.getConnectedUsersSuccess, UserActions.getConnectedUsersFailure),
    map(_ => UserActions.runUserAuthAction())
  ));

  authAction$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.runUserAuthAction),
    withLatestFrom(this.store.select(UserSelectors.selectUserAuthAction)),
    switchMap(([_, action]) => {
      if (action) {
        return from([action, UserActions.runUserAuthActionSuccess({ authAction: action })]);
      }
      return of(UserActions.runUserAuthActionSuccess({}));
    })
  ));

  redirectAfterAction$ = createEffect(() => this.actions$.pipe(
    withLatestFrom(this.route.queryParams),
    switchMap(([action, query]) => {
      switch (action.type) {
        case UserActions.connectUserSuccess.type:
          const user = (action as any).user as ConnectedUser;
          return of(RouterActions.navigate({ commands: ['/connection', user.publicKey] }));
        case UserActions.runUserAuthActionSuccess.type:
          const url = query.redirect ? query.redirect : '/';
          return of(RouterActions.navigateByUrl({ url }));
        default:
          return EMPTY;
      }
    })
  ));

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private cacheService: CacheService,
    private store: Store<RootState>,
    private route: ActivatedRoute
  ) {
  }
}
