import { InjectionToken } from '@angular/core';
import { UserMemory } from './user-memory';

export const STREAM_MEMORIES_KEY = new InjectionToken('skybrain-user-public-memories-key');

export interface StreamMemory extends UserMemory {
  ownerPublicKey: string;
}

export interface StreamMemories {
  memories: StreamMemory[];
  lastProcessDate: Date;
}
