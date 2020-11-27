import { createAction, props } from '@ngrx/store';
import Connection from './connection.model';

export const GetConnectionAction = createAction('[Connection] - Get Connection');

export const CreateConnectionAction = createAction(
  '[Connection] - Create Connection',
  props<Connection>()
);

export const BeginGetConnectionAction = createAction('[Connection] - Begin Get Connection');

export const SuccessGetConnectionAction = createAction(
  '[Connection] - Success Get Connections',
  props<{ payload: Connection[] }>()
);

export const BeginCreateConnectionAction = createAction(
  '[Connection] - Begin Create Connection',
  props<{ payload: Connection }>()
);

export const SuccessCreateConnectionAction = createAction(
  '[Connection] - Success Create Connection',
  props<{ payload: Connection }>()
);
