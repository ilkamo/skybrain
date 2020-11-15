import { createAction, props } from '@ngrx/store';

import { Memory } from './memory.model';

import { BaseMemory } from '../../models/user-memory';

export const getMemories = createAction(
  '[Memory] Get Memories'
);
export const getMemoriesSuccess = createAction(
  '[Memory] Get Memories Success',
  props<{ memories: Memory[] }>()
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
  props<{ memory: Memory }>()
);
export const newMemoryFailure = createAction(
  '[Memory] New Memory Failure',
  props<{ error: string }>()
);

export const forgetMemory = createAction(
  '[Memory] Forget Memory',
  props<{ id: string }>()
);
export const forgetMemorySuccess = createAction(
  '[Memory] Forget Memory Success',
  props<{ id: string }>()
);
export const forgetMemoryFailure = createAction(
  '[Memory] Forget Memory Failure',
  props<{ error: string }>()
);
