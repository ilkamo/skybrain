import { InjectionToken } from '@angular/core';
export const USER_IMAGES_KEY = new InjectionToken('sia-user-images-key');

export interface UserImage {
  added: Date;
  skylink: string;
  name?: string;
  tags?: string[];
}
