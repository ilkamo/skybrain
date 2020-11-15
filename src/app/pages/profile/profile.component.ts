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
  validProfile$ = this.store.pipe(select(UserSelectors.hasValidUserData));
  error$ = this.store.pipe(select(UserSelectors.selectError));
  profileForm = this.formBuilder.group({
    nickname: ['']
  }, { validators: [ userDataValidator ] });

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

}
