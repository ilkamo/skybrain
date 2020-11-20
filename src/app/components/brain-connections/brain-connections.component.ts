import { FollowedUser } from 'src/app/models/user-followed-users';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-brain-connections',
  templateUrl: './brain-connections.component.html',
  styleUrls: ['./brain-connections.component.scss']
})
export class BrainConnectionsComponent implements OnInit {
  @Input() followedUsers?: FollowedUser[];
  accordionOpened = false;
  constructor() { }

  ngOnInit(): void {
  }

}
