import { UsersData } from './../../models/user-data';
import { createReducer, on } from '@ngrx/store';
import * as ConnectionActions from './connection.action';
import { Connection } from './connection.model';

export const connectionsFeatureKey = 'connections';

export interface State {
  visitedConnections: Connection[];
  connectionsInfo: UsersData;
}

export const initializeState = (): State => {
  return { visitedConnections: [], connectionsInfo: {} };
};

export const intialState = initializeState();

export const reducer = createReducer(
  intialState,
  on(ConnectionActions.getConnectionAction, state => state),
  on(ConnectionActions.createVisitedConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: [...state.visitedConnections, connection] };
  }),
  on(ConnectionActions.successGetConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: connection };
  }),
  on(ConnectionActions.successCreateVisitedConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: [...state.visitedConnections, connection] };
  }),
  on(ConnectionActions.successGetConnectionInfoAction, (state: State, { connectionData }) => {
    return { ...state, connectionsInfo: { ...state.connectionsInfo, ...connectionData } };
  })
);
