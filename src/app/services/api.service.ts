import { Inject, Injectable, Optional } from '@angular/core';
import { PORTAL } from '../tokens/portal.token';
import { SkynetClient, genKeyPairFromSeed, genKeyPairAndSeed, defaultSkynetPortalUrl } from 'skynet-js';
import { UserData, UserKeys, USER_DATA_KEY } from '../models/user-data';
import { BaseMemory, UserMemoriesEncrypted, UserMemory, USER_MEMORIES_KEY_PREFIX } from '../models/user-memory';
import { v4 as uuidv4 } from 'uuid';
import { UserPublicMemory, UsersPublicMemories, USER_PUBLIC_MEMORIES_KEY } from '../models/user-public-memories';
import { UserSharedMemory, UserSharedMemoryLink, USER_SHARED_MEMORIES_KEY } from '../models/user-shared-memories';
import { FollowedUser, USER_FOLLOWED_USERS_KEY } from '../models/user-followed-users';
import * as cryptoJS from 'crypto-js';
import { EncryptionType } from '../models/encryption';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private skydbTimeout = 60000;
  private registerUserSkydbTimeout = 7000;
  private skynetClient: SkynetClient;

  constructor(
    @Optional() @Inject(PORTAL) private portal: string,
    @Inject(USER_DATA_KEY) private userDataKey: string,
    @Inject(USER_MEMORIES_KEY_PREFIX) private _userMemoriesSkydbKeyPrefix: string,
    @Inject(USER_PUBLIC_MEMORIES_KEY) private userPublicMemoriesSkydbKey: string,
    @Inject(USER_SHARED_MEMORIES_KEY) private userSharedMemoriesSkydbKey: string,
    @Inject(USER_FOLLOWED_USERS_KEY) private userFollowedUsersSkydbKey: string,
  ) {
    if (!portal) {
      this.portal = defaultSkynetPortalUrl;
    }
    this.skynetClient = new SkynetClient(this.portal);
  }

  private generateUserMemoriesKey(basePassphrase: string): string {
    const userMemoriesKeySuffix = cryptoJS.SHA256(`${basePassphrase}_USER_MEMORIES`).toString();
    return `${this._userMemoriesSkydbKeyPrefix}_${userMemoriesKeySuffix}`;
  }

  private generateUserMemoriesEncryptionKey(basePassphrase: string): string {
    const { privateKey } = genKeyPairFromSeed(`${basePassphrase}_USER_MEMORIES_ENCRYPTION`);
    return privateKey;
  }

  public generateUserKeys(passphrase: string): UserKeys {
    const { publicKey, privateKey } = genKeyPairFromSeed(passphrase);
    const memoriesEncryptionKey = this.generateUserMemoriesEncryptionKey(passphrase);
    const memoriesSkydbKey = this.generateUserMemoriesKey(passphrase);

    return { publicKey, privateKey, memoriesEncryptionKey, memoriesSkydbKey };
  }

  public async authenticateUser({ publicKey }: Partial<UserKeys>): Promise<UserData> {
    if (!publicKey) {
      throw new Error('No publicKey');
    }

    try {
      const { data } = await this.skynetClient.db.getJSON(
        publicKey,
        this.userDataKey,
        {
          timeout: this.skydbTimeout,
        },
      ) || {};
      if (data) {
        return data as UserData;
      }
    } catch (error) { }

    throw new Error('Could not get user data');
  }

  private encryptUserMemories({ memories, memoriesEncryptionKey }: { memories: UserMemory[] } & Partial<UserKeys>): string {
    if (!memoriesEncryptionKey) {
      throw new Error('No memories encryption key');
    }

    return cryptoJS.AES.encrypt(
      JSON.stringify(memories),
      memoriesEncryptionKey
    ).toString();
  }

  public async updateUserData({ user, privateKey, revision }: { user?: UserData, revision?: number }
    & Partial<UserKeys>): Promise<UserData> {
    if (!privateKey) {
      throw new Error('No privateKey');
    }

    user = user || { nickname: '' };

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userDataKey,
        user,
        revision,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      throw new Error('Could not update user data');
    }

    return user;
  }

  public async storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey, revision }:
    { memories: UserMemory[], revision?: number } & Partial<UserKeys>): Promise<void> {
    const encryptedMemories = this.encryptUserMemories({ memories, memoriesEncryptionKey });
    const encryptedMemoriesToStore: UserMemoriesEncrypted = {
      encryptedMemories,
      encryptionType: EncryptionType.KeyPairFromSeed
    };

    if (!memoriesSkydbKey) {
      throw new Error('No memories Skydb key');
    }

    if (!privateKey) {
      throw new Error('No privateKey');
    }

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        memoriesSkydbKey,
        encryptedMemoriesToStore,
        revision,
        {
          timeout: this.skydbTimeout,
        }
      );
    } catch (error) {
      throw new Error('Memories could not be saved');
    }
  }

  private async initUserData({ user, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { user?: UserData } & Partial<UserKeys>): Promise<UserData> {
    if (!privateKey) {
      throw new Error('No privateKey');
    }

    const initialRevision = 0;

    user = user || { nickname: '' };
    await this.storeMemories({ memories: [], privateKey, memoriesSkydbKey, memoriesEncryptionKey,
      revision: initialRevision });

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userPublicMemoriesSkydbKey,
        [] as UserPublicMemory[],
        initialRevision,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        privateKey,
        this.userFollowedUsersSkydbKey,
        [] as FollowedUser[],
        initialRevision,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        privateKey,
        this.userSharedMemoriesSkydbKey,
        [] as UserSharedMemory[],
        initialRevision,
        {
          timeout: this.skydbTimeout,
        },
      );

    } catch (error) {
      throw new Error('The user database could not be initialized');
    }

    // This should be executed as the last one to ensure that all the other schemas are stored.
    await this.updateUserData({ user, privateKey, revision: initialRevision });

    return user;
  }

  public async registerUser({ ...keys }: Partial<UserKeys>): Promise<UserData> {
    if (!keys.publicKey) {
      throw new Error('No publicKey');
    }

    // Check if exists
    let userExists;
    try {
      userExists = await this.skynetClient.db.getJSON(
        keys.publicKey,
        this.userDataKey,
        {
          timeout: this.registerUserSkydbTimeout,
        },
      );
    } catch (error) { }

    if (userExists) {
      return userExists.data as UserData;
    }

    return await this.initUserData({ ...keys });
  }

  private decryptUserMemories({ encryptedMemories, memoriesEncryptionKey }:
    { encryptedMemories: string } & Partial<UserKeys>
  ): UserMemory[] {
    if (!memoriesEncryptionKey) {
      throw new Error('No memories encryption key');
    }

    const decryptedMemories = cryptoJS.AES.decrypt(
      encryptedMemories,
      memoriesEncryptionKey,
    ).toString(cryptoJS.enc.Utf8);
    const parsedDecrypted = JSON.parse(decryptedMemories);
    // tslint:disable-next-line: no-any
    return parsedDecrypted.map((m: any) => ({ ...m, added: new Date(m.added) }));
  }

  public async getMemories({ publicKey, memoriesSkydbKey, memoriesEncryptionKey }: Partial<UserKeys>): Promise<UserMemory[]> {
    if (!publicKey) {
      throw new Error('No publicKey');
    }

    if (!memoriesSkydbKey) {
      throw new Error('No memories Skydb key');
    }

    let response;

    try {
      response = await this.skynetClient.db.getJSON(
        publicKey,
        memoriesSkydbKey,
        {
          timeout: this.skydbTimeout,
        }
      );
    } catch (error) { }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not load memories',
      );
    }

    const storedEncryptedMemories = response.data as UserMemoriesEncrypted;
    const memories = this.decryptUserMemories({ encryptedMemories: storedEncryptedMemories.encryptedMemories, memoriesEncryptionKey });

    return memories;
  }

  public async addMemory({ memory, file, memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { memories: UserMemory[], memory: BaseMemory, file?: File } & Partial<UserKeys>
  ): Promise<UserMemory> {

    const newMemory = {
      id: uuidv4(),
      added: new Date(Date.now()),
      ...memory
    } as UserMemory;

    if (file && file instanceof File) {
      try {
        newMemory.skylink = await this.skynetClient.uploadFile(file);
        newMemory.mimeType = file.type;
      } catch (error) {
        throw new Error('The file could not be sent');
      }
    }

    memories.unshift(newMemory);

    try {
      await this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });
    } catch (error) {
      throw new Error('Could not add new memory');
    }

    return newMemory;
  }

  private async getPublicMemories({ publicKey }: Partial<UserKeys>): Promise<UserPublicMemory[]> {
    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        publicKey,
        this.userPublicMemoriesSkydbKey,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
    }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not fetch public memories'
      );
    }

    const userPublicMemories = response.data as UserPublicMemory[];
    userPublicMemories.forEach(m => m.memory.added = new Date(m.memory.added));

    return userPublicMemories;
  }

  private async deleteFromPublicMemories({ id, publicKey, privateKey }: { id: string } & Partial<UserKeys>): Promise<void> {
    let publicMemories = await this.getPublicMemories({ publicKey });
    const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id === id);
    if (foundIndex === -1) {
      return; // already deleted
    }

    if (foundIndex > -1) {
      publicMemories = [
        ...publicMemories.slice(0, foundIndex),
        ...publicMemories.slice(foundIndex + 1),
      ];

      try {
        await this.skynetClient.db.setJSON(
          privateKey,
          this.userPublicMemoriesSkydbKey,
          publicMemories,
          undefined,
          {
            timeout: this.skydbTimeout,
          },
        );
      } catch (error) {
        throw new Error('Could not remove memories from public domain');
      }
    }
  }

  private async deleteFromSharedMemories({ id, publicKey, privateKey }: { id: string } & Partial<UserKeys>): Promise<void> {
    const sharedMemories = await this.getSharedMemories({ publicKey });
    const filteredSharedMemories = sharedMemories.filter((m) => m.memoryId.search(id) === -1);

    if (filteredSharedMemories.length === sharedMemories.length) {
      return; // no elements to unshare
    }

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userSharedMemoriesSkydbKey,
        filteredSharedMemories,
        undefined,
        {
          timeout: 10000,
        },
      );
    } catch (error) {
      throw new Error('Could not delete from shared memories');
    }
  }

  public async deleteMemory({ id, memories, publicKey, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { id: string, memories: UserMemory[] } & Partial<UserKeys>): Promise<void> {
    const foundIndex = memories.findIndex(memory => memory.id === id);
    if (foundIndex === -1) {
      throw new Error('Could not find memory to delete');
    }

    memories = [
      ...memories.slice(0, foundIndex),
      ...memories.slice(foundIndex + 1),
    ];

    try {
      await this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });
    } catch (error) {
      throw new Error('Could not delete memory');
    }

    await this.deleteFromPublicMemories({ id, publicKey, privateKey });
    await this.deleteFromSharedMemories({ id, publicKey, privateKey });
  }

  public async publicMemory({ id, memories, privateKey, publicKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { id: string, memories: UserMemory[] } & Partial<UserKeys>): Promise<void> {
    const found = memories.find((memory) => memory.id && memory.id === id);
    if (!found) {
      throw new Error('Could not find memory to make them public');
    }

    const publicMemories = await this.getPublicMemories({ publicKey });
    const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id === id);
    if (foundIndex > -1) {
      return;
    }

    const tempPublicMemory: UserPublicMemory = {
      publicAt: new Date(Date.now()),
      memory: found,
    };

    publicMemories.unshift(tempPublicMemory);

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userPublicMemoriesSkydbKey,
        publicMemories,
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

    } catch (error) {
      throw new Error('Could not public memories');
    }

    found.isPublic = true;
    this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });
  }

  public async unpublicMemory({ id, memories, publicKey, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { id: string, memories: UserMemory[] } & Partial<UserKeys>): Promise<void> {
    await this.deleteFromPublicMemories({ id, publicKey, privateKey });

    const found = memories.find((memory) => memory.id && memory.id === id);
    if (found) {
      delete found.isPublic;
      this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });
    }
  }

  public async getFollowedUsers({ publicKey }: Partial<UserKeys>): Promise<FollowedUser[]> {
    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        publicKey,
        this.userFollowedUsersSkydbKey,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
    }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not fetch followed users',
      );
    }

    // tslint:disable-next-line: no-any
    return response.data.map((u: any) => ({ ...u, startedAt: new Date(u.startedAt)})) as FollowedUser[];
  }

  public async followUserByPublicKey({ followedUserPublicKey, privateKey, followedUsers }:
    { followedUserPublicKey: string, followedUsers: FollowedUser[] } & Partial<UserKeys>): Promise<FollowedUser> {
    // TODO: check public key length
    const found = followedUsers.find((u) => u.publicKey === followedUserPublicKey);

    if (found) {
      return found; // already followed
    }
    const tempFollowedUser: FollowedUser = {
      startedAt: new Date(Date.now()),
      publicKey: followedUserPublicKey,
    };
    followedUsers.unshift(tempFollowedUser);
    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userFollowedUsersSkydbKey,
        followedUsers,
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      throw new Error('Could not follow');
    }

    return tempFollowedUser;
  }

  public async unfollowUserByPublicKey({ followedUserPublicKey, privateKey, followedUsers }:
    { followedUserPublicKey: string, followedUsers: FollowedUser[] } & Partial<UserKeys>): Promise<void> {
    // TODO: check public key length

    const foundIndex = followedUsers.findIndex((u) => u.publicKey === followedUserPublicKey);
    if (foundIndex === -1) {
      return; // already unfollowed
    }

    if (foundIndex > -1) {
      followedUsers = [
        ...followedUsers.slice(0, foundIndex),
        ...followedUsers.slice(foundIndex + 1),
      ];
      try {
        await this.skynetClient.db.setJSON(
          privateKey,
          this.userFollowedUsersSkydbKey,
          followedUsers,
          undefined,
          {
            timeout: this.skydbTimeout,
          },
        );
      } catch (error) {
        throw new Error('Could not unfollow');
      }
    }
  }

  public async getPublicMemoriesOfFollowedUsers({ followedUsers }: { followedUsers: FollowedUser[] }): Promise<UsersPublicMemories> {
    const followedUsersMemories: UsersPublicMemories = {};
    for (const fu of followedUsers) {
      const followedUserPublicMemories: UserPublicMemory[] = await this.getPublicMemories({ publicKey: fu.publicKey });
      followedUsersMemories[fu.publicKey] = followedUserPublicMemories;
    }
    return followedUsersMemories;
  }

  private async getSharedMemories({ publicKey }: Partial<UserKeys>): Promise<UserSharedMemory[]> {
    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        publicKey,
        this.userSharedMemoriesSkydbKey,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      response = null;
    }

    if (!response || !('data' in response)) {
      throw new Error('Could not fetch shared memories');
    }

    return response.data as UserSharedMemory[];
  }

  public async shareMemory({ id, memories, publicKey, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { id: string, memories: UserMemory[] } & Partial<UserKeys>): Promise<string> {
    const found = memories.find((memory) => memory.id && memory.id === id);
    if (!found) {
      throw new Error('Memory to share not found');
    }

    if (found.isShared && found.shareLink) {
      return found.shareLink;
    }

    const sharedMemories = await this.getSharedMemories({ publicKey });
    const uniqueEncryptionKey = genKeyPairAndSeed().privateKey;
    const encryptedMemory = cryptoJS.AES.encrypt(JSON.stringify(found), uniqueEncryptionKey);

    const tempSharedMemory: UserSharedMemory = {
      memoryId: found.id,
      sharedId: uuidv4(),
      encryptedMemory: encryptedMemory.toString(),
      encryptionType: EncryptionType.KeyPairFromSeed,
      sharedAt: new Date(Date.now()),
    };

    sharedMemories.unshift(tempSharedMemory);

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userSharedMemoriesSkydbKey,
        sharedMemories,
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      throw new Error('Could not share memory');
    }

    found.isShared = true;
    const tempSharedMemoryLink: UserSharedMemoryLink = {
      publicKey: publicKey as string,
      sharedId: tempSharedMemory.sharedId,
      encryptionKey: uniqueEncryptionKey,
    };
    found.shareLink = btoa(JSON.stringify(tempSharedMemoryLink));

    await this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });

    return found.shareLink;
  }

  public async unshareMemory({ id, memories, publicKey, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { id: string, memories: UserMemory[] } & Partial<UserKeys>): Promise<void> {
    await this.deleteFromSharedMemories({ id, publicKey, privateKey });

    const found = memories.find((memory) => memory.id && memory.id === id);
    if (found) {
      delete found.isShared;
      delete found.shareLink;
      await this.storeMemories({ memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey });
    }
  }


  public async resolveMemoryFromBase64(base64Data: string): Promise<UserMemory> {
    try {
      const decodedBase64 = atob(base64Data);
      const memoryLink = JSON.parse(decodedBase64) as UserSharedMemoryLink;
      const sharedMemories = await this.getSharedMemories({ publicKey: memoryLink.publicKey });
      const found = sharedMemories.find((m) => m.sharedId && m.sharedId.search(memoryLink.sharedId) > -1);
      if (!found) {
        throw new Error('Shared memory not found');
      }
      const decryptedMemory = cryptoJS.AES.decrypt(found.encryptedMemory, memoryLink.encryptionKey).toString(cryptoJS.enc.Utf8);
      const parsedDecryptedMemory = JSON.parse(decryptedMemory);
      return parsedDecryptedMemory;
    } catch (error) {
      throw new Error('Memories could not be resolved');
    }
  }

  /* public async logTestData(): Promise<void> {
    const m = await this.getMemories();
    console.log(m);

    if (m.length > 0) {
      // await this.publicMemory(m[0].id);
      // console.log(await this.getPublicMemories());
      // await this.removePublicMemory(m[0].id);
      // console.log(await this.getPublicMemories());

      await this.followUserByPublicKey(
        'f050c12dfacc6de5420a4ce7bcd3ca998ecc067d4fc290376b35463364574295'
      ); // INFO: public key of user test2:test2
      console.log(await this.getFollowedUsers());
      console.log(await this.getPublicMemoriesOfFollowedUsers());
      console.log(await this.getSharedMemories());
      const base64Link = await this.shareMemory(m[0].id)
      if (base64Link) {
        console.log('resolving');
        // tslint:disable-next-line: max-line-length
        // console.log(await this.resolveMemoryFromBase64("eyJwdWJsaWNLZXkiOiIyZmZlOGUxYjA5MWVjN2Q3M2I5ZTg5NDczMDYzMmM1ZTEyYzI4OWRjOTQzMjYwMzdlMjNmMzNkNTRmOTVhYWQ4Iiwic2hhcmVkSWQiOiIyYjY2OGFjZC1hYzMwLTRhNzYtYmMxMi01ODgwOWM2NTkxMTAiLCJlbmNyeXB0aW9uS2V5IjoiZWQxMzI4YTljMWE5ZDE1NTVmNzhiYzJjYmZiMjY4NzExM2E3NzIzNjdjNTA0YTU5ZTY4OTM3MGViZGM0NzJhNSJ9"));
        // console.log(await this.resolveMemoryFromBase64(base64Link));
      }
    }

  } */
}
