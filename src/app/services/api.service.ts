import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { PORTAL } from '../tokens/portal.token';
import { SkynetClient, keyPairFromSeed, PublicKey, SecretKey, defaultSkynetPortalUrl } from 'skynet-js';
import { UserData, USER_DATA_KEY } from '../models/user-data';
import { UserMemory, USER_MEMORIES_KEY_PREFIX } from '../models/user-file';
import { logError } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _userData: UserData | null = null;
  private _authenticated = false;
  private _publicKey: PublicKey | null = null;
  private _privateKey: SecretKey | null = null;
  private _userMemoriesKey: string | null = null;
  private _userMemoriesEncryptionKey: string | null = null;
  private skynetClient: SkynetClient;

  constructor(
    private zone: NgZone,
    @Optional() @Inject(PORTAL) private portal: string,
    @Inject(USER_DATA_KEY) private userDataKey: string,
    @Inject(USER_MEMORIES_KEY_PREFIX) private userMemoriesKeyPrefix: string,
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
        this._publicKey = publicKey;
        this._privateKey = privateKey;
        this._userMemoriesKey = await this.generateUserMemoriesKey(basePassphrase);
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

    const basePassphrase = `${userData.nickname}_${passphrase}`
    const { publicKey, privateKey } = keyPairFromSeed(`${basePassphrase}`);

    // TODO: Check if user exists

    try {
      const response = await this.skynetClient.db.setJSON(privateKey, this.userDataKey, userData);
      if (autoLogin) {
        this._userData = userData;
        this._publicKey = publicKey;
        this._privateKey = privateKey;
        this._userMemoriesKey = await this.generateUserMemoriesKey(basePassphrase);
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
    return `${this.userMemoriesKeyPrefix}_${userMemoriesKeySuffix}`;
  }

  private async generateUserMemoriesEncryptionKey(basePassphrase: string): Promise<string> {
    const userMemoriesKeySuffix = await this._sha256(`${basePassphrase}_USER_MEMORIES_ENCRYPTION`); // TODO: make it stronger!
    return `${this.userMemoriesKeyPrefix}_${userMemoriesKeySuffix}`;
  }

  public async getMemories(): Promise<UserMemory[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKey,
        this._userMemoriesKey
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

  public async addMemory(file: File): Promise<string | null> {
    try {
      const skylink = await this.skynetClient.uploadFile(file);
      const memories = await this.getMemories();

      memories.unshift({
        added: new Date(Date.now()),
        skylink,
      });

      await this.skynetClient.db.setJSON(
        this._privateKey,
        this._userMemoriesKey,
        memories,
      );

      return skylink;
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async deleteMemory(skylink: string): Promise<void> {
    try {
      let memories = await this.getMemories();
      const foundIndex = memories.findIndex(
        (memory) => memory.skylink && memory.skylink.search(skylink) > -1
      );
      if (foundIndex > -1) {
        memories = [
          ...memories.slice(0, foundIndex),
          ...memories.slice(foundIndex + 1),
        ];
        await this.skynetClient.db.setJSON(
          this._privateKey,
          this._userMemoriesKey,
          memories
        );
      }
    } catch (error) {
      logError(error);
    }
  }

  public async resolveSkylink(skylink: string) {
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
