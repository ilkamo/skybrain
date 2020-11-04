import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { UserData } from 'src/app/models/user-data';
import { UserImage } from 'src/app/models/user-image';
import { ApiService } from 'src/app/services/api.service';
import { logError } from 'src/app/utils';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements OnInit {
  userData: UserData|null;
  images$: Observable<UserImage[]>;
  imageForm: FormGroup;
  loading = false;
  submitted = false;
  reloadImages$ = new BehaviorSubject(null);

  constructor(private apiService: ApiService, private formBuilder: FormBuilder) {
    this.userData = this.apiService.userData;
    this.images$ = this.reloadImages$.asObservable().pipe(
      switchMap(_ => this.apiService.getImages())
    );
    this.imageForm =  this.formBuilder.group({
      image: ['', Validators.required],
      imageSource: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.reloadImages$.next(null);
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.imageForm.controls;
  }

  onFileChange(event: Event): void {
    const input = event?.target as EventTarget & { files: FileList };
    if (input.files.length > 0) {
      const file = input.files[0];
      this.imageForm.patchValue({
        imageSource: file
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.imageForm.invalid) {
        return;
    }

    this.loading = true;

    from(this.apiService.addImage(this.form.imageSource.value))
      .pipe(first())
      .subscribe(
          imageKey => {
            this.loading = false;
            this.submitted = false;
            this.imageForm.reset();
            this.reloadImages$.next(null);
          },
          error => {
              logError(error);
              this.loading = false;
          });
  }

  trackImage(index: number, image: UserImage): string {
    return image.skylink;
  }
}
