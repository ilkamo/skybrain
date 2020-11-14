import { LoadingState } from 'src/app/models/loading-state';
import { UserMemory } from 'src/app/models/user-memory';

export interface Memory extends UserMemory, LoadingState {
  saved: boolean;
}

export const mapSkyToMemory = (memory: UserMemory, index: number, array: UserMemory[]): Memory => {
  return { ...memory, loading: false, saved: true, error: undefined };
};

export const mapMemoryToSky = (memory: Memory, index: number, array: Memory[]): UserMemory => {
  const { added, id, mimeType, name, skylink, tags, text, location, ...rest } = memory;
  return { added, id, mimeType, name, skylink, tags, text, location };
};

