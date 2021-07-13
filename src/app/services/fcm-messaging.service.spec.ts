import { TestBed } from '@angular/core/testing';

import { FcmMessagingService } from './fcm-messaging.service';

describe('FcmMessagingService', () => {
  let service: FcmMessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FcmMessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
