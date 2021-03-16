import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { State as RootState } from '../../reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';
import { Observable, Subscription } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { CacheService } from 'src/app/services/cache.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  showPassword = false;

  error$ = this.store.pipe(select(UserSelectors.selectError));
  loginForm = this.formBuilder.group({
    passphrase: ['', [Validators.required, Validators.minLength(4)]]
  });

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<RootState>,
    private cacheService: CacheService
  ) {
    const seed = this.cacheService.getSeed();
    if (seed != "") {
      this.store.dispatch(
        UserActions.authenticateUser({ passphrase: seed })
      );
    }
  }

  ngOnInit(): void {}

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.store.dispatch(
      UserActions.authenticateUser({ passphrase: this.form.passphrase.value })
    );

    this.loginForm.reset();
  }
}
