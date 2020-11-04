import { environment } from 'src/environments/environment';

// tslint:disable-next-line: no-any
export function logError(error: any): void {
  if (!environment.production) {
    console.log(error);
  }
}
