import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { State as RootState } from '../../reducers';
import { Store, select } from '@ngrx/store';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as UserActions from '../../reducers/user/user.actions';
import { UserData, userDataValidator } from '../../models/user-data';
import { SKYBRAIN_ACCOUNT_PUBLIC_KEY } from 'src/app/models/user-connected-users';
import { CacheService } from 'src/app/services/cache.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userData$ = this.store.pipe(select(UserSelectors.selectUserData));
  connectedUsers$ = this.store.pipe(select(UserSelectors.selectConnectedUsers));
  validProfile$ = this.store.pipe(select(UserSelectors.hasValidUserData));
  error$ = this.store.pipe(select(UserSelectors.selectError));
  profileForm = this.formBuilder.group({
    nickname: [''],
    description: ['', Validators.maxLength(300)]
  }, { validators: [ userDataValidator ] });
  connectedForm = this.formBuilder.group({
    publicKey: ['', [Validators.required, Validators.minLength(10)] ]
  });
  skybrainAccountPublicKey: string;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<RootState>,
    @Inject(SKYBRAIN_ACCOUNT_PUBLIC_KEY) skybrainAccountPublicKey: string,
    private cacheService: CacheService,
  ) {
    this.skybrainAccountPublicKey = skybrainAccountPublicKey;
  }

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
    return this.connectedForm.controls;
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

  unconnect(publicKey: string): void {
    this.store.dispatch(
      UserActions.unconnectUser({
        publicKey
      })
    );
  }

  addFolower(): void {
    // stop here if form is invalid
    if (this.connectedForm.invalid) {
        return;
    }
    this.store.dispatch(
      UserActions.connectUser({
        publicKey: this.connectedForm.controls.publicKey.value
      })
    );
    this.connectedForm.reset();
  }

  resolveConnectionName(publicKey: string): string {
    return this.cacheService.resolveNameFromPublicKey(publicKey);
  }
}
