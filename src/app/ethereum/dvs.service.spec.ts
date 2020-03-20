import { TestBed } from '@angular/core/testing';

import { DvsService } from './dvs.service';

describe('DvsService', () => {
  let service: DvsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DvsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
