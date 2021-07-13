import { TestBed } from '@angular/core/testing';

import { RideRequestsService } from './ride-requests.service';

describe('RideRequestsService', () => {
  let service: RideRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RideRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
