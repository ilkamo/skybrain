import { UserMemory } from './../../models/user-memory';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { first, map } from 'rxjs/operators';
import { BaseMemory } from 'src/app/models/user-memory';
import { Store, select } from '@ngrx/store';
import { State as RootState } from '../../reducers';
import * as MemomrySelectors from '../../reducers/memory/memory.selectors';
import * as UserSelectors from '../../reducers/user/user.selectors';
import * as MemomryActions from '../../reducers/memory/memory.actions';
import { Memory } from 'src/app/reducers/memory/memory.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-memories',
  templateUrl: './memories.component.html',
  styleUrls: ['./memories.component.scss']
})
export class MemoriesComponent implements OnInit {
  memories$ = this.store.pipe(select(MemomrySelectors.selectMemories));
  userPublicKey$ = this.store.pipe(select(UserSelectors.selectUserPublicKey));
  error$ = this.store.pipe(select(MemomrySelectors.selectError));
  uploadForm: FormGroup;

  onlyMyMemoris = new FormControl();
  formSubscription = new Subscription();

  formOpened = false;
  memoryText = '';
  displayPreview = false;

  memoriesSubscription = new Subscription();
  allMemories: Memory[] = [];
  displayedMemories: Memory[] = [];
  tempMemories: Memory[] = [];
  displayedIndex = 0;
  toDisplayOnInit = 3;

  constructor(private store: Store<RootState>, private formBuilder: FormBuilder) {
    this.uploadForm = this.formBuilder.group({
      file: [''],
      tags: [''],
      location: ['']
    });
  }

  ngOnDestroy(): void {
    this.memoriesSubscription.unsubscribe();
    this.formSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.memoriesSubscription.add(
      this.memories$.subscribe((m) => {
        this.allMemories = m;
        this.displayedMemories = [];
        this.displayedIndex = 0;

        if (this.displayedIndex === 0) {
          // If possibile, display `toDisplayOnInit` memories on the timeline.
          for (let i = 0; i < this.toDisplayOnInit; i++) {
            this.onScroll();
          }
        }
      })
    );

    this.onShowOnlyMyMemoriesChange();

    this.memories$.pipe(
      first(),
      map(memories => memories.filter(m => !m.connectedId).length),
    ).forEach(l => this.formOpened = l === 0);
  }

  private onShowOnlyMyMemoriesChange() {
    this.formSubscription.add(
      this.onlyMyMemoris.valueChanges.subscribe(val => {
        if (val == true) {
          this.tempMemories = this.allMemories.slice();
          this.allMemories = this.allMemories.filter(m => !m.connectedId);
        } else {
          this.allMemories = this.tempMemories.slice();
        }

        this.resetDisplayedIndex();
        this.displayedMemories = this.allMemories.slice(0, this.displayedIndex);
      })
    );
  }

  private resetDisplayedIndex() {
    this.displayedIndex = 0;
    // If possibile, display `toDisplayOnInit` memories on the timeline.
    for (let i = 0; i < this.toDisplayOnInit; i++) {
      if (this.allMemories.length > i) {
        this.displayedIndex++;
      }
    }
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
      location: this.form.location.value,
      tags: this.form.tags.value ? this.form.tags.value.split(/[\s,]+/)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length) : [],
      text: this.memoryText,
    };

    this.store.dispatch(MemomryActions.newMemory({ memory, file: this.form.file.value }));
    this.uploadForm.reset();
    this.memoryText = '';
  }

  forgetMemory(memory: Memory): void {
    this.store.dispatch(MemomryActions.forgetMemory({ id: memory.id }));
  }

  publishMemory(memory: Memory): void {
    const toggle = !memory.isPublic;
    this.store.dispatch(MemomryActions.makePublicMemory({ id: memory.id, toggle }));
  }

  shareMemory(memory: Memory): void {
    const toggle = !memory.isShared;
    this.store.dispatch(MemomryActions.getShareMemoryLink({ id: memory.id, toggle }));
  }

  trackMemory(index: number, memory: Memory): string {
    return memory.id;
  }

  onScroll() {
    if (this.allMemories.length > this.displayedIndex) {
      this.displayedIndex++;
      this.displayedMemories = this.allMemories.slice(0, this.displayedIndex);
    }
  }

  canShowMore(): boolean {
    return this.allMemories.length > this.displayedIndex;
  }
}
