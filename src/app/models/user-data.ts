import { InjectionToken } from '@angular/core';
export const USER_DATA_KEY = new InjectionToken('sia-user-data-key');

export interface UserData {
  nickname?: string;
}
