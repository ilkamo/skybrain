import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { defaultSkynetPortalUrl } from 'skynet-js';
import { PORTAL } from '../tokens/portal.token';

@Pipe({
  name: 'siaUrl'
})
export class SiaUrlPipe implements PipeTransform {
  constructor(@Optional() @Inject(PORTAL) private portal: string) {
    if (!portal) {
      this.portal = defaultSkynetPortalUrl;
    }
  }

  transform(url?: string): unknown {
    if (!url || typeof url !== 'string' || !url.startsWith('sia:')) {
      return url;
    }

    url = url.replace(/^sia:/, '');
    return `${this.portal}/${url}`;
  }

}
