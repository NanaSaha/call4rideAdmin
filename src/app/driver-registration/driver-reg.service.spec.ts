import { TestBed } from '@angular/core/testing';

import { DriverRegService } from './driver-reg.service';

describe('DriverRegService', () => {
  let service: DriverRegService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverRegService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
