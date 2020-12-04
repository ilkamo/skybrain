import { TextFieldModule } from '@angular/cdk/text-field';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextFieldModule
  ],
  exports: [
    MarkdownEditorComponent
  ],
  declarations: [
    MarkdownEditorComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class MarkdownEditorModule { }
