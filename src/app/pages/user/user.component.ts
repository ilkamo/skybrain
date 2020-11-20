import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';
@Component({
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  memories: Memory[] | null = null;
  publicKey: string;

  constructor(route: ActivatedRoute) {
    this.memories = route.snapshot.data.memories;
    this.publicKey = route.snapshot.params.publicKey;
  }

  ngOnInit(): void {
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
