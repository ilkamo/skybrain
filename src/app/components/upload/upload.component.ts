import { Component, HostListener, Input, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UploadComponent), multi: true }
  ]
})
export class UploadComponent implements ControlValueAccessor, OnDestroy {
  @Input() label = 'Attach an image, audio or video';
  @Input() disabled = false;
  @Input() accept?: string;
  @Input() formControlName?: string;
  @Input() valid = true;

  private file: File | null = null;
  private subscription?: Subscription;
  id = '_' + Math.random().toString(36).substr(2, 9);
  propagateChange: (file: File | null) => void = () => {};
  get selectedFile(): string {
    return this.file ? this.file.name : 'No file selected';
  }

  @HostListener('change', ['$event.target.files']) emitFiles( event: FileList ): void {
    const file = event && event.item(0);
    this.file = file;
    this.propagateChange(this.file);
  }

  constructor() {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  writeValue(value: File): void {
    if (value && value.type) {
      this.file = value;
    }
  }

  registerOnChange(fn: (file: File | null) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(): void {}

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
