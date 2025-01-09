import { Component, effect, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { EditEmployeeDataService } from 'src/app/services/editData/edit-employee-data.service';
import { SendDataService } from 'src/app/services/sendToindexDB/send-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { EmployeeDetails } from 'src/app/ṃodels/employee-details';
import { ImageDetails } from 'src/app/ṃodels/image-details';

@Component({
  selector: 'app-add-employee-details',
  templateUrl: './add-employee-details.component.html',
  styleUrls: ['./add-employee-details.component.scss'],
})
export class AddEmployeeDetailsComponent implements OnInit {
  addEmployeeDetails!: FormGroup;
  headerData: string = 'Add Employee Details';
  employeeData: EmployeeDetails | null = null;
  sideImg!:string;
  imageDetails:ImageDetails = new ImageDetails();
  constructor(
    private fb: FormBuilder,
    private sendDataService: SendDataService,
    private snackbarService: SnackbarService,
    private router:Router,
    private editEmployeeDataService: EditEmployeeDataService
  ) {
    
    effect(() => {
      this.employeeData = this.editEmployeeDataService.passEmployeeData();
      if(this.employeeData){
        this.headerData = "Edit Employee Details";
        this.imageDetails.imageUrl = "assets/employeea-add-edit/edit-employee.svg";
        this.imageDetails.altText = "Edit Image";
      }else{
        this.headerData = "Add Employee Details";
          this.imageDetails.imageUrl = "assets/employeea-add-edit/add-emloyee.svg";
        this.imageDetails.altText = "Add Image";

      }
      
    });
  }

  roles: string[] = [
    'Product Designer',
    'Fluter Developer',
    'QA Tester',
    'Product Owner',
  ];
  ngOnInit(): void {
    this.addEmployeeDetails = this.fb.group({
      id: [null], // Hidden field for employee ID
      employeeName: ['', Validators.required],
      role: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],

    },{ validators: dateRangeValidator() } );
 // Delay signal fetch to ensure the form is ready
 setTimeout(() => {
  const employeeData = this.editEmployeeDataService.passEmployeeData();
  if (employeeData) {
    this.populateForm(employeeData);
  }
}, );
   
  }
 
 // Populate form with employee data
 populateForm(employeeData: EmployeeDetails): void {
  if (this.addEmployeeDetails) {
    this.addEmployeeDetails.patchValue({
      id: employeeData.id, // Populate ID
      employeeName: employeeData.employeeName,
      role: employeeData.role,
      fromDate: employeeData.fromDate,
      toDate: employeeData.toDate,
    });
  } else {
    console.error('FormGroup is not initialized.');
  }
}


  hasError = (controlName: string, errorName: string) => {
    return this.addEmployeeDetails.controls[controlName].getError(errorName);
  };
  cancelForm(){
    this.router.navigate(['/'])

  }



  submitEmployeeData() {
    if (this.addEmployeeDetails.valid) {
      const employeeData = new EmployeeDetails();
      employeeData.id = this.addEmployeeDetails.value.id; // Use the ID if it exists
      employeeData.employeeName = this.addEmployeeDetails.value.employeeName;
      employeeData.role = this.addEmployeeDetails.value.role;
      employeeData.fromDate = this.addEmployeeDetails.value.fromDate;
      employeeData.toDate = this.addEmployeeDetails.value.toDate;
  
      this.sendDataService.openDatabase().then((db) => {
        const transaction = db.transaction('employees', 'readwrite');
        const objectStore = transaction.objectStore('employees');
  
        if (employeeData.id) {
          // Update existing record
          const request = objectStore.put(employeeData);
  
          request.onsuccess = () => {
            this.snackbarService.showSnackbar(
              'Employee data updated successfully',
              'Close'
            );
            this.router.navigate(['/']);
          };
  
          request.onerror = (error: any) => {
            console.error('Error updating employee data', error);
          };
        } else {
          // Add new record
          employeeData.id = new Date().getTime(); // Generate a unique ID
          const request = objectStore.add(employeeData);
  
          request.onsuccess = () => {
            this.snackbarService.showSnackbar(
              'Employee data added successfully',
              'Close'
            );
            this.router.navigate(['/']);
          };
  
          request.onerror = (error: any) => {
            console.error('Error saving employee data', error);
          };
        }
      }).catch((error: any) => {
        console.error('Error opening the database', error);
      });
    } else {
      this.snackbarService.showSnackbar('Ensure all fields are filled out correctly', 'Close');
    }
  }
  
}

export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const fromDate = control.get('fromDate')?.value;
    const toDate = control.get('toDate')?.value;

    if (!fromDate || !toDate) {
      // Don't validate if one of the dates is missing
      return null;
    }

    // Check if "From Date" is later than "To Date"
    const isInvalidRange = new Date(fromDate) > new Date(toDate);
    return isInvalidRange ? { invalidDateRange: true } : null;
  };
}
