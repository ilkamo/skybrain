import { InjectionToken } from '@angular/core';
export const USER_MEMORIES_KEY_PREFIX = new InjectionToken('sia-user-memories-key-prefix');

export interface UserMemory {
  id: string;
  added: Date;
  skylink?: string;
  text?: string;
  name?: string;
  tags?: string[];
  location?: string;
}

export enum EncryptionType {
  KeyPairFromSeed
}

export interface UserMemoriesEncrypted {
  encryptedMemories: string
  encryptionType: EncryptionType // to allow migration if the encryptionType changes
}
