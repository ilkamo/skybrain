import { Directive, Input } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';

@Directive({
  selector: '[appConnectForm]'
})
export class ConnectFormDirective {

  // tslint:disable-next-line: no-any
  @Input('appConnectForm') set data(val: any) {
    if (val && typeof val === 'object') {
      this.formGroup.form.patchValue(val);
      this.formGroup.form.markAsUntouched();
    }
  }

  constructor( private formGroup: FormGroupDirective ) { }

}
