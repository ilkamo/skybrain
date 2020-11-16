import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { State as RootState } from '../../reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';
import { UserData, userDataValidator } from '../../models/user-data';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData$ = this.store.pipe(select(UserSelectors.selectUserData));
  followedUsers$ = this.store.pipe(select(UserSelectors.selectFollowedUsers));
  validProfile$ = this.store.pipe(select(UserSelectors.hasValidUserData));
  error$ = this.store.pipe(select(UserSelectors.selectError));
  profileForm = this.formBuilder.group({
    nickname: ['']
  }, { validators: [ userDataValidator ] });
  followedForm = this.formBuilder.group({
    publicKey: ['', [Validators.required, Validators.minLength(10)] ]
  });

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<RootState>
  ) { }

  ngOnInit(): void {
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.profileForm.controls;
  }

  get fform(): {
    [key: string]: AbstractControl;
  } {
    return this.followedForm.controls;
  }

  onSubmit(): void {
    // stop here if form is invalid
    if (this.profileForm.invalid) {
        return;
    }

    this.store.dispatch(
      UserActions.updateUserData({
        user: this.profileForm.value as UserData
      })
    );
  }

  unfollow(publicKey: string): void {
    this.store.dispatch(
      UserActions.unfollowUser({
        publicKey
      })
    );
  }

  addFolower(): void {
    // stop here if form is invalid
    if (this.followedForm.invalid) {
        return;
    }
    this.store.dispatch(
      UserActions.followUser({
        publicKey: this.followedForm.controls.publicKey.value
      })
    );
    this.followedForm.reset();
  }

}
