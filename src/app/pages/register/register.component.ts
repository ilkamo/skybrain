import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { from } from 'rxjs';
import { first } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { logError } from 'src/app/utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiService,
    library: FaIconLibrary
  ) {
    library.addIcons(faEye, faEyeSlash);

    this.registerForm = this.formBuilder.group({
      nickname: ['', Validators.required],
      passphrase: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    this.loading = true;

    // TODO: Autologin checkbox?

    from(this.apiService.register({ nickname: this.form.nickname.value }, this.form.passphrase.value, true))
      .pipe(first())
      .subscribe(
          userData => {
            this.loading = false;
            this.submitted = false;
            this.registerForm.reset();
            if (userData) {
              this.router.navigate(['/']);
            }
          },
          error => {
              logError(error);
              this.loading = false;
          });
  }

}
