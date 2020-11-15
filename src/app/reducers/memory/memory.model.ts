import { UserMemory } from 'src/app/models/user-memory';

// tslint:disable-next-line: no-empty-interface
export interface Memory extends UserMemory {
}

export const mapSkyToMemory = (memory: UserMemory): Memory => {
  return { ...memory };
};

export const mapMemoryToSky = (memory: Memory): UserMemory => {
  const { added, id, mimeType, name, skylink, tags, text, location, ...rest } = memory;
  return { added, id, mimeType, name, skylink, tags, text, location };
};

