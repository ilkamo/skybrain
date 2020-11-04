import { InjectionToken } from '@angular/core';
export const USER_FOLLOWS_KEY = new InjectionToken('sia-user-follows-key');

/* 
    Storing the public key of the followed user allows to access him/her 'userPublicFiles.json' file in SkyDB where all the public files are stored.
    This mechanism allows, navigating the tree of all the users, to create a timeline with all the public files from the followed users.
*/
export interface UserFollows {
  publicKey: string;
  startedAt: Date;
}
