import { InjectionToken } from '@angular/core';
import { EncryptionType } from './encryption';
export const USER_MEMORIES_KEY_PREFIX = new InjectionToken('sia-user-memories-key-prefix');

export interface BaseMemory {
  text?: string;
  name?: string;
  tags?: string[];
  location?: string;
}

export interface UserMemory extends BaseMemory {
  id: string;
  added: Date;
  mimeType: string | null;
  skylink?: string;
}

export interface UserMemoriesEncrypted {
  encryptedMemories: string;
  encryptionType: EncryptionType; // to allow migration if the encryptionType changes
}
