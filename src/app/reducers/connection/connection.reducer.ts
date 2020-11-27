import { Action, createReducer, on } from '@ngrx/store';
import * as ConnectionActions from './connection.action';
import Connection from './connection.model';

export const connectionsFeatureKey = 'connections';

export interface State {
  visitedConnections: Connection[];
}

export const initializeState = (): State => {
  return { visitedConnections: [] };
};

export const intialState = initializeState();

export const reducer = createReducer(
  intialState,
  on(ConnectionActions.GetConnectionAction, state => state),
  on(ConnectionActions.CreateConnectionAction, (state: State, visitedConnection: Connection) => {
    return { ...state, visitedConnections: [...state.visitedConnections, visitedConnection] };
  }),
  on(ConnectionActions.SuccessGetConnectionAction, (state: State, { payload }) => {
    return { ...state, visitedConnections: payload };
  }),
  on(ConnectionActions.SuccessCreateConnectionAction, (state: State, { payload }) => {
    return { ...state, visitedConnections: [...state.visitedConnections, payload] };
  })
);
