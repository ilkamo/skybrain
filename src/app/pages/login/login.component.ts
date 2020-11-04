import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { from } from 'rxjs';
import { first } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { logError } from 'src/app/utils';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    library: FaIconLibrary
  ) {
    library.addIcons(faEye, faEyeSlash);

    this.loginForm = this.formBuilder.group({
      nickname: ['', Validators.required],
      passphrase: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  ngOnInit(): void {
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
        return;
    }

    this.loading = true;
    from(this.apiService.login(this.form.nickname.value, this.form.passphrase.value))
      .pipe(first())
      .subscribe(
          userData => {
            this.loading = false;
            this.submitted = false;
            this.loginForm.reset();
            if (userData) {
              this.router.navigate([this.returnUrl]);
            }
          },
          error => {
              logError(error);
              this.loading = false;
          });
  }

}
