import { Inject, Injectable, NgZone, Optional } from '@angular/core';
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
  private skydbTimeout = 5000;
  private _publicKeyFromSeed: string | null = null;
  private _privateKeyFromSeed: string | null = null;
  private _userMemoriesSkydbKey: string | null = null;
  private _userMemoriesEncryptionKey: string | null = null;
  private skynetClient: SkynetClient;

  private _cachedMemories: UserMemory[] | null = null;
  private _cachedPublicMemories: UserPublicMemory[] | null = null;
  // TODO: implement cache in order to avoid additional calls to Skydb
  private _cachedFollowedUsers: FollowedUser[] | null = null;

  constructor(
    private zone: NgZone,
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

  // [ Redux approach ] //////////////////////////////////////////////

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

  public async authenticateUser( { publicKey }: Partial<UserKeys> ): Promise<UserData> {
    if (!publicKey) {
      throw new Error('No publicKey');
    }

    // TODO: Repeatable try ... getJSON
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
    } catch (error) {}

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

  public async updateUserData( { user, privateKey }: { user?: UserData } & Partial<UserKeys>): Promise<UserData> {
    if (!privateKey) {
      throw new Error('No privateKey');
    }

    user = user || { nickname: '' };

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userDataKey,
        user,
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      throw new Error('Could not update user data');
    }

    return user;
  }

  public async storeMemories(
    { memories, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { memories: UserMemory[] } & Partial<UserKeys>): Promise<void> {
    const encryptedMemories = this.encryptUserMemories( { memories, memoriesEncryptionKey });
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
        undefined,
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      throw new Error('Memories could not be saved');
    }
  }

  private async initUserData(
    { user, privateKey, memoriesSkydbKey, memoriesEncryptionKey }:
    { user?: UserData } & Partial<UserKeys>): Promise<UserData> {
    if (!privateKey) {
      throw new Error('No privateKey');
    }

    user = user || { nickname: '' };
    await this.updateUserData( { user, privateKey } );
    await this.storeMemories( { memories: [], privateKey, memoriesSkydbKey, memoriesEncryptionKey} );

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userPublicMemoriesSkydbKey,
        [] as UserPublicMemory[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        privateKey,
        this.userFollowedUsersSkydbKey,
        [] as FollowedUser[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        privateKey,
        this.userSharedMemoriesSkydbKey,
        [] as UserSharedMemory[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

    } catch (error) {
      throw new Error('The user database could not be initialized');
    }

    return user;
  }

  public async registerUser(
    { ...keys }: Partial<UserKeys>
  ): Promise<UserData> {
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
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) { }

    if (userExists) {
      return userExists.data as UserData;
    }

    return await this.initUserData( { ...keys });
  }

  private decryptUserMemories(
    { encryptedMemories, memoriesEncryptionKey }: { encryptedMemories: string } & Partial<UserKeys>
  ): UserMemory[] {
    if (!memoriesEncryptionKey) {
      throw new Error('No memories encryption key');
    }

    const decryptedMemories = cryptoJS.AES.decrypt(
      encryptedMemories,
      memoriesEncryptionKey,
    ).toString(cryptoJS.enc.Utf8);
    const parsedDecrypted = JSON.parse(decryptedMemories);
    return parsedDecrypted;
  }

  public async loadMemories({ publicKey, memoriesSkydbKey, memoriesEncryptionKey}: Partial<UserKeys>): Promise<UserMemory[]> {

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
    } catch (error) {}

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not load memories',
      );
    }

    const storedEncryptedMemories = response.data as UserMemoriesEncrypted;
    const memories = this.decryptUserMemories( { encryptedMemories: storedEncryptedMemories.encryptedMemories, memoriesEncryptionKey } );

    return memories;
  }

  public async newMemory({ memory, file }: { memory: BaseMemory, file?: File }
  ): Promise<UserMemory> {

    const newMemory = { ...memory } as UserMemory;

    if (file && file instanceof File) {
      try {
        newMemory.skylink = await this.skynetClient.uploadFile(file);
        newMemory.mimeType = file.type;
      } catch (error) {
        throw new Error('The file could not be sent');
      }
    }

    return newMemory;
  }

  ////////////////////////////////////////////////


  public async getMemories(): Promise<UserMemory[]> {
    if (this._cachedMemories) {
      return [... this._cachedMemories];
    }

    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this._userMemoriesSkydbKey,
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      response = null;
    }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not fetch memories',
      );
    }

    // BC
    const keys = { memoriesEncryptionKey: this._userMemoriesEncryptionKey } as Partial<UserKeys>;

    const storedEncryptedMemories = response.data as UserMemoriesEncrypted;
    const memories = this.decryptUserMemories( {
      encryptedMemories: storedEncryptedMemories.encryptedMemories,
      ...keys
    } );

    this._cachedMemories = [...memories];
    return memories;
  }

  public async deleteMemory(
    skylink: string, // TODO: use only the id!!!
    id?: string,
  ): Promise<void> {
    let memories = await this.getMemories();
    const foundIndex = memories.findIndex(
      (memory) => {
        if (id) {
          return memory.id && memory.id.search(id) > -1;
        } else {
          return memory.skylink && memory.skylink.search(skylink) > -1;  // TODO: use only id
        }
      }
    );

    if (foundIndex === -1) {
      return;
    }

    memories = [
      ...memories.slice(0, foundIndex),
      ...memories.slice(foundIndex + 1),
    ];

    await this.storeMemories( { memories } );
    this._cachedMemories = memories;
  }

  private async getPublicMemories(): Promise<UserPublicMemory[]> {
    if (this._cachedPublicMemories) {
      return [... this._cachedPublicMemories];
    }

    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
        {
          timeout: 10000,
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

    this._cachedPublicMemories = [...userPublicMemories];
    return userPublicMemories;
  }

  public async publicMemory(id: string): Promise<void> {
    const memories = await this.getMemories();
    const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
    if (!found) {
      throw new Error('Could not find memory to make them public');
    }

    const publicMemories = await this.getPublicMemories();
    const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
    if (foundIndex > -1) {
      return; // already public
    }

    const tempPublicMemory: UserPublicMemory = {
      publicAt: new Date(Date.now()),
      memory: found,
    };

    publicMemories.unshift(tempPublicMemory);

    try {
      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
        publicMemories,
        undefined,
        {
          timeout: 10000,
        },
      );

      this._cachedPublicMemories = [...publicMemories];
    } catch (error) {
      throw new Error('Could not public memories');
    }
  }

  public async removePublicMemory(id: string): Promise<void> {
    let publicMemories = await this.getPublicMemories();
    const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
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
          this._privateKeyFromSeed,
          this.userPublicMemoriesSkydbKey,
          publicMemories,
          undefined,
          {
            timeout: 10000,
          },
        );
      } catch (error) {
        throw new Error('Could not remove memories from public domain');
      }

      this._cachedPublicMemories = [...publicMemories];
    }
  }

  private async getFollowedUsers(): Promise<FollowedUser[]> {
    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userFollowedUsersSkydbKey,
        {
          timeout: 10000,
        },
      );
    } catch (error) {
    }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not fetch followed users',
      );
    }

    return response.data as FollowedUser[];
  }

  public async followUserByPublicKey(followedUserPublicKey: string): Promise<void> {
    // TODO: check public key length
    const followedUsers = await this.getFollowedUsers();
    const found = followedUsers.find((u) => u.publicKey.search(followedUserPublicKey) > -1);
    if (found) {
      return; // already followed
    }
    const tempFollowedUser: FollowedUser = {
      startedAt: new Date(Date.now()),
      publicKey: followedUserPublicKey,
    };
    followedUsers.unshift(tempFollowedUser);

    try {
      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userFollowedUsersSkydbKey,
        followedUsers,
        undefined,
        {
          timeout: 10000,
        },
      );
    } catch (error) {
      throw new Error('Could not follow');
    }
  }

  public async unfollowUserByPublicKey(followedUserPublicKey: string): Promise<void> {
    // TODO: check public key length

    let followedUsers = await this.getFollowedUsers();
    const foundIndex = followedUsers.findIndex((u) => u.publicKey.search(followedUserPublicKey) > -1);
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
          this._privateKeyFromSeed,
          this.userFollowedUsersSkydbKey,
          followedUsers,
          undefined,
          {
            timeout: 10000,
          },
        );
      } catch (error) {
        throw new Error('Could not unfollow');
      }
    }
  }

  private async getPublicMemoriesOfFollowedUserByPublicKey(
    followedUserPublicKey: string,
  ): Promise<UserPublicMemory[]> {
    let response;
    try {
       response = await this.skynetClient.db.getJSON(
        followedUserPublicKey,
        this.userPublicMemoriesSkydbKey,
        {
          timeout: 10000,
        },
      );
    } catch (error) { }

    if (!response || !('data' in response)) {
      throw new Error(
        'Could not fetch public memories of user',
      );
    }
    return response.data as UserPublicMemory[];
  }

  public async getPublicMemoriesOfFollowedUsers(): Promise<UsersPublicMemories> {
    const followedUsersMemories: UsersPublicMemories = {};
    const followedUsers = await this.getFollowedUsers();
    followedUsers.forEach(async (fu) => {
      const followedUserPublicMemories: UserPublicMemory[] = await this.getPublicMemoriesOfFollowedUserByPublicKey(fu.publicKey);
      followedUsersMemories[fu.publicKey] = followedUserPublicMemories;
    });
    return followedUsersMemories;
  }

  public async getSharedMemories(publicKey?: string): Promise<UserSharedMemory[]> {
    const pubKey = publicKey ? publicKey : this._publicKeyFromSeed;
    let response;
    try {
      response = await this.skynetClient.db.getJSON(
        pubKey,
        this.userSharedMemoriesSkydbKey,
        {
          timeout: 10000,
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

  public async shareMemory(id: string): Promise<string> {
    if (!this._publicKeyFromSeed) {
      throw new Error('No user public key');
    }

    const memories = await this.getMemories();
    const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
    if (!found) {
      throw new Error('Memory to share not found');
    }

    const sharedMemories = await this.getSharedMemories();
    const { privateKey } = genKeyPairAndSeed();
    const encryptedMemory = cryptoJS.AES.encrypt(JSON.stringify(found), privateKey);

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
        this._privateKeyFromSeed,
        this.userSharedMemoriesSkydbKey,
        sharedMemories,
        undefined,
        {
          timeout: 10000,
        },
      );
    } catch (error) {
      throw new Error('Could not share memory');
    }

    const tempSharedMemoryLink: UserSharedMemoryLink = {
      publicKey: this._publicKeyFromSeed,
      sharedId: tempSharedMemory.sharedId,
      encryptionKey: privateKey,
    };

    return btoa(JSON.stringify(tempSharedMemoryLink));
  }

  public async resolveMemoryFromBase64(base64Data: string): Promise<UserMemory> {
    try {
      const decodedBase64 = atob(base64Data);
      const memoryLink = JSON.parse(decodedBase64) as UserSharedMemoryLink;
      const sharedMemories = await this.getSharedMemories(memoryLink.publicKey);
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

  private initUserKeys(passphrase: string): void {
    const { publicKey, privateKey } = genKeyPairFromSeed(passphrase);
    this._publicKeyFromSeed = publicKey;
    this._privateKeyFromSeed = privateKey;
    this._userMemoriesSkydbKey = this.generateUserMemoriesKey(passphrase);
    this._userMemoriesEncryptionKey = this.generateUserMemoriesEncryptionKey(passphrase);
  }

  private async initUserSkyDB(userData: UserData): Promise<void> {
    if (!this._privateKeyFromSeed) {
      throw new Error('No privateKey');
    }

    try {
      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userDataKey,
        userData,
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.storeMemories({ memories: [] });

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
        [] as UserPublicMemory[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userFollowedUsersSkydbKey,
        [] as FollowedUser[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userSharedMemoriesSkydbKey,
        [] as UserSharedMemory[],
        undefined,
        {
          timeout: this.skydbTimeout,
        },
      );
    } catch (error) {
      throw new Error('The user database could not be initialized');
    }
  }

  public async logTestData(): Promise<void> {
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

  }
}
