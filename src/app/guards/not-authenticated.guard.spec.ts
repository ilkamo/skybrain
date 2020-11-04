import { TestBed } from '@angular/core/testing';

import { NotAuthenticatedGuard } from './not-authenticated.guard';

describe('NotAuthenticatedGuard', () => {
  let guard: NotAuthenticatedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NotAuthenticatedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
