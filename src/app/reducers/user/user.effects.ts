import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { State as RootState } from '../../reducers';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';

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

  constructor(
    private actions$: Actions,
    private api: ApiService,
    private store: Store<RootState>
  ) {}
}
