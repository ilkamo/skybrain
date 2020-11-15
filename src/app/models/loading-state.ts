import { ServiceError } from './error';

export interface LoadingState {
  loading: boolean;
  error?: string;
}
