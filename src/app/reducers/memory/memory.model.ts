import { UserMemory } from 'src/app/models/user-memory';

// tslint:disable-next-line: no-empty-interface
export interface Memory extends UserMemory {
  shareLink?: string;
}

export const mapSkyToMemory = (memory: UserMemory): Memory => {
  return { ...memory };
};

export const mapMemoryToSky = (memory: Memory): UserMemory => {
  const { added, id, mimeType, name, skylink, tags, text, location, isPublic, isShared, ...rest } = memory;
  return { added, id, mimeType, name, skylink, tags, text, location, isPublic, isShared};
};

