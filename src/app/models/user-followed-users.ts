import { InjectionToken } from '@angular/core';
export const USER_FOLLOWED_USERS_KEY = new InjectionToken('sia-user-followed-users-key');

/* 
    Storing the public key of the followed user allows to access him/her 'USER_PUBLIC_MEMORIES_KEY' file in SkyDB where all the public memories are stored.
    This mechanism allows, navigating the tree of all the users, to create a timeline with all the public memories from the followed users.
*/
export interface FollowedUser {
  publicKey: string;
  startedAt: Date;
}
