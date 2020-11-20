import { FollowedUser } from 'src/app/models/user-followed-users';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss']
})
export class ConnectionComponent implements OnInit {
  memories: Memory[] | null = null;
  followedUsers: FollowedUser[] | null = null;
  accordionOpened = false;

  constructor(route: ActivatedRoute) {
    route.params.subscribe(_ => {
      this.memories = route.snapshot.data.publicMemories;
      this.followedUsers = route.snapshot.data.followedUsers;
    });
  }

  ngOnInit(): void {
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
