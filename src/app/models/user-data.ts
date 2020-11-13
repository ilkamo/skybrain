import { InjectionToken } from '@angular/core';
export const USER_DATA_KEY = new InjectionToken('sia-user-data-key');

export interface UserKeys {
  publicKey: string;
  privateKey: string;
  memoriesEncryptionKey: string;
  memoriesSkydbKey: string;
}

export interface UserData {
  nickname?: string;
}
