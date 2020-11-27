import { UsersData } from './../../models/user-data';
import { Action, createReducer, on } from '@ngrx/store';
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
  on(ConnectionActions.GetConnectionAction, state => state),
  on(ConnectionActions.CreateVisitedConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: [...state.visitedConnections, connection] };
  }),
  on(ConnectionActions.SuccessGetConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: connection };
  }),
  on(ConnectionActions.SuccessCreateVisitedConnectionAction, (state: State, { connection }) => {
    return { ...state, visitedConnections: [...state.visitedConnections, connection] };
  }),
  on(ConnectionActions.SuccessGetConnectionInfoAction, (state: State, { connectionData }) => {
    return { ...state, connectionsInfo: { ...state.connectionsInfo, ...connectionData } };
  })
);
