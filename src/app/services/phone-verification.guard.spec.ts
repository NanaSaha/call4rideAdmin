import { TestBed } from '@angular/core/testing';

import { PhoneVerificationGuard } from './phone-verification.guard';

describe('PhoneVerificationGuard', () => {
  let guard: PhoneVerificationGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PhoneVerificationGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
