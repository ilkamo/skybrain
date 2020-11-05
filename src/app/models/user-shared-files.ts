import { InjectionToken } from '@angular/core';
export const USER_SHARED_MEMORIES_KEY = new InjectionToken('sia-user-shared-memories-key');

/* 
    The link to a shared file with an external user is in the format `base64(userPublicKey+memoryUUID+uniqueFileEncryptionKey)`.

    `base64` is the bidirectional hashing function.
    `userPublicKey` allows to lookup the SkyDB of the user that is sharing the file under the userSharedFiles.json key. 
    `memoryUUID` is the key/name of the shared file. 
    `uniqueFileEncryptionKey` allows to decrypt and dispaly the content of the file.
*/
export interface UserSharedMemory {
  skylink: string;
  sharedAt: Date;
}

export interface UserSharedMemories {
  [memoryUUID: string]: UserSharedMemory;
}
