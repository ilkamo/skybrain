import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FollowedUser } from 'src/app/models/user-followed-users';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {
  memory: Memory | null = null;
  followedUsers: FollowedUser[] | null = null;
  accordionOpened = false;

  constructor(route: ActivatedRoute) {
    const sharedData = route.snapshot.data.sharedData;
    this.memory = sharedData.sharedMemory;
    this.followedUsers = sharedData.followedUsers;
  }

  ngOnInit(): void {
  }
}
