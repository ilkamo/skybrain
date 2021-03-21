import { StreamMemory } from './../../models/stream-memory';
import { UserPublicMemory } from './../../models/user-public-memories';
import { UserMemory } from 'src/app/models/user-memory';

export interface Memory extends UserMemory {
  connectedId?: string;
}

export const mapSkyToMemory = (memory: UserMemory): Memory => {
  const tags = memory.tags && memory.tags.filter(tag => tag.length) || undefined;
  return { ...memory, tags };
};

export const mapMemoryToSky = (memory: Memory): UserMemory | undefined => {
  if (memory.connectedId) {
    return undefined;
  }
  const { added, id, mimeType, name, skylink, skylinkResized, tags, text, location, isPublic, isShared, shareLink, ...rest } = memory;
  return { added, id, mimeType, name, skylink, skylinkResized, tags, text, location, isPublic, isShared, shareLink };
};

export const mapPublicSkyToMemory = (publicMemory: UserPublicMemory): Memory => {
  return mapSkyToMemory(publicMemory.memory);
};

export const mapStreamMemoryToMemory = (streamMemory: StreamMemory): Memory => {
  return { ...streamMemory, connectedId: streamMemory.ownerPublicKey };
};
