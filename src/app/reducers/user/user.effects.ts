import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { of } from 'rxjs';
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
    switchMap(async action => {
      const keys = this.api.generateUserKeys(action.passphrase);
      const user = await this.api.authenticateUser(keys);
      return UserActions.authenticateUserSuccess({user, keys});
    }),
    catchError(error => of(UserActions.authenticateUserFailure({ error: error.message })))
  ));

  register$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.registerUser),
    switchMap(async action => {
      const keys = this.api.generateUserKeys(action.passphrase);
      await this.api.registerUser({ ...keys });
      return UserActions.authenticateUser({ passphrase: action.passphrase });
    }),
    catchError(error => of(UserActions.registerUserFailure({ error: error.message })))
  ));

  updateUserData$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.updateUserData),
    withLatestFrom(this.store.select(UserSelectors.selectUserKeys)),
    switchMap(async ([action, keys]) => {
      const user = await this.api.updateUserData({ user: action.user, ...keys });
      return UserActions.updateUserDataSuccess({ user });
    }),
    catchError(error => of(UserActions.updateUserDataFailure({ error: error.message })))
  ));

  getFollowedUsers$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.authenticateUserSuccess),
    withLatestFrom(this.store.select(UserSelectors.selectUserKeys)),
    switchMap(async ([_, keys]) => {
      const users = await this.api.getFollowedUsers({ ...keys });
      return UserActions.getFollowedUsersSuccess({ users });
    }),
    catchError(error => of(UserActions.getFollowedUsersFailure({ error: error.message })))
  ));

  followUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.followUser),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(UserSelectors.selectFollowedUsersCache),
    ),
    switchMap(async ([action, keys, followedUsers]) => {
      const user = await this.api.followUserByPublicKey({ followedUserPublicKey: action.publicKey, followedUsers, ...keys });
      console.log(user);
      return UserActions.followUserSuccess({ user });
    }),
    catchError(error => of(UserActions.followUserFailure({ error: error.message })))
  ));

  unfollowUser$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.unfollowUser),
    withLatestFrom(
      this.store.select(UserSelectors.selectUserKeys),
      this.store.select(UserSelectors.selectFollowedUsersCache),
    ),
    switchMap(async ([action, keys, followedUsers]) => {
      this.api.unfollowUserByPublicKey({ followedUserPublicKey: action.publicKey, followedUsers, ...keys });
      return UserActions.unfollowUserSuccess({ publicKey: action.publicKey });
    }),
    catchError(error => of(UserActions.unfollowUserFailure({ error: error.message })))
  ));

  redirect$ = createEffect(() => this.actions$.pipe(
    ofType(UserActions.getFollowedUsersSuccess, UserActions.getFollowedUsersFailure),
    map(_ => this.router.navigate(['/']))
  ), { dispatch: false } );

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>,
    private router: Router
  ) {}
}
