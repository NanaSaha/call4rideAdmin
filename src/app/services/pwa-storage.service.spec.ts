import { TestBed } from '@angular/core/testing';

import { PwaStorageService } from './pwa-storage.service';

describe('PwaStorageService', () => {
  let service: PwaStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
