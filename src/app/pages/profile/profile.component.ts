import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { State as RootState } from '../../reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';
import { UserData } from 'src/app/models/user-data';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  isLoading$ = this.store.pipe(select(UserSelectors.selectIsLoading));
  validProfile$ = this.store.pipe(select(UserSelectors.hasValidUserData));
  error$ = this.store.pipe(select(UserSelectors.selectError));
  profileForm = this.formBuilder.group({
    nickname: ['', [Validators.required, Validators.minLength(4)]]
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

  onSubmit(): void {
    // stop here if form is invalid
    if (this.profileForm.invalid) {
        return;
    }

    this.store.dispatch(
      UserActions.updateUserData({
        user: this.form.value as UserData
      })
    );
  }

}
