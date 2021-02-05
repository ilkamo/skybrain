import { Injectable } from '@angular/core';
import { CachedUsers } from '../models/users-cache';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cachedUsersLocalStorageKey = "cahcedUsers";
  private seedLocalStorageKey = "seed";
  private skyidLocalStorageKey = "skyid";

  constructor() { }

  public resolveNameFromPublicKey(publicKey: string): string {
    let localCachedUsers = {} as CachedUsers;
    try {
      const fromStorage = localStorage.getItem(this.cachedUsersLocalStorageKey);
      if (fromStorage) {
        localCachedUsers = JSON.parse(fromStorage) as CachedUsers;
      }
    } catch (error) { }

    if (!(publicKey in localCachedUsers)) {
      return publicKey;
    }

    const connection = localCachedUsers[publicKey];
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
