import { LoadingState } from 'src/app/models/loading-state';
import { UserMemory } from 'src/app/models/user-memory';

export interface Memory extends UserMemory, LoadingState {
  saved: boolean;
  deleted?: true;
}

export const mapSkyToMemory = (memory: UserMemory, index: number, array: UserMemory[]): Memory => {
  return { ...memory, loading: false, saved: true, error: undefined };
};

export const mapMemoryToSky = (memory: Memory, index: number, array: Memory[]): UserMemory | null => {
  const { added, id, mimeType, name, skylink, tags, text, location, deleted, ...rest } = memory;
  if (deleted) {
    return null;
  }
  return { added, id, mimeType, name, skylink, tags, text, location };
};

