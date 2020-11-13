import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Memory } from './memory.model';

export const loadMemories = createAction(
  '[Memory/API] Load Memories',
  props<{ memories: Memory[] }>()
);

export const addMemory = createAction(
  '[Memory/API] Add Memory',
  props<{ memory: Memory }>()
);

export const upsertMemory = createAction(
  '[Memory/API] Upsert Memory',
  props<{ memory: Memory }>()
);

export const addMemories = createAction(
  '[Memory/API] Add Memories',
  props<{ memories: Memory[] }>()
);

export const upsertMemories = createAction(
  '[Memory/API] Upsert Memories',
  props<{ memories: Memory[] }>()
);

export const updateMemory = createAction(
  '[Memory/API] Update Memory',
  props<{ memory: Update<Memory> }>()
);

export const updateMemories = createAction(
  '[Memory/API] Update Memories',
  props<{ memories: Update<Memory>[] }>()
);

export const deleteMemory = createAction(
  '[Memory/API] Delete Memory',
  props<{ id: string }>()
);

export const deleteMemories = createAction(
  '[Memory/API] Delete Memories',
  props<{ ids: string[] }>()
);

export const clearMemories = createAction(
  '[Memory/API] Clear Memories'
);
