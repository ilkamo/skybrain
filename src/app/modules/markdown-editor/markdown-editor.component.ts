import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import '@github/markdown-toolbar-element';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {
  markdownTextAreaControlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;

  @Input() textAreaValue = '';
  @Output() textAreaValueChange = new EventEmitter<string>();

  constructor() {
  }

  ngOnInit(): void {
  }

  propagateChange(ev: any): void {
    this.textAreaValueChange.emit(ev.target.value);
  }
}
