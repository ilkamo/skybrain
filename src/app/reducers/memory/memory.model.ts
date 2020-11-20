import { UserPublicMemory } from './../../models/user-public-memories';
import { UserMemory } from 'src/app/models/user-memory';

// tslint:disable-next-line: no-empty-interface
export interface Memory extends UserMemory {
  followerId?: string;
}

export const mapSkyToMemory = (memory: UserMemory): Memory => {
  const tags = memory.tags && memory.tags.filter(tag => tag.length) || undefined;
  return { ...memory, tags };
};

export const mapMemoryToSky = (memory: Memory): UserMemory | undefined => {
  if (memory.followerId) {
    return undefined;
  }
  const { added, id, mimeType, name, skylink, tags, text, location, isPublic, isShared, shareLink, ...rest } = memory;
  return { added, id, mimeType, name, skylink, tags, text, location, isPublic, isShared, shareLink };
};

export const mapPublicSkyToMemory = (publicMemory: UserPublicMemory): Memory => {
  return mapSkyToMemory(publicMemory.memory);
};

