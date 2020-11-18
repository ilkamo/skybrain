import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss']
})
export class SharedComponent implements OnInit {
  memory: Memory | null = null;
  isAuthenticated: boolean;

  constructor(route: ActivatedRoute) {
    this.memory = route.snapshot.data.sharedData.memory;
    this.isAuthenticated = route.snapshot.data.sharedData.auth;
  }

  ngOnInit(): void {
  }
}
