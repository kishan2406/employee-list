import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEmployeeDetailsComponent } from './add-employee-details.component';

describe('AddEmployeeDetailsComponent', () => {
  let component: AddEmployeeDetailsComponent;
  let fixture: ComponentFixture<AddEmployeeDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEmployeeDetailsComponent]
    });
    fixture = TestBed.createComponent(AddEmployeeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
