import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCommentDots } from '@fortawesome/free-regular-svg-icons';
import { faCommentMedical, faLink } from '@fortawesome/free-solid-svg-icons';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { first, shareReplay, switchMap } from 'rxjs/operators';
import { UserData } from 'src/app/models/user-data';
import { BaseMemory, UserMemory } from 'src/app/models/user-memory';
import { ApiService } from 'src/app/services/api.service';
import { logError } from 'src/app/utils';
import { Store, select } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import * as MemomrySelectors from '../../reducers/memory/memory.selectors';
import * as MemomryActions from '../../reducers/memory/memory.actions';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.scss']
})
export class WallComponent implements OnInit {
  memories$ = this.store.pipe(select(MemomrySelectors.selectMemories));
  isLoading$ = this.store.pipe(select(MemomrySelectors.selectIsLoading), shareReplay(1));
  error$ = this.store.pipe(select(MemomrySelectors.selectError));
  uploadForm: FormGroup;

  constructor(private store: Store<RootState>, private formBuilder: FormBuilder) {
    this.uploadForm =  this.formBuilder.group({
      file: [''],
      text: [''],
      tags: [''],
      location: ['']
    });
  }

  ngOnInit(): void {
    this.store.dispatch(MemomryActions.getMemories());
  }

  get form(): {
    [key: string]: AbstractControl;
  } {
    return this.uploadForm.controls;
  }

  onSubmit(): void {
    // stop here if form is invalid
    if (this.uploadForm.invalid) {
        return;
    }

    const memory: BaseMemory = {
      id: uuidv4(),
      added: new Date(Date.now()),
      location: this.form.location.value,
      tags: this.form.tags.value.split(',').map((item: string) => item.trim()),
      text: this.form.text.value,
    };

    this.store.dispatch(MemomryActions.newMemory({ memory, file: this.form.file.value }));
  }

  forgetMemory(memory: UserMemory): void {
    /* if (!memory || !memory.skylink) {
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
          }); */
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }
}
