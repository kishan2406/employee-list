import { TestBed } from '@angular/core/testing';

import { EditEmployeeDataService } from './edit-employee-data.service';

describe('EditEmployeeDataService', () => {
  let service: EditEmployeeDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditEmployeeDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
