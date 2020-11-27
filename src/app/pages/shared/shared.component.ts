import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConnectedUser } from 'src/app/models/user-connected-users';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {
  memory: Memory | null = null;
  connectedUsers: ConnectedUser[] | null = null;
  accordionOpened = false;
  publicKey: string;

  constructor(route: ActivatedRoute) {
    const sharedData = route.snapshot.data.sharedData;
    this.memory = sharedData.sharedMemory;
    this.connectedUsers = sharedData.connectedUsers;
    this.publicKey = sharedData.publicKey;
  }

  ngOnInit(): void {
  }
}
