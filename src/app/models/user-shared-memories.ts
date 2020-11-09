import { InjectionToken } from '@angular/core';
import { UserMemory } from './user-memory';
export const USER_SHARED_MEMORIES_KEY = new InjectionToken('sia-user-shared-memories-key');

/* 
    The link to a shared file with an external user is in the format `base64(userPublicKey+sharedId+uniqueFileEncryptionKey)`.

    `base64` is the bidirectional hashing function.
    `userPublicKey` allows to lookup the SkyDB of the user that is sharing the file under the userSharedFiles.json key. 
    `memoryUUID` is the key/name of the shared file. 
    `uniqueFileEncryptionKey` allows to decrypt and dispaly the content of the file.
*/
export interface UserSharedMemory {
  sharedId: string;
  memoryId: string; // needed if the user want to revoke the access
  encryptedMemory: string;
  sharedAt: Date;
}

export interface UserSharedMemoryLink {
  publicKey: string;
  sharedId: string;
  encryptionKey: string;
}