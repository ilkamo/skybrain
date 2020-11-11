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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _userData: UserData | null = null;
  private _authenticated = false;
  private _publicKeyFromSeed: string | null = null;
  private _privateKeyFromSeed: string | null = null;
  private _userMemoriesSkydbKey: string | null = null;
  private _userMemoriesEncryptionKey: string | null = null;
  private skynetClient: SkynetClient;

  // TODO: implement cache in order to avoid additional calls to Skydb
  private _cachedMemories: UserMemory[] = [];
  private _cachedPublicMemories: UserPublicMemory[] = [];
  private _cachedFollowedUsers: FollowedUser[] = [];

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

  public async login(nickname: string, passphrase: string): Promise<UserData | null> {
    if (this.isAuthenticated()) {
      return this._userData;
    }

    if (!nickname || !passphrase) {
      return null;
    }

    const basePassphrase = `${nickname}_${passphrase}`;
    const { publicKey, privateKey } = genKeyPairFromSeed(basePassphrase);

    try {
      const { data } = await this.skynetClient.db.getJSON(publicKey, this.userDataKey);

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
        return null;
      }
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async logTestData() {
    const m = await this.getMemories()
    console.log(m);

    if (m.length > 0) {
      await this.publicMemory(m[0].id);
      // console.log(await this.getPublicMemories());
      // await this.removePublicMemory(m[0].id);
      // console.log(await this.getPublicMemories());

      // await this.followUserByPublicKey("f050c12dfacc6de5420a4ce7bcd3ca998ecc067d4fc290376b35463364574295"); // INFO: public key of user test2:test2
      // console.log(await this.getFollowedUsers());
      // console.log(await this.getPublicMemoriesOfFollowedUsers());
      // console.log(await this.getSharedMemories());
      const base64Link = await this.shareMemory(m[0].id)
      if (base64Link) {
        console.log('resolving')
        // console.log(await this.resolveMemoryFromBase64("eyJwdWJsaWNLZXkiOiIyZmZlOGUxYjA5MWVjN2Q3M2I5ZTg5NDczMDYzMmM1ZTEyYzI4OWRjOTQzMjYwMzdlMjNmMzNkNTRmOTVhYWQ4Iiwic2hhcmVkSWQiOiIyYjY2OGFjZC1hYzMwLTRhNzYtYmMxMi01ODgwOWM2NTkxMTAiLCJlbmNyeXB0aW9uS2V5IjoiZWQxMzI4YTljMWE5ZDE1NTVmNzhiYzJjYmZiMjY4NzExM2E3NzIzNjdjNTA0YTU5ZTY4OTM3MGViZGM0NzJhNSJ9"));
        console.log(await this.resolveMemoryFromBase64(base64Link));
      }
    }

  }

  public async register(userData: UserData, passphrase: string, autoLogin = true): Promise<UserData | boolean | null> {
    if (this.isAuthenticated()) {
      return autoLogin ? this._userData : true;
    }

    if (!userData || !userData.nickname || !passphrase) {
      // TODO: Check if passphrase is strong (validation in form so maybe no necessary)
      return null;
    }

    const basePassphrase = `${userData.nickname}_${passphrase}`;
    const { publicKey, privateKey } = genKeyPairFromSeed(basePassphrase);

    // TODO: Check if user exists

    try {
      const response = await this.skynetClient.db.setJSON(privateKey, this.userDataKey, userData);
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
      return null;
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

  public async getMemories(): Promise<UserMemory[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this._userMemoriesSkydbKey
      );
      if (!response || !response.data) {
        return [];
      }

      const storedEncryptedMemories = response.data as UserMemoriesEncrypted;
      const memories = this._decryptUserMemories(storedEncryptedMemories.encryptedMemories);
      if (!memories) {
        console.log("something really bad happened, impossible to decrypt memories");
        return [];
      }

      return memories;
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async addMemory(file: File, text?: string, tags?: string, location?: string): Promise<string | null> {
    // TODO: const mimeType = file ? file.type : null;
    try {
      const skylink = await this.skynetClient.uploadFile(file);
      const memories = await this.getMemories();

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

      // TODO: return an error if something goes wrong
      await this._setMemories(memories);

      return skylink;
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async deleteMemory(skylink: string, id?: string): Promise<void> {
    try {
      let memories = await this.getMemories();
      const foundIndex = memories.findIndex(
        (memory) => {
          if (id) {
            return memory.id && memory.id.search(id) > -1
          } else {
            return memory.skylink && memory.skylink.search(skylink) > -1  // TODO: use only id
          }
        }
      );
      if (foundIndex > -1) {
        memories = [
          ...memories.slice(0, foundIndex),
          ...memories.slice(foundIndex + 1),
        ];

        // TODO: return an error if something goes wrong
        await this._setMemories(memories);
      }
    } catch (error) {
      logError(error);
    }
  }

  private async _setMemories(memories: UserMemory[]): Promise<void> {
    const encryptedMemories = this._encryptUserMemories(memories);
    if (!encryptedMemories){
      console.log("could not encrypt memories");
      return
    }

    const encryptedMemoriesToStore: UserMemoriesEncrypted = {
      encryptedMemories: encryptedMemories,
      encryptionType: EncryptionType.KeyPairFromSeed
    }

    await this.skynetClient.db.setJSON(
      this._privateKeyFromSeed,
      this._userMemoriesSkydbKey,
      encryptedMemoriesToStore,
    );
  }

  public async getPublicMemories(): Promise<UserPublicMemory[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
      );
      if (!response || !response.data) {
        return [];
      }

      return response.data as UserPublicMemory[];
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async publicMemory(id: string): Promise<void> {
    try {
      const memories = await this.getMemories();
      const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
      if (!found) {
        console.log("memory not found")
        return
      }

      const publicMemories = await this.getPublicMemories();
      const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
      if (foundIndex > -1) {
        return
      }

      const tempPublicMemory: UserPublicMemory = {
        publicAt: new Date(Date.now()),
        memory: found,
      }

      publicMemories.unshift(tempPublicMemory);

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userPublicMemoriesSkydbKey,
        publicMemories,
      );

      return;
    } catch (error) {
      logError(error);
      return;
    }
  }

  public async removePublicMemory(id: string): Promise<void> {
    try {
      let publicMemories = await this.getPublicMemories();
      const foundIndex = publicMemories.findIndex((pm) => pm.memory.id && pm.memory.id.search(id) > -1);
      if (foundIndex == -1) {
        return
      }

      if (foundIndex > -1) {
        publicMemories = [
          ...publicMemories.slice(0, foundIndex),
          ...publicMemories.slice(foundIndex + 1),
        ];

        await this.skynetClient.db.setJSON(
          this._privateKeyFromSeed,
          this.userPublicMemoriesSkydbKey,
          publicMemories
        );
      }

      return;
    } catch (error) {
      logError(error);
      return;
    }
  }

  public async getFollowedUsers(): Promise<FollowedUser[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKeyFromSeed,
        this.userFollowedUsersSkydbKey,
      );
      if (!response || !response.data) {
        return [];
      }

      return response.data as FollowedUser[];
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async followUserByPublicKey(followedUserPublicKey: string): Promise<void> {
    // TODO: check public key length

    try {
      const followedUsers = await this.getFollowedUsers();
      const found = followedUsers.find((u) => u.publicKey.search(followedUserPublicKey) > -1);
      if (found) {
        return;
      }

      const tempFollowedUser: FollowedUser = {
        startedAt: new Date(Date.now()),
        publicKey: followedUserPublicKey,
      }

      followedUsers.unshift(tempFollowedUser);

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userFollowedUsersSkydbKey,
        followedUsers,
      );

      return;
    } catch (error) {
      logError(error);
      return;
    }
  }

  public async unfollowUserByPublicKey(followedUserPublicKey: string): Promise<void> {
    // TODO: check public key length

    try {
      let followedUsers = await this.getFollowedUsers();
      const foundIndex = followedUsers.findIndex((u) => u.publicKey.search(followedUserPublicKey) > -1);
      if (foundIndex == -1) {
        return;
      }

      if (foundIndex > -1) {
        followedUsers = [
          ...followedUsers.slice(0, foundIndex),
          ...followedUsers.slice(foundIndex + 1),
        ];

        await this.skynetClient.db.setJSON(
          this._privateKeyFromSeed,
          this.userFollowedUsersSkydbKey,
          followedUsers
        );
      }

      return;
    } catch (error) {
      logError(error);
      return;
    }
  }

  public async getPublicMemoriesByFollowedUserPublicKey(followedUserPublicKey: string): Promise<UserPublicMemory[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        followedUserPublicKey,
        this.userPublicMemoriesSkydbKey,
      );
      if (!response || !response.data) {
        return [];
      }

      return response.data as UserPublicMemory[];
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async getPublicMemoriesOfFollowedUsers(): Promise<UsersPublicMemories> {
    const followedUsersMemories: UsersPublicMemories = {};

    const followedUsers = await this.getFollowedUsers();
    followedUsers.forEach(async (fu) => {
      const followedUserPublicMemories: UserPublicMemory[] = await this.getPublicMemoriesByFollowedUserPublicKey(fu.publicKey);
      followedUsersMemories[fu.publicKey] = followedUserPublicMemories;
    });

    return followedUsersMemories;
  }

  public async getSharedMemories(publicKey?: string): Promise<UserSharedMemory[]> {
    const pubKey = publicKey ? publicKey : this._publicKeyFromSeed;
    try {
      const response = await this.skynetClient.db.getJSON(
        pubKey,
        this.userSharedMemoriesSkydbKey,
      );
      if (!response || !response.data) {
        return [];
      }

      return response.data as UserSharedMemory[];
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async shareMemory(id: string): Promise<string | null> {
    if (!this._publicKeyFromSeed) {
      return null;
    }

    try {
      const memories = await this.getMemories();
      const found = memories.find((memory) => memory.id && memory.id.search(id) > -1);
      if (!found) {
        console.log("memory not found")
        return null;
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
      }

      sharedMemories.unshift(tempSharedMemory);

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this.userSharedMemoriesSkydbKey,
        sharedMemories,
      );

      const tempSharedMemoryLink: UserSharedMemoryLink = {
        publicKey: this._publicKeyFromSeed,
        sharedId: tempSharedMemory.sharedId,
        encryptionKey: privateKey,
      }
      return btoa(JSON.stringify(tempSharedMemoryLink));
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async resolveMemoryFromBase64(base64Data: string): Promise<UserMemory> {
    const decodedBase64 = atob(base64Data)
    const memoryLink = JSON.parse(decodedBase64) as UserSharedMemoryLink;
    const sharedMemories = await this.getSharedMemories(memoryLink.publicKey);

    const found = sharedMemories.find((memory) => memory.sharedId && memory.sharedId.search(memoryLink.sharedId) > -1);
    if (!found) {
      console.log("shared memory not found")
      return {} as UserMemory;
    }

    const decryptedMemory = cryptoJS.AES.decrypt(found.encryptedMemory, memoryLink.encryptionKey).toString(cryptoJS.enc.Utf8);
    const parsedDecryptedMemory = JSON.parse(decryptedMemory);
    return parsedDecryptedMemory;
  }

  public _encryptUserMemories(memories: UserMemory[]): string | null {
    if (!this._userMemoriesEncryptionKey) {
      console.log("something really bad happened, no _userMemoriesEncryptionKey")
      return null;
    }

    return cryptoJS.AES.encrypt(JSON.stringify(memories), this._userMemoriesEncryptionKey).toString();
  }

  public _decryptUserMemories(encryptedMemories: string): UserMemory[] | null {
    if (!this._userMemoriesEncryptionKey) {
      return null;
    }
    
    const decryptedMemories = cryptoJS.AES.decrypt(encryptedMemories, this._userMemoriesEncryptionKey).toString(cryptoJS.enc.Utf8);
    const parsedDecrypted = JSON.parse(decryptedMemories);
    return parsedDecrypted;
  }
}
