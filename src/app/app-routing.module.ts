import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-data/employee-list/employee-list.component';
import { AddEmployeeDetailsComponent } from './employee-data/add-employee-details/add-employee-details.component';

const routes: Routes = [
  {path:'',component:EmployeeListComponent},
  {path:'employee-data',component:AddEmployeeDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
