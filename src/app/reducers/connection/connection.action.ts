import { createAction, props } from '@ngrx/store';
import Connection from './connection.model';

export const GetConnectionAction = createAction('[Connection] - Get Connection');

export const CreateVisitedConnectionAction = createAction(
  '[Connection] - Create Connection',
  props<Connection>()
);

export const BeginGetConnectionAction = createAction('[Connection] - Begin Get Connection');

export const SuccessGetConnectionAction = createAction(
  '[Connection] - Success Get Connections',
  props<{ payload: Connection[] }>()
);

export const BeginCreateVisitedConnectionAction = createAction(
  '[Connection] - Begin Create Connection',
  props<{ payload: Connection }>()
);

export const SuccessCreateVisitedConnectionAction = createAction(
  '[Connection] - Success Create Connection',
  props<{ payload: Connection }>()
);
