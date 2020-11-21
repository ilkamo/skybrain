import { InjectionToken } from '@angular/core';
import { UserMemory } from './user-memory';
export const USER_PUBLIC_MEMORIES_KEY = new InjectionToken('skybrain-user-public-memories-key');

export interface UserPublicMemory {
  memory: UserMemory;
  publicAt: Date;
}

export interface UsersPublicMemories {
  [userPublicKey: string]: UserPublicMemory[];
}
