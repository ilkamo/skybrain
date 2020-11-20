import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, first } from 'rxjs/operators';
import { State } from 'src/app/reducers';
import { followUser } from 'src/app/reducers/user/user.actions';
import { selectFollowedUsers } from 'src/app/reducers/user/user.selectors';

@Component({
  selector: 'app-follow-me',
  templateUrl: './follow-me.component.html',
  styleUrls: ['./follow-me.component.scss'],
})
export class FollowMeComponent implements OnInit {
  private _publicKey: string | undefined = undefined;
  private _followed = false;
  get followed(): boolean {
    return this._followed;
  }
  @HostBinding('class')
  get class(): string {
    let classes = 'btn';
    classes += this.followed ? ' btn-success' : ' btn-primary';
    if (this.followed || !this.publicKey) {
      classes += ' disabled';
    }
    return classes;
  }
  @Input() label = 'Follow me';
  @Input() oklabel = 'Followed';
  @Input()
  set publicKey(key: string | undefined) {
    if (this._publicKey) {
      return;
    }
    const followed$ = this.store.select(selectFollowedUsers).pipe(
      filter(followed =>  followed.findIndex(f => f.publicKey === key) !== -1),
      first()
    );
    followed$.forEach(_ => this._followed = true);
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
    this.store.dispatch(followUser({ publicKey: this.publicKey }));
  }

  constructor(private store: Store<State>) {
  }

  ngOnInit(): void {
  }

}
