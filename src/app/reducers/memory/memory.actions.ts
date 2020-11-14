import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Memory } from './memory.model';

import { BaseMemory, UserMemory } from '../../models/user-memory';

export const getMemories = createAction(
  '[Memory] Get Memories'
);

export const getMemoriesSuccess = createAction(
  '[Memory] Get Memories Success',
  props<{ memories: UserMemory[] }>()
);

export const getMemoriesFailure = createAction(
  '[Memory] Get Memories Failure',
  props<{ error: string }>()
);

export const newMemory = createAction(
  '[Memory] New Memory',
  props<{ memory: BaseMemory, file?: File }>()
);

export const newMemorySuccess = createAction(
  '[Memory] New Memory Success',
  props<{ memory: UserMemory }>()
);

export const newMemoryFailure = createAction(
  '[Memory] New Memory Failure',
  props<{ error: string }>()
);

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
