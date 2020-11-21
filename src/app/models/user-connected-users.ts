import { InjectionToken } from '@angular/core';
export const USER_CONNECTED_USERS_KEY = new InjectionToken('skybrain-user-connected-users-key');
export const SKYBRAIN_ACCOUNT_PUBLIC_KEY = new InjectionToken('skybrain-account-public-key');

/*
    Storing the public key of the connected user allows to access him/her
    'USER_PUBLIC_MEMORIES_KEY' file in SkyDB where all the public memories are stored.
    This mechanism allows, navigating the tree of all the users, to create a timeline with all the public memories from the connected users.
*/
export interface ConnectedUser {
  publicKey: string;
  startedAt: Date;
}
