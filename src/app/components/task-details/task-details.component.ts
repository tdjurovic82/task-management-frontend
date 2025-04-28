import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterModule} from '@angular/router';
import {TaskService} from '../../services/task.service';
import {CommonModule} from '@angular/common';
import {LocationService} from '../../services/location.service';
import {SafeUrlPipe} from '../../pipes/safe-url.pipe';
import {UserService} from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, RouterModule, SafeUrlPipe, FormsModule],
  standalone: true,
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.css']
})
export class TaskDetailsComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);
  private locationService = inject(LocationService);
  private userService = inject(UserService);

  taskDetails: any;
  isActivated:boolean = false;
  showMap = false;
  mapUrl: string | null = null;
  userSearch = '';
  selectedUser: any = null;


  users: any[] = [];

  ngOnInit(): void {

    this.userService.users$.subscribe(users => {
      this.users = users;
    });



    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.taskService.getTaskDetails(id).subscribe(taskDetails => {
      this.taskDetails = taskDetails;

      this.locationService.isActivated(taskDetails.uprn).subscribe({
        next: (activated) => {
          console.log('typeof isActivated:', typeof this.isActivated, 'value:', this.isActivated);
          this.isActivated = activated;
        },
        error: (err) => {
          console.error('Error checking activation status:', err);
        }
      });

      if (taskDetails.uprn) {
        this.locationService.getLocations([taskDetails.uprn]).subscribe(locations => {
          const location = locations[0];
          if (location) {
            this.taskDetails.location = location;

            if (location.latitude && location.longitude) {
              this.mapUrl = this.generateMapUrl(location.latitude, location.longitude);
              this.showMap = true;
            }

          }
        });
      }

    });
  }
  generateMapUrl(lat: number, lon: number): string {
    return `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;
  }



  filteredUsers(): any[] {
    const term = this.userSearch.toLowerCase();
    return this.users.filter(user => user.name.toLowerCase().includes(term));
  }

  selectUser(user: any) {
    this.userSearch = user.name;
    this.selectedUser = user;
  }

  confirmAssign(): void {
    if (!this.selectedUser) return;

    this.taskService.assignUserToTask(this.taskDetails.id, this.selectedUser.id).subscribe(() => {
      this.taskDetails.assignee = this.selectedUser.name;
      this.taskDetails.userId = this.selectedUser.id;
      this.userSearch = '';
      this.selectedUser = null;
    });
  }
  unassignUser(): void {
    this.taskService.assignUserToTask(this.taskDetails.id, null).subscribe(() => {

      this.taskDetails.assignee = "Unassigned";
      this.taskDetails.userId = null;

    });
  }

  showProvisionForm = false;
  serialNumber = '';
  port = '';
  packageName = '';
  predefinedPackages = [
    'GPON_HOME_BASIC_100MB',
    'GPON_HOME_PLUS_200MB',
    'GPON_HOME_PREMIUM_300MB'
  ];

  onShowProvisionForm(): void {

    this.showProvisionForm = true;


    if (this.taskDetails.uprn) {
      this.locationService.getOltByUprn(this.taskDetails.uprn).subscribe({
        next: (oltName) => {
          this.taskDetails.oltName = oltName;
        },
        error: (err) => {
          console.error('Error fetching OLT', err);
        }
      });
    }
  }



  provisionTask(): void {
    console.log('Provisioning data:', {
      taskId: this.taskDetails.id,
      serialNumber: this.serialNumber,
      port: this.port,
      oltName: this.taskDetails.oltName,
      packageName: this.packageName
    });

    this.taskService.provision(
      this.taskDetails.id,
      this.serialNumber,
      this.port,
      this.taskDetails.oltName,
      this.packageName
    ).subscribe({
      next: (res) => {
        alert(res);
        this.taskDetails.status = 'DONE';
        this.showProvisionForm = false;
        this.isActivated = true;

      },
      error: (err) => {
        console.error('Provisioning failed', err);
        const errorMsg =
          typeof err.error === 'string' ? err.error :
            err.error?.message ? err.error.message :
              err.message || 'Provisioning failed';
        alert(errorMsg);
      }
    });
  }










}
