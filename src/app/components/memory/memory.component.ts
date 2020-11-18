import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostBinding, Inject, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Memory } from 'src/app/reducers/memory/memory.model';

@Component({
  selector: 'app-memory',
  templateUrl: './memory.component.html',
  styleUrls: ['./memory.component.scss']
})
export class MemoryComponent implements OnInit {
  @HostBinding('class') cardClass = 'card';
  @Input() memory?: Memory;
  @Input() simple = false;
  @Output() forget = new EventEmitter<Memory>();
  @Output() publish = new EventEmitter<Memory>();
  @Output() share = new EventEmitter<Memory>();

  constructor(@Inject(DOCUMENT) private document: Document, private router: Router) { }

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

  getSharedLink(code?: string): string {
    if (!code) {
      return '';
    }
    return this.router.createUrlTree(['/shared', code]).toString();
  }

  copyToClipboard(input: HTMLInputElement): void {
    input.select();
    input.setSelectionRange(0, 99999);
    this.document.execCommand('copy');
  }
}
