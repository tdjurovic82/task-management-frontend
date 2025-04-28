import {Injectable, numberAttribute} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:8080/tasks';

  constructor(private http: HttpClient) {}


  getTasks(filter?: string): Observable<any[]> {
    let url = this.apiUrl;

    if (filter) {
      url += `?filter=${filter}`;
    }

    return this.http.get<any[]>(url);
  }

  getTaskDetails(id: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/details/${id}`);
  }



  updateTaskDescription(id: number, description: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, {
      description
    });
  }

  getStatusSummary() : Observable<any>   {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/task-summary`);
  }

  /*
  updateTaskStatus(id: number, taskStatus: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, taskStatus);
  }
  */

  updateTaskStatus(id: number, taskStatus: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, {
      status: taskStatus
    });
  }

  assignUserToTask(taskId: number, userId: number | null): Observable<any> {
    const assignRequest = {
      taskID: taskId,
      userID: userId
    }
    return this.http.put<any>(`${this.apiUrl}/assign`, assignRequest);
  }

  provision(taskId: number, serialNumber: string, port: string, oltName: string, packageName: string) {
    return this.http.post<any>('http://localhost:8080/activate', {
      taskId,
      serialNumber,
      port,
      oltName,
      packageName
    }, { responseType: 'text' as 'json' });
  }



}
