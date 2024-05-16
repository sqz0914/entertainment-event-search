import { TestBed } from '@angular/core/testing';

import { EventsSearchService } from './events-search.service';

describe('EventsSearchService', () => {
  let service: EventsSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventsSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
