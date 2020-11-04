import { InjectionToken } from '@angular/core';
export const USER_SHARED_FILES_KEY = new InjectionToken('sia-user-shared-files-key');

/* 
    The link to a shared file with an external user is in the format `base64(userPublicKey+fileUUID+uniqueFileEncryptionKey)`.

    `base64` is the bidirectional hashing function.
    `userPublicKey` allows to lookup the SkyDB of the user that is sharing the file under the userSharedFiles.json key. 
    `fileUUID` is the key/name of the shared file. 
    `uniqueFileEncryptionKey` allows to decrypt and dispaly the content of the file.
*/
export interface UserSharedFile {
  skylink: string;
  sharedAt: Date;
}

export interface UserSharedFiles {
  [fileUUID: string]: UserSharedFile;
}
