import { createFeatureSelector, createSelector } from '@ngrx/store';
import { State as RootState } from '..';
import { State as ConnectionState, connectionsFeatureKey } from './connection.reducer';

export const selectFeature = createFeatureSelector<RootState, ConnectionState>(connectionsFeatureKey);

export const selectVisitedConnections = createSelector(
  selectFeature,
  (state: ConnectionState) => state.visitedConnections
);

export const selectConnectionsInfo = createSelector(
  selectFeature,
  (state: ConnectionState) => state.connectionsInfo
);

export const selectConnections = createSelector(
  selectFeature,
  (state: ConnectionState) => state
);
