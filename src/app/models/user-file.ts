import { InjectionToken } from '@angular/core';
export const USER_FILES_KEY = new InjectionToken('sia-user-images-key');

export interface UserFile {
  added: Date;
  skylink: string;
  name?: string;
  tags?: string[];
}
