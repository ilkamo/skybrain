import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { PORTAL } from '../tokens/portal.token';
import { SkynetClient, keyPairFromSeed, PublicKey, SecretKey, defaultSkynetPortalUrl } from 'skynet-js';
import { UserData, USER_DATA_KEY } from '../models/user-data';
import { logError } from '../utils';
import { UserMemory, USER_MEMORIES_KEY_PREFIX } from '../models/user-memory';
import { v4 as uuidv4 } from 'uuid';
import { UserPublicMemory, UsersPublicMemories, USER_PUBLIC_MEMORIES_KEY } from '../models/user-public-memories';
import { USER_SHARED_MEMORIES_KEY } from '../models/user-shared-memories';
import { FollowedUser, USER_FOLLOWED_USERS_KEY } from '../models/user-followed-users';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _userData: UserData | null = null;
  private _authenticated = false;
  private _publicKeyFromSeed: PublicKey | null = null;
  private _privateKeyFromSeed: SecretKey | null = null;
  private _userMemoriesSkydbKey: string | null = null;
  private _userMemoriesEncryptionKey: string | null = null;
  private skynetClient: SkynetClient;

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
    const { publicKey, privateKey } = keyPairFromSeed(basePassphrase);

    try {
      const { data } = await this.skynetClient.db.getJSON(publicKey, this.userDataKey);
      console.log(data);
      if (data && 'nickname' in data && data.nickname === nickname) {
        this._userData = data as UserData;
        this._publicKeyFromSeed = publicKey;
        this._privateKeyFromSeed = privateKey;
        this._userMemoriesSkydbKey = await this.generateUserMemoriesKey(basePassphrase);
        this._userMemoriesEncryptionKey = await this.generateUserMemoriesEncryptionKey(basePassphrase);
        this._authenticated = true;
        return this._userData;
      } else {
        return null;
      }
    } catch (error) {
      logError(error);
      return null;
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
    const { publicKey, privateKey } = keyPairFromSeed(`${basePassphrase}`);

    // TODO: Check if user exists

    try {
      const response = await this.skynetClient.db.setJSON(privateKey, this.userDataKey, userData);
      if (autoLogin) {
        this._userData = userData;
        this._publicKeyFromSeed = publicKey;
        this._privateKeyFromSeed = privateKey;
        this._userMemoriesSkydbKey = await this.generateUserMemoriesKey(basePassphrase);
        this._userMemoriesEncryptionKey = await this.generateUserMemoriesEncryptionKey(basePassphrase);
        this._authenticated = true;
        return this._userData;
      }
      return true;
    } catch (error) {
      logError(error);
      return null;
    }
  }

  private async generateUserMemoriesKey(basePassphrase: string): Promise<string> {
    const userMemoriesKeySuffix = await this._sha256(`${basePassphrase}_USER_MEMORIES`); // TODO: make it stronger!
    return `${this._userMemoriesSkydbKeyPrefix}_${userMemoriesKeySuffix}`;
  }

  private async generateUserMemoriesEncryptionKey(basePassphrase: string): Promise<string> {
    const userMemoriesKeySuffix = await this._sha256(`${basePassphrase}_USER_MEMORIES_ENCRYPTION`); // TODO: make it stronger!
    return `${this._userMemoriesSkydbKeyPrefix}_${userMemoriesKeySuffix}`;
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

      return response.data as UserMemory[];
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

      await this.skynetClient.db.setJSON(
        this._privateKeyFromSeed,
        this._userMemoriesSkydbKey,
        memories,
      );

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
        await this.skynetClient.db.setJSON(
          this._privateKeyFromSeed,
          this._userMemoriesSkydbKey,
          memories
        );
      }
    } catch (error) {
      logError(error);
    }
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
        followedUserPublicKey, // TODO: will work with the next version of the skynet-js api as promised by David!
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

  public async getMemoriesOfFollowedUsers(): Promise<UsersPublicMemories> {
    const followedUsersMemories: UsersPublicMemories = {};

    const followedUsers = await this.getFollowedUsers();
    followedUsers.forEach(async (fu) => {
      const followedUserPublicMemories: UserPublicMemory[] = await this.getPublicMemoriesByFollowedUserPublicKey(fu.publicKey);
      followedUsersMemories[fu.publicKey] = followedUserPublicMemories;
    });
  
    return followedUsersMemories;
  }

  public async resolveSkylink(skylink: string): Promise<void> {
    // TODO: implement me!!
    // decode the file
    // return bytes
  }

  private async _sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
  }
}
