import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faCommentMedical, faLink } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { first, switchMap } from 'rxjs/operators';
import { UserData } from 'src/app/models/user-data';
import { UserMemory } from 'src/app/models/user-memory';
import { ApiService } from 'src/app/services/api.service';
import { logError } from 'src/app/utils';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements OnInit {
  userData: UserData|null;
  memories$: Observable<UserMemory[]>;
  uploadForm: FormGroup;
  loading = false;
  submitted = false;
  reloadMemories$ = new BehaviorSubject(null);

  constructor(private apiService: ApiService, private formBuilder: FormBuilder, library: FaIconLibrary) {
    library.addIcons(faCommentDots, faCommentMedical, faLink);
    this.userData = this.apiService.userData;
    this.memories$ = this.reloadMemories$.asObservable().pipe(
      switchMap(_ => this.apiService.getMemories())
    );
    this.uploadForm =  this.formBuilder.group({
      file: [''],
      text: [''],
      tags: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.reloadMemories$.next(null);
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.uploadForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.uploadForm.invalid) {
        return;
    }

    this.loading = true;

    from(this.apiService.addMemory(this.form.file.value, this.form.text.value, this.form.tags.value, this.form.location.value))
      .pipe(first())
      .subscribe(
          _ => {
            this.loading = false;
            this.submitted = false;
            this.uploadForm.reset();
            this.reloadMemories$.next(null);
          },
          error => {
              logError(error);
              this.loading = false;
          });
  }

  forgetMemory(memory: UserMemory): void {
    if (!memory || !memory.skylink) {
      return;
    }
    from(this.apiService.deleteMemory(memory.skylink))
      .pipe(first())
      .subscribe(
          _ => {
            this.reloadMemories$.next(null);
          },
          error => {
              logError(error);
              this.reloadMemories$.next(null);
          });
  }

  trackMemory(index: number, image: UserMemory): string {
    return (image.skylink || image.text) as string;
  }
}
