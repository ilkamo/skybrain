import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { State as RootState } from '../../reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  showPassword = false;

  error$ = this.store.pipe(select(UserSelectors.selectError));
  registerForm = this.formBuilder.group({
    passphrase: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<RootState>
  ) {
  }

  ngOnInit(): void {
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    // TODO: Autologin checkbox?

    this.store.dispatch(
      UserActions.registerUser({
        passphrase: this.form.passphrase.value
      })
    );

    this.registerForm.reset();
  }
}
