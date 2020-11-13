import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Memory } from './memory.model';
import * as MemoryActions from './memory.actions';

export const memoriesFeatureKey = 'memories';

export interface State extends EntityState<Memory> {
  initialized: boolean;
}

export const adapter: EntityAdapter<Memory> = createEntityAdapter<Memory>();

export const initialState: State = adapter.getInitialState({
  initialized: false
});


export const reducer = createReducer(
  initialState,
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
    (state, action) => adapter.setAll(action.memories, state)
  ),
  on(MemoryActions.clearMemories,
    state => adapter.removeAll(state)
  ),
);


export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();
