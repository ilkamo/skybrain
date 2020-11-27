import { UsersData } from 'src/app/models/user-data';
import { createAction, props } from '@ngrx/store';
import { Connection } from './connection.model';

export const getConnectionAction = createAction('[Connection] - Get Connection');

export const createVisitedConnectionAction = createAction(
  '[Connection] - Create Connection',
  props<{ connection: Connection }>()
);

export const beginGetConnectionAction = createAction('[Connection] - Begin Get Connection');

export const successGetConnectionAction = createAction(
  '[Connection] - Success Get Connections',
  props<{ connection: Connection[] }>()
);

export const beginCreateVisitedConnectionAction = createAction(
  '[Connection] - Begin Create Connection',
  props<{ connection: Connection }>()
);

export const successCreateVisitedConnectionAction = createAction(
  '[Connection] - Success Create Connection',
  props<{ connection: Connection }>()
);

export const beginGetConnectionInfoAction = createAction(
  '[Connection] - Begin Get Connection Info',
  props<{ publicKey: string }>()
);

export const successGetConnectionInfoAction = createAction(
  '[Connection] - Success Get Connection Info',
  props<{ connectionData: UsersData }>()
);

export const failureGetConnectionInfoAction = createAction(
  '[Connection] Failure Get Connection Info',
  props<{ error: string }>()
);
