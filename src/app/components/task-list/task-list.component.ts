import { Component, OnInit, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, NgStyle } from '@angular/common';
import { TaskService } from '../../services/task.service';
import {Router, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { LocationService } from '../../services/location.service';
import {SafeUrlPipe} from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, FormsModule, NgClass, NgStyle, SafeUrlPipe],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];

  private taskService = inject(TaskService);
  private userService = inject(UserService);
  private locationService = inject(LocationService);
  private router = inject(Router);
  totalTasks: number = 0;
  selectedTaskLocation: { lat: number, lon: number } | null = null;
  showMap: boolean = false;
  statusSummary: { [key: string]: number } = {};
  allStatuses: string[] = ['OPEN', 'IN_PROGRESS', 'DONE'];

  ngOnInit() {


    this.userService.users$.subscribe(users => {
      this.users = users;

      console.log('Users in TaskComponent:', users);
    });

    this.taskService.getTasks().subscribe(
      data => {
        console.log('Task list:', data);

        this.tasks = data;
        this.totalTasks = data.length;

        this.tasks.map(task => {
          task.assignedUser = this.users.find(u => u.id === task.userId);

          return task;
        });
        this.tasks.forEach(task => {
          task.serialNumber = '';
          task.port = '';
          task.oltName = '';
          task.packageName = '';
          task.showProvisionForm = false;
        });



        // Extract unique UPRNs
        const uniqueUprns = Array.from(new Set(this.tasks.filter(t => t.uprn !== null).map(t => t.uprn)));

        // Fetch locations in one request
        this.locationService.getLocations(uniqueUprns).subscribe(
          locations => {
            // Map location to task by UPRN
            this.tasks.forEach(task => {
              task.location = locations.find((loc: { uprn: any; }) => loc.uprn === task.uprn);
            });
          },
          error => {
            console.error('Error loading locations', error);
          }
        );
      },
      error => {
        console.error('Error loading locations', error);
      }
    );

    this.taskService.getStatusSummary().subscribe(
      summary => {
        console.log('Status summary:', summary);

        this.statusSummary = summary;
      },
      error => {
        console.error('Error loading status summary', error);
      }
    );
  }



  getStatusClass(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'DONE':
        return 'status-done';
      default:
        return '';
    }
  }



  filterByStatus(status?: string) {
    this.taskService.getTasks(status).subscribe(
      data => {
        this.tasks = data;

        this.tasks.map(task => {
          task.assignedUser = this.users.find(u => u.id === task.userId);

          return task;
        });

        // Extract unique UPRNs
        const uniqueUprns = Array.from(new Set(this.tasks.filter(t => t.uprn !== null).map(t => t.uprn)));

        // Fetch locations in one request
        this.locationService.getLocations(uniqueUprns).subscribe(
          locations => {
            // Map location to task by UPRN
            this.tasks.forEach(task => {
              task.location = locations.find((loc: { uprn: any; }) => loc.uprn === task.uprn);
            });
          },
          error => {
            console.error('Error', error);
          }
        );
      },
      error => {
        console.error('Error', error);
      }
    );
  }


  private refreshStatusSummary() {
    this.taskService.getStatusSummary().subscribe({
      next: summary => {
        this.statusSummary = summary;
      },
      error: err => {
        console.error('Error loading', err);
      }
    });
  }



  goToTaskDetails(taskId: number): void {
    this.router.navigate(['/tasks', taskId]);
  }

  saveStatus(task: any) {
    task.status = task.newStatus;
    this.taskService.updateTaskStatus(task.id, task.status).subscribe({
      next: () => {
        task.editingStatus = false;
      },
      error: err => {
        console.error('Error updating status', err);
      }
    });
  }

  cancelStatusEdit(task: any) {
    task.editingStatus = false;
    task.newStatus = task.status;
  }
}



