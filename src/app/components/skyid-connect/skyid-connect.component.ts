import { Component, Inject, InjectionToken, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import * as UserActions from '../../reducers/user/user.actions';

// @ts-ignore
import * as SkyID from 'skyid';
import { APP_NAME } from 'src/app/tokens/app-name.token';

@Component({
  selector: 'app-skyid-connect',
  templateUrl: './skyid-connect.component.html',
  styleUrls: ['./skyid-connect.component.scss']
})
export class SkyidConnectComponent implements OnInit {
  skyid;
  logged = false;

  constructor(@Inject(APP_NAME) private appName: string, private store: Store<RootState>) {
    let devMode = false;
    if (window.location.hostname === 'idtest.local' || window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
      devMode = true;
    }

    const opts = { devMode };
    this.skyid = new SkyID.SkyID(appName, (message: string) => {
      switch (message) {
        case 'login_fail':
          UserActions.registerUserFailure({ error: 'Could not login with SkyID' });
          break;
        case 'login_success':
          this.connect();
          break;
        case 'destroy':
          break;
        default:
          break;
      }
    }, opts);

    this.logged = this.skyid.seed !== '';
  }

  ngOnInit(): void {
  }

  sessionStart(): void {
    this.skyid.sessionStart();
  }

  connect(): void {
    this.store.dispatch(
      UserActions.registerUser({ passphrase: this.skyid.seed })
    );
  }
}
