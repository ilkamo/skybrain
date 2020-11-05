import { InjectionToken } from '@angular/core';
import { UserMemory } from './user-memory';
export const USER_PUBLIC_MEMORIES_KEY = new InjectionToken('sia-user-public-memories-key');

export interface UserPublicMemory {
  memory: UserMemory;
  publicAt: Date;
}
