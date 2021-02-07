/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CacheService } from './cache.service';

describe('Service: Cache', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CacheService]
    });
  });

  it('should ...', inject([CacheService], (service: CacheService) => {
    expect(service).toBeTruthy();
  }));
});
