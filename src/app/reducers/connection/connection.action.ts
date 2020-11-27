import { UsersData } from 'src/app/models/user-data';
import { createAction, props } from '@ngrx/store';
import Connection from './connection.model';

export const GetConnectionAction = createAction('[Connection] - Get Connection');

export const CreateVisitedConnectionAction = createAction(
  '[Connection] - Create Connection',
  props<{ connection: Connection }>()
);

export const BeginGetConnectionAction = createAction('[Connection] - Begin Get Connection');

export const SuccessGetConnectionAction = createAction(
  '[Connection] - Success Get Connections',
  props<{ connection: Connection[] }>()
);

export const BeginCreateVisitedConnectionAction = createAction(
  '[Connection] - Begin Create Connection',
  props<{ connection: Connection }>()
);

export const SuccessCreateVisitedConnectionAction = createAction(
  '[Connection] - Success Create Connection',
  props<{ connection: Connection }>()
);

export const BeginGetConnectionInfoAction = createAction(
  '[Connection] - Begin Get Connection Info',
  props<{ publicKey: string }>()
);

export const SuccessGetConnectionInfoAction = createAction(
  '[Connection] - Success Get Connection Info',
  props<{ connectionData: UsersData }>()
);

export const FailureGetConnectionInfoAction = createAction(
  '[Connection] Failure Get Connection Info',
  props<{ error: string }>()
);
