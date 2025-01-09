import { Injectable, signal } from '@angular/core';
import { EmployeeDetails } from 'src/app/ṃodels/employee-details';

@Injectable({
  providedIn: 'root',
})
export class EditEmployeeDataService {
  // Create a signal to hold employee data
  passEmployeeData = signal<EmployeeDetails | null>(null);

  constructor() {}

  // Method to set the employee data
  setEmployeeData(employee: EmployeeDetails): void {
    this.passEmployeeData.set(employee); // Update the signal's value
  }

  // Method to clear the employee data
  clearEmployeeData(): void {
    this.passEmployeeData.set(null); // Reset the signal's value
  }
}
