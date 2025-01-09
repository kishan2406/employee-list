import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EditEmployeeDataService } from 'src/app/services/editData/edit-employee-data.service';
import { SendDataService } from 'src/app/services/sendToindexDB/send-data.service';
import { SnackbarService } from 'src/app/services/snackbar/snackbar.service';
import { EmployeeDetails } from 'src/app/ṃodels/employee-details';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit {
  headerDataFromList: string = 'Employee List';
  previousEmployeeArr: EmployeeDetails[] = [];
  currentEmployeeArr: EmployeeDetails[] = [];
  isLoading: boolean = true; // Add loading flag
  startX: number = 0;
  startY: number = 0;
  constructor(
    private router: Router,
    private sendDataService: SendDataService,
    private editEmployeeDataService: EditEmployeeDataService,
    private snackbarService: SnackbarService,
  ) {}
  ngOnInit(): void {
    this.getEmployeeData();
   
  }

  addEmployeeData() {
    this.router.navigate(['/employee-data']);
  }

  editEmployee(employee: EmployeeDetails): void {
    this.editEmployeeDataService.setEmployeeData(employee); // Use the service to pass data
    this.router.navigate(['/employee-data']); // Navigate to the edit page
  }

  onMouseDown(event: MouseEvent): void {
    this.startX = event.clientX;
    this.startY = event.clientY;
  }
  onMouseUp(event: MouseEvent, index: number, type: 'current' | 'previous'): void {
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
  
    // Check if the swipe is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        // Left swipe
        this.onSwipeLeft(index, type);
      } else {
        // Right swipe
        this.onSwipeRight(index, type);
      }
    }
  }

  onSwipe(event: TouchEvent, index: number, type: 'current' | 'previous'): void {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;
  
    // Check if the swipe is more horizontal than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        // Left swipe
        this.onSwipeLeft(index, type);
      } else {
        // Right swipe
        this.onSwipeRight(index, type);
      }
    }
  }
  
  // Store touch start coordinates
  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  onSwipeLeft(index: number, type: 'current' | 'previous'): void {
    if (type === 'current') {
      this.currentEmployeeArr.forEach((employee, i) => {
        employee.swipedLeft = i === index;
      });
    } else if (type === 'previous') {
      this.previousEmployeeArr.forEach((employee, i) => {
        employee.swipedLeft = i === index;
      });
    }
  }

  onSwipeRight(index: number, type: 'current' | 'previous'): void {
    if (type === 'current') {
      this.currentEmployeeArr[index].swipedLeft = false;
    } else if (type === 'previous') {
      this.previousEmployeeArr[index].swipedLeft = false;
    }
  }
 

  
  // Utility method for deleting from IndexedDB
  deleteEmployee(index: number, type: 'current' | 'previous'): void {
    let deletedEmployee: any = null;
  
    if (type === 'current') {
      deletedEmployee = this.currentEmployeeArr[index];
      this.deleteFromDatabase(deletedEmployee.id).then(() => {
        this.currentEmployeeArr.splice(index, 1);
  
        // Show Snackbar with Undo option
        const snackbarRef = this.snackbarService.showSnackbar('Employee deleted', 'Undo');
        snackbarRef.onAction().subscribe(() => {
          this.undoDelete(deletedEmployee, type); // Call Undo method
        });
      });
    } else if (type === 'previous') {
      deletedEmployee = this.previousEmployeeArr[index];
      this.deleteFromDatabase(deletedEmployee.id).then(() => {
        this.previousEmployeeArr.splice(index, 1);
  
        // Show Snackbar with Undo option
        const snackbarRef = this.snackbarService.showSnackbar('Employee deleted', 'Undo');
        snackbarRef.onAction().subscribe(() => {
          this.undoDelete(deletedEmployee, type); // Call Undo method
        });
      });
    }
  }
  
 
 
  private deleteFromDatabase(employeeId: number): Promise<void> {
    return this.sendDataService.openDatabase().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('employees', 'readwrite');
        const objectStore = transaction.objectStore('employees');
        const request = objectStore.delete(employeeId);
  
        request.onsuccess = () => {
          this.snackbarService.showSnackbar('Employee data has been deleted','close');
          resolve();
        };
  
        request.onerror = (error: any) => {
          console.error('Error deleting employee from IndexedDB', error);
          reject(error);
        };
      });
    });
  }


  undoDelete(deletedEmployee: any, type: 'current' | 'previous'): void {
    this.sendDataService.openDatabase().then((db) => {
      const transaction = db.transaction('employees', 'readwrite');
      const objectStore = transaction.objectStore('employees');
  
      const request = objectStore.add(deletedEmployee); // Add the employee back
  
      request.onsuccess = () => {
        this.snackbarService.showSnackbar('Undo successful', 'close');
  
        // Update the respective array
        if (type === 'current') {
          this.currentEmployeeArr.push(deletedEmployee);
        } else if (type === 'previous') {
          this.previousEmployeeArr.push(deletedEmployee);
        }
      };
  
      request.onerror = (error: any) => {
        console.error('Error restoring employee data', error);
      };
    });
  }
  
  

  getEmployeeData() {
    this.isLoading = true; // Start loading
    this.editEmployeeDataService.clearEmployeeData();

    this.sendDataService
      .openDatabase()
      .then((db) => {
        const transaction = db.transaction('employees', 'readonly');
        const objectStore = transaction.objectStore('employees');

        const request = objectStore.getAll(); // Get all employee records

        request.onsuccess = (event) => {
          const employees = (event.target as IDBRequest).result;
          employees.forEach((employee: any) => {
            if (employee.fromDate && employee.toDate) {
              this.previousEmployeeArr.push(employee); // Both dates present
            } else if (employee.fromDate && !employee.toDate) {
              this.currentEmployeeArr.push(employee); // Only fromDate is present
            }
          });
          this.isLoading = false; // Data loaded

        };

        request.onerror = (error: any) => {
          this.isLoading = false; // Stop loading on error

          console.error('Error retrieving employee data', error);
        };
      })
      .catch((error: any) => {
        this.isLoading = false; // Stop loading if there's an error

        console.error('Error opening the database', error);
      });
  }
}
