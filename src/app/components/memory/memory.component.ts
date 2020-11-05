import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { UserMemory } from 'src/app/models/user-memory';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit {
  forgeting = false;
  @HostBinding('class') cardClass = 'card';
  @Input() memory?: UserMemory;
  @Output() forget = new EventEmitter<UserMemory>();

  constructor() { }

  ngOnInit(): void {
  }

  forgetMe(event: MouseEvent): void {
    if (this.forgeting || !this.memory) {
      return;
    }
    this.forgeting = true;
    event.preventDefault();
    this.forget.emit(this.memory);
  }
}
