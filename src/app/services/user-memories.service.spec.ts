import { TestBed } from '@angular/core/testing';

import { UserMemoriesService } from './user-memories.service';

describe('UserMemoriesService', () => {
  let service: UserMemoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserMemoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
