import { DOCUMENT, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import { NavigationExtras, Router, UrlTree } from '@angular/router';

@Pipe({
  name: 'absolutePath'
})
export class AbsolutePathPipe implements PipeTransform {

  constructor(
    private router: Router,
    private locationStrategy: LocationStrategy,
    @Optional() @Inject(DOCUMENT) private document: Document
    ) {}

  // tslint:disable-next-line: no-any
  transform<T>(commands: T[], navigationExtras?: NavigationExtras | undefined): string | T[] {
    if (!this.document) {
      return commands;
    }

    try {
      const tree = this.router.createUrlTree(commands, navigationExtras);
      let { host } = (this.document.defaultView as Window ).location;
      if (this.locationStrategy instanceof HashLocationStrategy) {
        host += '#';
      }
      return host + tree.toString();
    } catch (error) {
      return commands;
    }
  }

}
