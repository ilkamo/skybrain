import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import '@github/markdown-toolbar-element';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {

  controlId = `MarkdownEditor-${Math.floor(100000 * Math.random())}`;
  @HostBinding('class.focus') isFocus = false;
  @Input() controlName: string | undefined | null;

  constructor() {
  }

  ngOnInit(): void {
  }

  focus(): void {
    this.isFocus = true;
  }

  blur(): void {
    this.isFocus = false;
  }
}
