import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private seedLocalStorageKey = "seed";
  private skyidLocalStorageKey = "skyid";
  private maxCacheAge = 60 * 60 * 24;
  private isUsersCacheSync = false;

  constructor(private api: ApiService) {
    localStorage.removeItem("cahcedUsers"); // remove old deprecated cache!

    let localCachedUsers = this.api.getLocalCachedUsers();
    if (this.api.unixTimestampSeconds() - localCachedUsers.lastPullAt > this.maxCacheAge
      && this.isUsersCacheSync == false) {
      this.api.syncCachedUsers();
      this.isUsersCacheSync = true;
    }
  }

  public resolveNameFromPublicKey(publicKey: string): string {
    let localCachedUsers = this.api.getLocalCachedUsers();

    if (!(publicKey in localCachedUsers.cache)) {
      return publicKey;
    }

    const connection = localCachedUsers.cache[publicKey];
    const nickname = connection.nickname;
    return nickname !== undefined ? `${nickname}` : publicKey;
  }

  public getSeed(): string {
    try {
      const seed = localStorage.getItem(this.seedLocalStorageKey);
      if (seed) {
        return seed;
      }

      const skyidData = localStorage.getItem(this.skyidLocalStorageKey);
      if (skyidData) {
        const parsedSkyidData = JSON.parse(skyidData);
        if ("seed" in parsedSkyidData) {
          return parsedSkyidData["seed"];
        }
      }
    } catch (error) { }

    return "";
  }

  public persistSeed(seed: string) {
    localStorage.setItem(this.seedLocalStorageKey, seed);
  }

  public deleteSeed() {
    localStorage.removeItem(this.seedLocalStorageKey);
    localStorage.removeItem(this.skyidLocalStorageKey);
  }
}
