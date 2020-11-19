import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output } from '@angular/core';
import { Memory } from 'src/app/reducers/memory/memory.model';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit {
  @Input() memory?: Memory;
  @HostBinding('class') cardClass = 'card';
  @Input() simple = false;
  @Output() forget = new EventEmitter<Memory>();
  @Output() publish = new EventEmitter<Memory>();
  @Output() share = new EventEmitter<Memory>();

  constructor(@Inject(DOCUMENT) private document: Document) { }

  ngOnInit(): void {
  }

  forgetMe(event: MouseEvent): void {
    if (!this.memory) {
      return;
    }
    event.preventDefault();
    this.forget.emit(this.memory);
  }

  togglePublic(event: MouseEvent): void {
    if (!this.memory) {
      return;
    }
    event.preventDefault();
    this.publish.emit(this.memory);
  }

  toggleShare(event: MouseEvent): void {
    if (!this.memory) {
      return;
    }
    event.preventDefault();
    this.share.emit(this.memory);
  }

  copyToClipboard(input: HTMLInputElement): void {
    input.select();
    input.setSelectionRange(0, 99999);
    this.document.execCommand('copy');
  }
}
