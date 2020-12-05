import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

import '@github/markdown-toolbar-element';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {

  markdownTextAreaControlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;
  @Input() controlId: string | undefined | null;

  @Input() textAreaValue: string | undefined | null;
  @Output() textAreaValueChange = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
  }

  logChange(ev: any): void {
    this.textAreaValueChange.emit(ev.target.value);
  }
}
