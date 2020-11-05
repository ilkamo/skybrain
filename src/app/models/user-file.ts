import { InjectionToken } from '@angular/core';
export const USER_MEMORIES_KEY_PREFIX = new InjectionToken('sia-user-memories-key-prefix');

export interface UserMemory {
  added: Date;
  skylink?: string;
  text?: string;
  name?: string;
  tags?: string[];
  location?: string;
}
