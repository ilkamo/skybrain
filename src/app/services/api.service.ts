import { Inject, Injectable, NgZone, Optional } from '@angular/core';
import { PORTAL } from '../tokens/portal.token';
import { SkynetClient, keyPairFromSeed, PublicKey, SecretKey, defaultSkynetPortalUrl } from 'skynet-js';
import { UserData, USER_DATA_KEY } from '../models/user-data';
import { UserFile, USER_FILES_KEY_PREFIX } from '../models/user-file';
import { logError } from '../utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _userData: UserData | null = null;
  private _authenticated = false;
  private _publicKey: PublicKey | null = null;
  private _privateKey: SecretKey | null = null;
  private _userFilesKey: string | null = null;
  private skynetClient: SkynetClient;

  constructor(
    private zone: NgZone,
    @Optional() @Inject(PORTAL) private portal: string,
    @Inject(USER_DATA_KEY) private userDataKey: string,
    @Inject(USER_FILES_KEY_PREFIX) private userFilesKeyPrefix: string,
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
        this._userFilesKey = await this.generateUserFilesKey(basePassphrase);
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
        this._userFilesKey = await this.generateUserFilesKey(basePassphrase);
        this._authenticated = true;
        return this._userData;
      }
      return true;
    } catch (error) {
      logError(error);
      return null;
    }
  }

  private async generateUserFilesKey(basePassphrase: string): Promise<string> {
    const userFilesKeySuffix = await this._sha256(`${basePassphrase}_USER_FILES`); // TODO: make it stronger!
    return `${this.userFilesKeyPrefix}_${userFilesKeySuffix}`;
  }

  public async getImages(): Promise<UserFile[]> {
    try {
      const response = await this.skynetClient.db.getJSON(
        this._publicKey,
        this._userFilesKey
      );
      if (!response || !response.data) {
        return [];
      }
      return response.data as UserFile[];
    } catch (error) {
      logError(error);
      return [];
    }
  }

  public async addImage(file: File): Promise<string | null> {
    try {
      const skylink = await this.skynetClient.uploadFile(file);
      const images = await this.getImages();

      images.unshift({
        added: new Date(Date.now()),
        skylink,
      });

      await this.skynetClient.db.setJSON(
        this._privateKey,
        this._userFilesKey,
        images, // TODO: backward compatibility (images)
      );

      return skylink;
    } catch (error) {
      logError(error);
      return null;
    }
  }

  public async deleteImage(skylink: string): Promise<void> {
    try {
      let images = await this.getImages();
      const foundIndex = images.findIndex(
        (img) => img.skylink && img.skylink.search(skylink) > -1
      );
      if (foundIndex > -1) {
        images = [
          ...images.slice(0, foundIndex),
          ...images.slice(foundIndex + 1),
        ];
        await this.skynetClient.db.setJSON(
          this._privateKey,
          this._userFilesKey,
          images
        );
      }
    } catch (error) {
      logError(error);
    }
  }

  private async _sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
  }
}
