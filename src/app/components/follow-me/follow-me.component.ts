import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { State } from 'src/app/reducers';
import { followUser } from 'src/app/reducers/user/user.actions';
import { isAuthenticated, selectFollowedUsers } from 'src/app/reducers/user/user.selectors';

@Component({
  selector: 'app-follow-me',
  templateUrl: './follow-me.component.html',
  styleUrls: ['./follow-me.component.scss'],
})
export class FollowMeComponent implements OnInit {
  private _publicKey: string | undefined = undefined;
  private _authenticated: boolean | undefined = undefined;
  private _followed = false;
  get followed(): boolean {
    return this._followed;
  }
  @HostBinding('class')
  get class(): string {
    let classes = 'btn ' + this.cssClasses;
    classes += this.followed ? ' btn-outline-success' : ' btn-outline-primary';
    if (this.followed || !this.publicKey) {
      classes += ' disabled';
    }
    return classes;
  }
  @Input() cssClasses = '';
  @Input() label = 'Connect';
  @Input() oklabel = 'Connected';
  @Input()
  set publicKey(key: string | undefined) {
    if (this._publicKey) {
      return;
    }
    const followed$ = this.store.select(selectFollowedUsers).pipe(
      filter(followed =>  followed.findIndex(f => f.publicKey === key) !== -1),
      first()
    );
    const isAuthenticated$ = this.store.select(isAuthenticated).pipe(
      first()
    );
    followed$.forEach(_ => this._followed = true);
    isAuthenticated$.forEach(auth => this._authenticated = auth);
    this._publicKey = key;
  }
  get publicKey(): string | undefined {
    return this._publicKey;
  }
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();
    if (!this.publicKey || this.followed) {
      return;
    }
    if (!this._authenticated) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.store.dispatch(followUser({ publicKey: this.publicKey }));
  }

  constructor(private store: Store<State>, private router: Router) {
  }

  ngOnInit(): void {
  }

}
