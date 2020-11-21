import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Memory } from './memory.model';
import * as MemoryActions from './memory.actions';
import { LoadingState } from 'src/app/models/loading-state';

export const memoriesFeatureKey = 'memories';

export interface State extends EntityState<Memory>, LoadingState {
  initialized: boolean;
  populatedConnectedUsers: string[];
}

export const adapter: EntityAdapter<Memory> = createEntityAdapter<Memory>({
  sortComparer: (a, b) => {
    return b.added.getTime() - a.added.getTime();
  }
});

export const initialState: State = adapter.getInitialState({
  initialized: false,
  loading: false,
  error: undefined,
  populatedConnectedUsers: []
});

export const reducer = createReducer(
  initialState,

  on(MemoryActions.getMemories,
    (state) => ({ ...state, loading: true, error: undefined })
  ),
  on(MemoryActions.getMemoriesFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),
  on(MemoryActions.getMemoriesSuccess,
    (state, action) => adapter.addMany(action.memories, { ...state, loading: false, error: undefined, initialized: true })
  ),

  on(MemoryActions.newMemory,
    (state) => ({ ...state, error: undefined, loading: true })
  ),
  on(MemoryActions.newMemorySuccess,
    (state, action) => adapter.addOne(action.memory, { ...state, loading: false, error: undefined })
  ),
  on(MemoryActions.newMemoryFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),

  on(MemoryActions.forgetMemory,
    (state) => ({ ...state, error: undefined, loading: true })
  ),
  on(MemoryActions.forgetMemorySuccess,
    (state, action) => adapter.removeOne(action.id, { ...state, error: undefined, loading: false })
  ),
  on(MemoryActions.forgetMemoryFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),

  on(MemoryActions.makePublicMemory,
    (state) => ({ ...state, error: undefined, loading: true })
  ),
  on(MemoryActions.makePublicMemorySuccess,
    (state, action) => adapter.updateOne({
      id: action.id, changes: { isPublic: action.isPublic }
    }, { ...state, error: undefined, loading: false })
  ),
  on(MemoryActions.makePublicMemoryFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),

  on(MemoryActions.getShareMemoryLink,
    (state) => ({ ...state, error: undefined, loading: true })
  ),
  on(MemoryActions.getShareMemoryLinkSuccess,
    (state, action) => adapter.updateOne({
      id: action.id, changes: {shareLink: action.link, isShared: action.isShared }
    }, { ...state, error: undefined, loading: false })
  ),
  on(MemoryActions.getShareMemoryLinkFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),
  on(MemoryActions.connectedUsersMemoriesSuccess,
    (state, action) => {
      const populatedConnectedUsers = action.connectedUsers
        .filter(f => !state.populatedConnectedUsers.includes(f.publicKey))
        .map(f => f.publicKey);
      return adapter.addMany(
        action.memories,
        { ...state, populatedConnectedUsers: [ ...state.populatedConnectedUsers, ...populatedConnectedUsers] }
      );
    }
  )
);
