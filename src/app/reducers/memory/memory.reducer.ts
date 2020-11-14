import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Memory } from './memory.model';
import * as MemoryActions from './memory.actions';
import { LoadingState } from 'src/app/models/loading-state';

export const memoriesFeatureKey = 'memories';

export interface State extends EntityState<Memory>, LoadingState {
}

export const adapter: EntityAdapter<Memory> = createEntityAdapter<Memory>();

export const initialState: State = adapter.getInitialState({
  loading: false,
  error: undefined
});

export const reducer = createReducer(
  initialState,

  on(MemoryActions.getMemories,
    (state) => ({ ...state, loading: true, error: undefined })
  ),
  on(MemoryActions.getMemoriesFailure,
    (state, action) => ({ ...state, loading: false, error: action.error })
  ),
  on(MemoryActions.addMemory,
    (state, action) => adapter.addOne(action.memory, state)
  ),
  on(MemoryActions.upsertMemory,
    (state, action) => adapter.upsertOne(action.memory, state)
  ),
  on(MemoryActions.addMemories,
    (state, action) => adapter.addMany(action.memories, state)
  ),
  on(MemoryActions.upsertMemories,
    (state, action) => adapter.upsertMany(action.memories, state)
  ),
  on(MemoryActions.updateMemory,
    (state, action) => adapter.updateOne(action.memory, state)
  ),
  on(MemoryActions.updateMemories,
    (state, action) => adapter.updateMany(action.memories, state)
  ),
  on(MemoryActions.deleteMemory,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(MemoryActions.deleteMemories,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(MemoryActions.loadMemories,
    (state, action) => adapter.setAll(action.memories, { ...state, loading: false, error: undefined })
  ),
  on(MemoryActions.clearMemories,
    state => adapter.removeAll(state)
  ),
  on(MemoryActions.newMemory,
    (state, action) => adapter.addOne({
      ...action.memory,
      saved: false,
      loading: true,
      error: undefined,
      mimeType: null
    }, state)
  ),
  on(MemoryActions.newMemorySuccess,
    (state, action) => adapter.updateOne({
      id: action.memory.id,
      changes: action.memory
    }, state)
  )
);
