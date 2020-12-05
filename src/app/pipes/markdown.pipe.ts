import { Pipe, PipeTransform } from '@angular/core';

// @ts-ignore
import * as marked from 'marked';

@Pipe({
  name: 'markdown'
})

export class MarkdownPipe implements PipeTransform {

  transform(value: any): string {
    if (value && value.length > 0) {
      return marked(value);
    }
    return '';
  }

}
