export class EmployeeDetails{
    id!:number
    employeeName!: string;
    role!: string;
    fromDate!: Date;
    toDate?: Date;
    swipedLeft?: boolean;  // Optional property for swipe state

}