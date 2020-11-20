import { FollowedUser } from 'src/app/models/user-followed-users';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  memories: Memory[] | null = null;
  followedUsers: FollowedUser[] | null = null;
  accordionOpened = false;

  constructor(route: ActivatedRoute) {
    route.params.subscribe(_ => {
      const publicData = route.snapshot.data.publicData;
      this.memories = publicData.memories;
      this.followedUsers = publicData.followedUsers;
    });
  }

  ngOnInit(): void {
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
