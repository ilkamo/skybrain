import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Memory } from 'src/app/reducers/memory/memory.model';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit {
  @HostBinding('class') cardClass = 'card';
  @Input() memory?: Memory;
  @Output() forget = new EventEmitter<Memory>();
  @Output() publish = new EventEmitter<Memory>();

  constructor() { }

  ngOnInit(): void {
  }

  forgetMe(event: MouseEvent): void {
    if (!this.memory) {
      return;
    }
    event.preventDefault();
    this.forget.emit(this.memory);
  }

  makeMePublic(event: MouseEvent): void {
    if (!this.memory) {
      return;
    }
    event.preventDefault();
    this.publish.emit(this.memory);
  }
}
