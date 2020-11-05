import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { Memory } from 'src/app/models/memory';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit {
  forgeting = false;
  @HostBinding('class') cardClass = 'card';
  @Input() memory?: Memory;
  @Output() forget = new EventEmitter<Memory>();

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
