import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SendDataService {

  constructor() { }
  // IndexedDB helper function
 openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open('employeeDB', 1); // Open or create the database

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBRequest).result;
      if (!db.objectStoreNames.contains('employees')) {
        db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onerror = () => reject('Error opening IndexedDB');
    request.onsuccess = (event) => resolve((event.target as IDBRequest).result);
  });
}

}
