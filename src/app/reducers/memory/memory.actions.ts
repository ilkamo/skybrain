import { createAction, props } from '@ngrx/store';

import { Memory } from './memory.model';

import { BaseMemory } from '../../models/user-memory';
import { ConnectedUser } from 'src/app/models/user-connected-users';

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

export const makePublicMemory = createAction(
  '[Memory] Make Public Memory',
  props<{ id: string, toggle: boolean }>()
);
export const makePublicMemorySuccess = createAction(
  '[Memory] Make Public Memory Success',
  props<{ id: string, isPublic?: true }>()
);
export const makePublicMemoryFailure = createAction(
  '[Memory] Make Public Memory Failure',
  props<{ error: string }>()
);

export const getShareMemoryLink = createAction(
  '[Memory] Get Share Memory Link',
  props<{ id: string, toggle: boolean }>()
);
export const getShareMemoryLinkSuccess = createAction(
  '[Memory] Get Share Memory Link Success',
  props<{ id: string, link?: string, isShared?: true }>()
);
export const getShareMemoryLinkFailure = createAction(
  '[Memory] Get Share Memory Link Failure',
  props<{ error: string }>()
);

export const connectedUsersMemoriesSuccess = createAction(
  '[Memory] Connected Users Memories Success',
  props<{ memories: Memory[], connectedUsers: ConnectedUser[] }>()
);

export const connectedUsersMemoriesFailure = createAction(
  '[Memory] Connected Users Memories Failure',
  props<{ connectedUsers: ConnectedUser[], error: string }>()
);
