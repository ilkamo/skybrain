import { Pipe, PipeTransform } from '@angular/core';
import { Memory } from '../reducers/memory/memory.model';

@Pipe({
  name: 'memoryMediaType'
})
export class MemoryMediaTypePipe implements PipeTransform {

  transform(value: Memory): string | undefined {
    if (!value || !value?.skylink) {
      return undefined;
    }
    if (value.mimeType && value.mimeType.indexOf('video') === 0) {
      return 'video';
    }
    if (value.mimeType && value.mimeType.indexOf('audio') === 0) {
      return 'audio';
    }
    return 'image';
  }

}
