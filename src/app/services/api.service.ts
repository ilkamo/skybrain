import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { PORTAL } from '../tokens/portal.token';
import { SkynetClient, genKeyPairFromSeed, genKeyPairAndSeed, defaultSkynetPortalUrl } from 'skynet-js';
import { UserData, USER_DATA_KEY } from '../models/user-data';
import { logError } from '../utils';
import { UserMemoriesEncrypted, UserMemory, USER_MEMORIES_KEY_PREFIX } from '../models/user-memory';
import { v4 as uuidv4 } from 'uuid';
import { UserPublicMemory, UsersPublicMemories, USER_PUBLIC_MEMORIES_KEY } from '../models/user-public-memories';
import { UserSharedMemory, UserSharedMemoryLink, USER_SHARED_MEMORIES_KEY } from '../models/user-shared-memories';
import { FollowedUser, USER_FOLLOWED_USERS_KEY } from '../models/user-followed-users';
import * as cryptoJS from 'crypto-js';
import { EncryptionType } from '../models/encryption';
import { ErrorType, ServiceError } from '../models/error';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _userData: UserData = {};
  private _authenticated = false;
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

  public isAuthenticated(): boolean {
    return this._authenticated;
  }

  public get userData(): UserData | null {
    return this._userData;
  }

  public async login(
    nickname: string,
    passphrase: string,
  ): Promise<UserData | ServiceError> {
    if (this.isAuthenticated()) {
      return this._userData; // Check if there is a nickname (rename it to name because it is not unique), otherwise show a new page to fill this info.
    }

    if (!nickname || !passphrase) {
      return new ServiceError("invalid passphrase", ErrorType.LoginError);
    }

    const basePassphrase = `${nickname}_${passphrase}`; // TODO: use only the passphrase to generate keys
    const { publicKey, privateKey } = genKeyPairFromSeed(basePassphrase);

    try {
      const { data } = await this.skynetClient.db.getJSON(
        publicKey,
        this.userDataKey,
        {
          timeout: 10000,
        },
      );

      if (data && 'nickname' in data && data.nickname === nickname) {
        this._userData = data as UserData;
        this._publicKeyFromSeed = publicKey;
        this._privateKeyFromSeed = privateKey;
        this._userMemoriesSkydbKey = this.generateUserMemoriesKey(basePassphrase);
        this._userMemoriesEncryptionKey = this.generateUserMemoriesEncryptionKey(basePassphrase);
        this._authenticated = true;

        // this.logTestData();

        return this._userData;
      } else {
        return new ServiceError("nickname could not be empty", ErrorType.LoginError);
      }
    } catch (error) {
      logError(error);
      return new ServiceError(error, ErrorType.LoginError);
    }
  }

  public async logTestData() {
    const m = await this._getMemories()
    console.log(m);

    if (m.length > 0) {
      // await this.publicMemory(m[0].id);
      // console.log(await this.getPublicMemories());
      // await this.removePublicMemory(m[0].id);
      // console.log(await this.getPublicMemories());

      await this.followUserByPublicKey("f050c12dfacc6de5420a4ce7bcd3ca998ecc067d4fc290376b35463364574295"); // INFO: public key of user test2:test2
      console.log(await this._getFollowedUsers());
      console.log(await this.getPublicMemoriesOfFollowedUsers());
      console.log(await this._getSharedMemories());
      const base64Link = await this.shareMemory(m[0].id)
      if (base64Link) {
        console.log('resolving')
        // console.log(await this.resolveMemoryFromBase64("eyJwdWJsaWNLZXkiOiIyZmZlOGUxYjA5MWVjN2Q3M2I5ZTg5NDczMDYzMmM1ZTEyYzI4OWRjOTQzMjYwMzdlMjNmMzNkNTRmOTVhYWQ4Iiwic2hhcmVkSWQiOiIyYjY2OGFjZC1hYzMwLTRhNzYtYmMxMi01ODgwOWM2NTkxMTAiLCJlbmNyeXB0aW9uS2V5IjoiZWQxMzI4YTljMWE5ZDE1NTVmNzhiYzJjYmZiMjY4NzExM2E3NzIzNjdjNTA0YTU5ZTY4OTM3MGViZGM0NzJhNSJ9"));
        // console.log(await this.resolveMemoryFromBase64(base64Link));
      }
    }

  }

  public async register(
    userData: UserData,
    passphrase: string,
    autoLogin = true,
  ): Promise<UserData | boolean | ServiceError> {
    if (this.isAuthenticated()) {
      return autoLogin ? this._userData : true;
    }

    if (!userData || !userData.nickname || !passphrase) {
      // TODO: Check if passphrase is strong (validation in form so maybe no necessary)
      // Use name instead of nickname!!
      return new ServiceError("invalid user data for registration", ErrorType.RegisterError);
    }

    const basePassphrase = `${userData.nickname}_${passphrase}`;
    const { publicKey, privateKey } = genKeyPairFromSeed(basePassphrase);

    // TODO: Check if user exists

    try {
      await this.skynetClient.db.setJSON(
        privateKey,
        this.userDataKey,
        userData,
        undefined,
        {
          timeout: 10000,
        },
      );
      if (autoLogin) {
        this._userData = userData;
        this._publicKeyFromSeed = publicKey;
        this._privateKeyFromSeed = privateKey;
        this._userMemoriesSkydbKey = this.generateUserMemoriesKey(basePassphrase);
        this._userMemoriesEncryptionKey = this.generateUserMemoriesEncryptionKey(basePassphrase);
        this._authenticated = true;
        return this._userData;
      }
      return true;
    } catch (error) {
      logError(error);
      return new ServiceError(error, ErrorType.RegisterError);
    }
  }

  private generateUserMemoriesKey(basePassphrase: string): string {
    const userMemoriesKeySuffix = cryptoJS.SHA256(`${basePassphrase}_USER_MEMORIES`).toString();
    return `${this._userMemoriesSkydbKeyPrefix}_${userMemoriesKeySuffix}`;
  }

  private generateUserMemoriesEncryptionKey(basePassphrase: string): string {
    const { privateKey } = genKeyPairFromSeed(`${basePassphrase}_USER_MEMORIES_ENCRYPTION`);
    return privateKey;
  }

  public async getMemories(): Promise<UserMemory[] | ServiceError> {
    try {
      return await this._getMemories();
    } catch (error) {
      return error;
    }
  }

  private async _getMemories(): Promise<UserMemory[]> {
    if (this._cachedMemories) {
      return [... this._cachedMemories];
    }

    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this._userMemoriesSkydbKey,
        {
          timeout: 10000,
        }
      );
      if (!response || !response.data) {
        throw new ServiceError(
          "could not fetch memories: invalid client response",
          ErrorType.FetchMemoriesError,
        );
      }

      const storedEncryptedMemories = response.data as UserMemoriesEncrypted;
      const memories = this._decryptUserMemories(storedEncryptedMemories.encryptedMemories);

      this._cachedMemories = [...memories];
      return memories;
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(
        error,
        ErrorType.FetchMemoriesError,
      );
    }
  }

  public async addMemory(
    file: File,
    text?: string,
    tags?: string,
    location?: string,
  ): Promise<void | ServiceError> {
    // TODO: const mimeType = file ? file.type : null;
    try {
      const skylink = await this.skynetClient.uploadFile(file);
      const memories = await this._getMemories();

      const tempMemory: UserMemory = {
        id: uuidv4(),
        added: new Date(Date.now()),
      }

      if (text) {
        tempMemory.text = text;
      }

      if (tags) {
        tempMemory.tags = tags.split(",").map((item: string) => item.trim());
      }

      if (location) {
        tempMemory.location = location;
      }

      if (skylink) {
        tempMemory.skylink = skylink;
      }

      memories.unshift(tempMemory);

      await this._storeMemories(memories);
      this._cachedMemories = memories;
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.AddMemoryError);
    }
  }

  public async deleteMemory(
    skylink: string, // TODO: use only the id!!!
    id?: string,
  ): Promise<void | ServiceError> {
    try {
      let memories = await this._getMemories();
      const foundIndex = memories.findIndex(
        (memory) => {
          if (id) {
            return memory.id && memory.id.search(id) > -1
          } else {
            return memory.skylink && memory.skylink.search(skylink) > -1  // TODO: use only id
          }
        }
      );

      if (foundIndex == -1) return;

      memories = [
        ...memories.slice(0, foundIndex),
        ...memories.slice(foundIndex + 1),
      ];

      await this._storeMemories(memories)
      this._cachedMemories = memories;
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) return error;
      return new ServiceError(error, ErrorType.DeleteMemoryError);
    }
  }

  private async _storeMemories(memories: UserMemory[]): Promise<void> {
    const encryptedMemories = this._encryptUserMemories(memories);
    const encryptedMemoriesToStore: UserMemoriesEncrypted = {
      encryptedMemories: encryptedMemories,
      encryptionType: EncryptionType.KeyPairFromSeed
    }

    try {
      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this._userMemoriesSkydbKey,
        encryptedMemoriesToStore,
        undefined,
        {
          timeout: 10000,
        }
      );
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      throw new ServiceError(error, ErrorType.StoreMemoryError);
    }
  }

  public async getPublicMemories(): Promise<UserPublicMemory[] | ServiceError> {
    try {
      return await this._getPublicMemories();
    } catch (error) {
      return error;
    }
  }

  private async _getPublicMemories(): Promise<UserPublicMemory[]> {
    if (this._cachedPublicMemories) {
      return [... this._cachedPublicMemories];
    }

    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
        {
          timeout: 10000,
        },
      );
      if (!response || !response.data) {
        throw new ServiceError(
          "could not fetch public memories: invalid client response",
          ErrorType.FetchPublicMemoriesError,
        );
      }

      const userPublicMemories = response.data as UserPublicMemory[];

      this._cachedPublicMemories = [...userPublicMemories];
      return userPublicMemories;
    } catch (error) {
      logError(error);
      throw new ServiceError(
        error,
        ErrorType.FetchPublicMemoriesError,
      );
    }
  }

  public async publicMemory(id: string): Promise<void | ServiceError> {
    try {
      const memories = await this._getMemories();
      const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
      if (!found) {
        return new ServiceError("could not find memory to make public", ErrorType.AddPublicMemoryError);
      }

      const publicMemories = await this._getPublicMemories();
      const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
      if (foundIndex > -1) return; // already public

      const tempPublicMemory: UserPublicMemory = {
        publicAt: new Date(Date.now()),
        memory: found,
      }

      publicMemories.unshift(tempPublicMemory);

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
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.AddPublicMemoryError);
    }
  }

  public async removePublicMemory(id: string): Promise<void | ServiceError> {
    try {
      let publicMemories = await this._getPublicMemories();
      const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
      if (foundIndex == -1) return; // already deleted

      if (foundIndex > -1) {
        publicMemories = [
          ...publicMemories.slice(0, foundIndex),
          ...publicMemories.slice(foundIndex + 1),
        ];

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
      }
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.DeletePublicMemoryError);
    }
  }

  public async getFollowedUsers(): Promise<FollowedUser[] | ServiceError> {
    try {
      return await this._getFollowedUsers();
    } catch (error) {
      return error;
    }
  }

  private async _getFollowedUsers(): Promise<FollowedUser[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userFollowedUsersSkydbKey,
        {
          timeout: 10000,
        },
      );
      if (!response || !response.data) {
        throw new ServiceError(
          "could not fetch followed users: invalid client response",
          ErrorType.FetchFollowedUsersError,
        );
      }

      return response.data as FollowedUser[];
    } catch (error) {
      logError(error);
      throw new ServiceError(
        error,
        ErrorType.FetchFollowedUsersError,
      );
    }
  }

  public async followUserByPublicKey(followedUserPublicKey: string): Promise<void | ServiceError> {
    // TODO: check public key length

    try {
      const followedUsers = await this._getFollowedUsers();
      const found = followedUsers.find((u) => u.publicKey.search(followedUserPublicKey) > -1);
      if (found) return; // already followed

      const tempFollowedUser: FollowedUser = {
        startedAt: new Date(Date.now()),
        publicKey: followedUserPublicKey,
      }

      followedUsers.unshift(tempFollowedUser);

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
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.FollowUserError);
    }
  }

  public async unfollowUserByPublicKey(followedUserPublicKey: string): Promise<void | ServiceError> {
    // TODO: check public key length

    try {
      let followedUsers = await this._getFollowedUsers();
      const foundIndex = followedUsers.findIndex((u) => u.publicKey.search(followedUserPublicKey) > -1);
      if (foundIndex == -1) return; // already unfollowed

      if (foundIndex > -1) {
        followedUsers = [
          ...followedUsers.slice(0, foundIndex),
          ...followedUsers.slice(foundIndex + 1),
        ];

        await this.skynetClient.db.setJSON(
          this._privateKeyFromSeed,
          this.userFollowedUsersSkydbKey,
          followedUsers,
          undefined,
          {
            timeout: 10000,
          },
        );
      }
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.UnfollowUserError);
    }
  }

  public async getPublicMemoriesOfFollowedUserByPublicKey(
    followedUserPublicKey: string,
  ): Promise<UserPublicMemory[] | ServiceError> {
    try {
      return await this._getPublicMemoriesOfFollowedUserByPublicKey(followedUserPublicKey);
    } catch (error) {
      return error;
    }
  }

  private async _getPublicMemoriesOfFollowedUserByPublicKey(
    followedUserPublicKey: string,
  ): Promise<UserPublicMemory[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        followedUserPublicKey,
        this.userPublicMemoriesSkydbKey,
        {
          timeout: 10000,
        },
      );
      if (!response || !response.data) {
        throw new ServiceError(
          "could not fetch public memories of user by public key: invalid client response",
          ErrorType.FetchPublicMemoriesOfFollowedUserByPublicKeyError,
        );
      }

      return response.data as UserPublicMemory[];
    } catch (error) {
      logError(error);
      throw new ServiceError(
        error,
        ErrorType.FetchPublicMemoriesOfFollowedUserByPublicKeyError,
      );
    }
  }

  public async getPublicMemoriesOfFollowedUsers(): Promise<UsersPublicMemories | ServiceError> {
    const followedUsersMemories: UsersPublicMemories = {};

    try {
      const followedUsers = await this._getFollowedUsers();
      followedUsers.forEach(async (fu) => {
        const followedUserPublicMemories: UserPublicMemory[] = await this._getPublicMemoriesOfFollowedUserByPublicKey(fu.publicKey);
        followedUsersMemories[fu.publicKey] = followedUserPublicMemories;
      });

      return followedUsersMemories;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.UnfollowUserError);
    }
  }

  public async getSharedMemories(publicKey?: string): Promise<UserSharedMemory[] | ServiceError> {
    try {
      return await this._getSharedMemories(publicKey);
    } catch (error) {
      return error;
    }
  }

  private async _getSharedMemories(publicKey?: string): Promise<UserSharedMemory[]> {
    const pubKey = publicKey ? publicKey : this._publicKeyFromSeed;
    try {
      const response = await this.skynetClient.db.getJSON(
        pubKey,
        this.userSharedMemoriesSkydbKey,
        {
          timeout: 10000,
        },
      );
      if (!response || !response.data) {
        throw new ServiceError(
          "could not fetch shared memories of user: invalid client response",
          ErrorType.FetchSharedMemoriesError,
        );
      }

      return response.data as UserSharedMemory[];
    } catch (error) {
      logError(error);
      throw new ServiceError(
        error,
        ErrorType.FetchSharedMemoriesError,
      );
    }
  }

  public async shareMemory(id: string): Promise<string | ServiceError> {
    if (!this._publicKeyFromSeed) {
      return new ServiceError("could not share memory: no user public key generated", ErrorType.ShareMemoryError);
    }

    try {
      const memories = await this._getMemories();
      const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
      if (!found) return new ServiceError("memory to share not found", ErrorType.ShareMemoryError);

      const sharedMemories = await this._getSharedMemories();
      const { privateKey } = genKeyPairAndSeed();
      const encryptedMemory = cryptoJS.AES.encrypt(JSON.stringify(found), privateKey);

      const tempSharedMemory: UserSharedMemory = {
        memoryId: found.id,
        sharedId: uuidv4(),
        encryptedMemory: encryptedMemory.toString(),
        encryptionType: EncryptionType.KeyPairFromSeed,
        sharedAt: new Date(Date.now()),
      }

      sharedMemories.unshift(tempSharedMemory);

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userSharedMemoriesSkydbKey,
        sharedMemories,
        undefined,
        {
          timeout: 10000,
        },
      );

      const tempSharedMemoryLink: UserSharedMemoryLink = {
        publicKey: this._publicKeyFromSeed,
        sharedId: tempSharedMemory.sharedId,
        encryptionKey: privateKey,
      }
      return btoa(JSON.stringify(tempSharedMemoryLink));
    } catch (error) {
      logError(error);
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.ShareMemoryError);
    }
  }

  public async resolveMemoryFromBase64(base64Data: string): Promise<UserMemory | ServiceError> {
    try {
      const decodedBase64 = atob(base64Data)
      const memoryLink = JSON.parse(decodedBase64) as UserSharedMemoryLink;
      const sharedMemories = await this._getSharedMemories(memoryLink.publicKey);

      const found = sharedMemories.find((m) => m.sharedId && m.sharedId.search(memoryLink.sharedId) > -1);
      if (!found) return new ServiceError("shared memory not found", ErrorType.ResolveSharedMemoryError);

      const decryptedMemory = cryptoJS.AES.decrypt(found.encryptedMemory, memoryLink.encryptionKey).toString(cryptoJS.enc.Utf8);
      const parsedDecryptedMemory = JSON.parse(decryptedMemory);
      return parsedDecryptedMemory;
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      return new ServiceError(error, ErrorType.ResolveSharedMemoryError);
    }
  }

  private _encryptUserMemories(memories: UserMemory[]): string {
    if (!this._userMemoriesEncryptionKey) throw new ServiceError(
      "something really bad happened, no _userMemoriesEncryptionKey", ErrorType.EncryptionError);

    try {
      return cryptoJS.AES.encrypt(JSON.stringify(memories), this._userMemoriesEncryptionKey).toString();
    } catch (error) {
      throw new ServiceError(error, ErrorType.EncryptionError);
    }
  }

  private _decryptUserMemories(encryptedMemories: string): UserMemory[] {
    if (!this._userMemoriesEncryptionKey) throw new ServiceError(
      "something really bad happened, no _userMemoriesEncryptionKey", ErrorType.EncryptionError);

    try {
      const decryptedMemories = cryptoJS.AES.decrypt(
        encryptedMemories,
        this._userMemoriesEncryptionKey,
      ).toString(cryptoJS.enc.Utf8);
      const parsedDecrypted = JSON.parse(decryptedMemories);
      return parsedDecrypted;
    } catch (error) {
      throw new ServiceError(error, ErrorType.EncryptionError);
    }
  }
}
