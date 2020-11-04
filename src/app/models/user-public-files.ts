import { InjectionToken } from '@angular/core';
export const USER_PUBLIC_FILES_KEY = new InjectionToken('sia-user-public-files-key');

export interface UserPublicFile {
  skylink: string;
  publicAt: Date;
}